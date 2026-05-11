import { Bodies, Body, Composite, Engine, type Body as MatterBody } from "matter-js";
import { describe, expect, it } from "vitest";

import {
  attachWeight,
  createPulley,
  createRope,
} from "@/lib/simulation/pulleys";

type SceneFixture = {
  height: number;
  load: MatterBody;
  name: string;
  ropes?: Array<ReturnType<typeof createRope>>;
  step?: () => void;
  width: number;
};

type SimulationBounds = {
  floor?: boolean;
  inset?: number;
  left?: boolean;
  right?: boolean;
  thickness?: number;
  top?: boolean;
};

function createBoundaryBodies(
  width: number,
  height: number,
  bounds: SimulationBounds = {},
) {
  const resolvedBounds = {
    floor: true,
    inset: 0,
    left: true,
    right: true,
    thickness: 72,
    top: false,
    ...bounds,
  };
  const inset = resolvedBounds.inset ?? 0;
  const thickness = resolvedBounds.thickness ?? 72;
  const left = inset - thickness / 2;
  const right = width - inset + thickness / 2;
  const top = inset - thickness / 2;
  const bottom = height - inset + thickness / 2;
  const bodies: MatterBody[] = [];

  if (resolvedBounds.floor !== false) {
    bodies.push(
      Bodies.rectangle(width / 2, bottom, width + thickness * 2, thickness, {
        isStatic: true,
        render: { visible: false },
      }),
    );
  }

  if (resolvedBounds.left !== false) {
    bodies.push(
      Bodies.rectangle(left, height / 2, thickness, height + thickness * 2, {
        isStatic: true,
        render: { visible: false },
      }),
    );
  }

  if (resolvedBounds.right !== false) {
    bodies.push(
      Bodies.rectangle(right, height / 2, thickness, height + thickness * 2, {
        isStatic: true,
        render: { visible: false },
      }),
    );
  }

  if (resolvedBounds.top === true) {
    bodies.push(
      Bodies.rectangle(width / 2, top, width + thickness * 2, thickness, {
        isStatic: true,
        render: { visible: false },
      }),
    );
  }

  return bodies;
}

function createBaseEngine(gravityScale = 0.001) {
  const engine = Engine.create();

  engine.gravity.x = 0;
  engine.gravity.y = gravityScale === 0 ? 0 : 1;
  engine.gravity.scale = gravityScale;

  return engine;
}

function stepScene(engine: Engine, fixture: SceneFixture, frameCount = 120) {
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    fixture.step?.();
    Engine.update(engine, 1000 / 60);
  }
}

function expectBodyInsideViewport(
  body: MatterBody,
  width: number,
  height: number,
  margin = 12,
) {
  expect(body.position.x).toBeGreaterThanOrEqual(margin);
  expect(body.position.x).toBeLessThanOrEqual(width - margin);
  expect(body.position.y).toBeGreaterThanOrEqual(margin);
  expect(body.position.y).toBeLessThanOrEqual(height - margin);
}

function expectWrappedRopeContact(
  rope: ReturnType<typeof createRope>,
  tolerance = 18,
) {
  const pulley = rope.pulley;

  if (pulley === null) {
    throw new Error("Expected rope to be attached to a pulley for wrap test.");
  }

  const midSegment = rope.segments[Math.floor(rope.segments.length / 2)];

  if (midSegment === undefined) {
    throw new Error("Expected rope to expose at least one segment.");
  }

  const distanceToPulley = Math.hypot(
    midSegment.position.x - pulley.center.x,
    midSegment.position.y - pulley.center.y,
  );

  expect(distanceToPulley).toBeLessThanOrEqual(pulley.radius + tolerance);
}

function buildLessonPulleyDemoFixture() {
  const width = 560;
  const height = 280;
  const engine = createBaseEngine();
  const pulley = createPulley({
    radius: 40,
    x: 280,
    y: 96,
  });
  const rope = createRope({
    endAnchors: {
      start: { x: 134, y: 70 },
    },
    endPoint: { x: 402, y: 182 },
    segmentRadius: 7,
    spacing: 16,
    startPoint: { x: 134, y: 70 },
  });
  pulley.attachRope(rope);
  const weight = attachWeight({
    offset: { x: 0, y: 60 },
    rope,
    size: { height: 72, width: 72 },
  });

  Composite.add(engine.world, createBoundaryBodies(width, height));
  Composite.add(engine.world, [
    Bodies.rectangle(280, 28, 520, 24, {
      isStatic: true,
      render: { fillStyle: "#e2e8f0" },
    }),
    Bodies.circle(134, 70, 10, {
      isStatic: true,
      render: { fillStyle: "#f8fafc" },
    }),
  ]);
  Composite.add(engine.world, [
    pulley.composite,
    rope.composite,
    weight.composite,
  ]);

  return {
    engine,
    fixture: {
      height,
      load: weight.weight,
      name: "lesson pulley demo",
      ropes: [rope],
      width,
    } satisfies SceneFixture,
  };
}

function buildBucketLiftFixture() {
  const width = 620;
  const height = 360;
  const engine = createBaseEngine();
  const pulley = createPulley({
    radius: 42,
    x: 292,
    y: 112,
  });
  const rope = createRope({
    endAnchors: {
      start: { x: 152, y: 76 },
    },
    endPoint: { x: 454, y: 214 },
    segmentRadius: 7,
    spacing: 16,
    startPoint: { x: 152, y: 76 },
  });
  pulley.attachRope(rope);
  const weight = attachWeight({
    offset: { x: 0, y: 70 },
    render: {
      fillStyle: "#38bdf8",
      lineWidth: 3,
      strokeStyle: "#0f172a",
    },
    rope,
    size: { height: 86, width: 70 },
  });

  Composite.add(engine.world, createBoundaryBodies(width, height));
  Composite.add(engine.world, [
    Bodies.rectangle(310, 28, 560, 24, {
      isStatic: true,
      render: { fillStyle: "#e2e8f0" },
    }),
    Bodies.circle(152, 76, 9, {
      isStatic: true,
      render: { fillStyle: "#f8fafc" },
    }),
    Bodies.rectangle(116, 246, 84, 10, {
      isStatic: true,
      render: { fillStyle: "#fbbf24" },
    }),
  ]);
  Composite.add(engine.world, [
    pulley.composite,
    rope.composite,
    weight.composite,
  ]);

  return {
    engine,
    fixture: {
      height,
      load: weight.weight,
      name: "bucket lift widget",
      ropes: [rope],
      width,
    } satisfies SceneFixture,
  };
}

function buildFixedPulleySandboxFixture() {
  const width = 640;
  const height = 360;
  const engine = createBaseEngine();
  const pulley = createPulley({
    radius: 42,
    x: 310,
    y: 112,
  });
  const rope = createRope({
    endAnchors: {
      start: { x: 162, y: 78 },
    },
    endPoint: { x: 478, y: 214 },
    segmentRadius: 7,
    spacing: 16,
    startPoint: { x: 162, y: 78 },
  });
  pulley.attachRope(rope);
  const weight = attachWeight({
    offset: { x: 0, y: 72 },
    render: {
      fillStyle: "#f59e0b",
      lineWidth: 3,
      strokeStyle: "#78350f",
    },
    rope,
    size: {
      height: 62 + 3 * 6,
      width: 58 + 3 * 4,
    },
  });

  Body.setMass(weight.weight, 3);
  Composite.add(engine.world, createBoundaryBodies(width, height));
  Composite.add(engine.world, [
    Bodies.rectangle(320, 28, 590, 24, {
      isStatic: true,
      render: { fillStyle: "#0f172a" },
    }),
    Bodies.circle(162, 78, 9, {
      isStatic: true,
      render: { fillStyle: "#0f172a" },
    }),
    Bodies.rectangle(120, 264, 92, 10, {
      isStatic: true,
      render: { fillStyle: "#cbd5e1" },
    }),
  ]);
  Composite.add(engine.world, [
    pulley.composite,
    rope.composite,
    weight.composite,
  ]);

  return {
    engine,
    fixture: {
      height,
      load: weight.weight,
      name: "fixed pulley sandbox",
      ropes: [rope],
      width,
    } satisfies SceneFixture,
  };
}

function buildMovablePulleyCompareFixture() {
  const width = 640;
  const height = 280;
  const engine = createBaseEngine();
  const pulley = createPulley({
    radius: 40,
    x: 310,
    y: 96,
  });
  const rope = createRope({
    endAnchors: {
      start: { x: 170, y: 68 },
    },
    endPoint: { x: 444, y: 172 },
    segmentRadius: 7,
    spacing: 16,
    startPoint: { x: 170, y: 68 },
  });
  pulley.attachRope(rope);
  const weight = attachWeight({
    offset: { x: 0, y: 58 },
    rope,
    size: { height: 74, width: 74 },
  });

  Composite.add(engine.world, createBoundaryBodies(width, height));
  Composite.add(engine.world, [
    Bodies.rectangle(320, 28, 590, 24, {
      isStatic: true,
      render: { fillStyle: "#0f172a" },
    }),
    Bodies.circle(170, 68, 9, {
      isStatic: true,
      render: { fillStyle: "#0f172a" },
    }),
  ]);
  Composite.add(engine.world, [
    pulley.composite,
    rope.composite,
    weight.composite,
  ]);

  return {
    engine,
    fixture: {
      height,
      load: weight.weight,
      name: "movable pulley compare fixed-side scene",
      ropes: [rope],
      width,
    } satisfies SceneFixture,
  };
}

function buildMovablePulleySandboxFixture() {
  const width = 640;
  const height = 360;
  const engine = createBaseEngine(0);
  const pulleyRadius = 42;
  const basePulleyY = 194;
  const wheel = Bodies.circle(318, basePulleyY, pulleyRadius, {
    render: {
      fillStyle: "#cbd5e1",
      lineWidth: 4,
      strokeStyle: "#475569",
    },
  });
  const weight = Bodies.rectangle(318, basePulleyY + 86, 84, 84, {
    render: {
      fillStyle: "#22c55e",
      lineWidth: 3,
      strokeStyle: "#14532d",
    },
  });
  const ropeEnd = Bodies.circle(472, 118, 16, {
    inertia: Infinity,
    label: "movable-rope-end",
    render: {
      fillStyle: "#0ea5e9",
      lineWidth: 3,
      strokeStyle: "#0f172a",
    },
  });
  const ropeEndHome = {
    x: ropeEnd.position.x,
    y: ropeEnd.position.y,
  };
  const baseBucketY = weight.position.y;

  Composite.add(engine.world, createBoundaryBodies(width, height, { inset: 10 }));
  Composite.add(engine.world, [
    Bodies.rectangle(320, 28, 600, 24, {
      isStatic: true,
      render: { fillStyle: "#0f172a" },
    }),
    wheel,
    weight,
    ropeEnd,
  ]);

  return {
    engine,
    fixture: {
      height,
      load: weight,
      name: "movable pulley sandbox",
      step: () => {
        const pullDistance = Math.max(0, ropeEnd.position.y - ropeEndHome.y);
        const bucketRise = pullDistance / 2;

        Body.setPosition(ropeEnd, {
          x: ropeEndHome.x,
          y: ropeEnd.position.y,
        });
        Body.setVelocity(ropeEnd, { x: 0, y: ropeEnd.velocity.y });
        Body.setPosition(wheel, {
          x: wheel.position.x,
          y: basePulleyY - bucketRise,
        });
        Body.setVelocity(wheel, { x: 0, y: 0 });
        Body.setPosition(weight, {
          x: weight.position.x,
          y: baseBucketY - bucketRise,
        });
        Body.setVelocity(weight, { x: 0, y: 0 });
      },
      width,
    } satisfies SceneFixture,
  };
}

const sceneBuilders = [
  buildLessonPulleyDemoFixture,
  buildBucketLiftFixture,
  buildFixedPulleySandboxFixture,
  buildMovablePulleyCompareFixture,
  buildMovablePulleySandboxFixture,
];

describe("fixed engine regression smoke tests", () => {
  it.each(sceneBuilders)(
    "keeps %s load within the viewport after 2 simulated seconds",
    (buildScene) => {
      const { engine, fixture } = buildScene();

      stepScene(engine, fixture);
      expectBodyInsideViewport(
        fixture.load,
        fixture.width,
        fixture.height,
      );
    },
  );

  it.each([
    buildLessonPulleyDemoFixture,
    buildBucketLiftFixture,
    buildFixedPulleySandboxFixture,
    buildMovablePulleyCompareFixture,
  ])(
    "keeps %s rope contact close to the pulley radius",
    (buildScene) => {
      const { engine, fixture } = buildScene();

      stepScene(engine, fixture);

      for (const rope of fixture.ropes ?? []) {
        expectWrappedRopeContact(rope);
      }
    },
  );
});
