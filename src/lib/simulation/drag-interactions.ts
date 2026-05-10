import {
  Body,
  Composite,
  Constraint,
  Query,
  Vector,
  type Body as MatterBody,
  type Constraint as MatterConstraint,
  type Engine,
} from "matter-js";

type Point = {
  x: number;
  y: number;
};

export type SimulationDragTarget = {
  body: MatterBody;
  id?: string;
  label?: string;
  snapBack?: {
    anchor: Point;
    damping?: number;
    length?: number;
    stiffness?: number;
  };
};

export type SimulationInteractionConfig = {
  draggableBodies: SimulationDragTarget[];
  momentumScale?: number;
};

type ManagedDragTarget = SimulationDragTarget & {
  snapBackConstraint: MatterConstraint | null;
};

type ActiveDrag = {
  body: MatterBody;
  offset: Point;
  pointerId: number;
  target: ManagedDragTarget;
  velocity: Point;
  timestamp: number;
  worldPoint: Point;
};

function createSnapBackConstraint(target: SimulationDragTarget) {
  if (target.snapBack === undefined) {
    return undefined;
  }

  return Constraint.create({
    bodyB: target.body,
    damping: target.snapBack.damping ?? 0.11,
    length: target.snapBack.length ?? 0,
    pointA: target.snapBack.anchor,
    render: {
      visible: false,
    },
    stiffness: target.snapBack.stiffness ?? 0.02,
  });
}

function scaleVelocity(delta: Point, durationMs: number) {
  const frameDuration = 1000 / 60;
  const safeDuration = Math.max(durationMs, 8);

  return {
    x: (delta.x / safeDuration) * frameDuration,
    y: (delta.y / safeDuration) * frameDuration,
  };
}

export function createDragInteractionManager(engine: Engine) {
  let activeDrag: ActiveDrag | null = null;
  let momentumScale = 0.92;
  let targets: ManagedDragTarget[] = [];

  function removeSnapBackConstraint(target: ManagedDragTarget) {
    if (target.snapBackConstraint !== null) {
      Composite.remove(engine.world, target.snapBackConstraint);
    }
  }

  function addSnapBackConstraint(target: ManagedDragTarget) {
    if (
      target.snapBackConstraint !== null &&
      !Composite.allConstraints(engine.world).includes(
        target.snapBackConstraint,
      )
    ) {
      Composite.add(engine.world, target.snapBackConstraint);
    }
  }

  function teardownTargets() {
    for (const target of targets) {
      removeSnapBackConstraint(target);
    }

    targets = [];
  }

  function configure(config: SimulationInteractionConfig | null) {
    activeDrag = null;
    teardownTargets();
    momentumScale = config?.momentumScale ?? 0.92;

    if (config === null) {
      return;
    }

    targets = config.draggableBodies.map((target) => ({
      ...target,
      snapBackConstraint: createSnapBackConstraint(target) ?? null,
    }));

    for (const target of targets) {
      addSnapBackConstraint(target);
    }
  }

  function findTarget(worldPoint: Point) {
    const draggableBodies = targets.map((target) => target.body);
    const hits = Query.point(draggableBodies, worldPoint);

    if (hits.length === 0) {
      return null;
    }

    const topHit = hits[hits.length - 1];

    if (topHit === undefined) {
      return null;
    }

    return targets.find((target) => target.body.id === topHit.id) ?? null;
  }

  function startDrag(pointerId: number, worldPoint: Point, timestamp: number) {
    const target = findTarget(worldPoint);

    if (target === null) {
      return false;
    }

    removeSnapBackConstraint(target);
    Body.setVelocity(target.body, Vector.create(0, 0));
    Body.setAngularVelocity(target.body, 0);

    activeDrag = {
      body: target.body,
      offset: {
        x: target.body.position.x - worldPoint.x,
        y: target.body.position.y - worldPoint.y,
      },
      pointerId,
      target,
      timestamp,
      velocity: { x: 0, y: 0 },
      worldPoint,
    };

    return true;
  }

  function moveDrag(pointerId: number, worldPoint: Point, timestamp: number) {
    if (activeDrag === null || activeDrag.pointerId !== pointerId) {
      return false;
    }

    const nextPoint = {
      x: worldPoint.x + activeDrag.offset.x,
      y: worldPoint.y + activeDrag.offset.y,
    };
    const delta = {
      x: nextPoint.x - activeDrag.body.position.x,
      y: nextPoint.y - activeDrag.body.position.y,
    };
    const nextVelocity = scaleVelocity(delta, timestamp - activeDrag.timestamp);

    Body.setPosition(activeDrag.body, Vector.create(nextPoint.x, nextPoint.y));
    Body.setVelocity(
      activeDrag.body,
      Vector.create(nextVelocity.x, nextVelocity.y),
    );
    Body.setAngularVelocity(activeDrag.body, 0);

    activeDrag = {
      ...activeDrag,
      timestamp,
      velocity: nextVelocity,
      worldPoint,
    };

    return true;
  }

  function endDrag(pointerId: number) {
    if (activeDrag === null || activeDrag.pointerId !== pointerId) {
      return false;
    }

    Body.setVelocity(
      activeDrag.body,
      Vector.create(
        activeDrag.velocity.x * momentumScale,
        activeDrag.velocity.y * momentumScale,
      ),
    );
    addSnapBackConstraint(activeDrag.target);
    activeDrag = null;

    return true;
  }

  function cancelDrag() {
    if (activeDrag === null) {
      return false;
    }

    addSnapBackConstraint(activeDrag.target);
    activeDrag = null;

    return true;
  }

  function hasTargets() {
    return targets.length > 0;
  }

  function destroy() {
    cancelDrag();
    teardownTargets();
  }

  return {
    cancelDrag,
    configure,
    destroy,
    endDrag,
    hasTargets,
    startDrag,
    moveDrag,
  };
}
