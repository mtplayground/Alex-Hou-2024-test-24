import {
  Bodies,
  Body,
  Composite,
  Constraint,
  type Composite as MatterComposite,
} from "matter-js";

type Point = {
  x: number;
  y: number;
};

type RenderStyle = {
  fillStyle?: string;
  lineWidth?: number;
  strokeStyle?: string;
};

type RopeConstraintOptions = {
  damping?: number;
  length?: number;
  render?: RenderStyle;
  stiffness?: number;
};

type RopeSegmentOptions = {
  density?: number;
  friction?: number;
  frictionAir?: number;
  render?: RenderStyle;
};

type RopeOptions = {
  constraintOptions?: RopeConstraintOptions;
  endAnchors?: {
    end?: Point;
    start?: Point;
  };
  points: Point[];
  segmentOptions?: RopeSegmentOptions;
  segmentRadius?: number;
  spacing?: number;
};

type PulleyOptions = {
  arcEndAngle?: number;
  arcSegments?: number;
  arcStartAngle?: number;
  bodyOptions?: {
    isStatic?: boolean;
    render?: RenderStyle;
  };
  radius: number;
  x: number;
  y: number;
};

type AttachWeightOptions = {
  at?: "end" | "start";
  constraintOptions?: RopeConstraintOptions;
  offset?: Point;
  render?: RenderStyle;
  rope: ReturnType<typeof createRope>;
  size?: {
    height: number;
    width: number;
  };
};

function interpolatePoint(start: Point, end: Point, progress: number): Point {
  return {
    x: start.x + (end.x - start.x) * progress,
    y: start.y + (end.y - start.y) * progress,
  };
}

function getDistance(start: Point, end: Point) {
  return Math.hypot(end.x - start.x, end.y - start.y);
}

function getArcPoint(
  center: Point,
  radius: number,
  angleRadians: number,
): Point {
  return {
    x: center.x + Math.cos(angleRadians) * radius,
    y: center.y + Math.sin(angleRadians) * radius,
  };
}

function getBodyCenter(body: MatterComposite | Body) {
  if ("position" in body) {
    return body.position;
  }

  throw new Error("Expected a body with a position for rope attachment.");
}

function buildRopePositions(points: Point[], spacing: number) {
  const positions: Point[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];

    if (start === undefined || end === undefined) {
      continue;
    }

    const distance = getDistance(start, end);
    const segmentCount = Math.max(1, Math.ceil(distance / spacing));

    for (
      let segmentIndex = 0;
      segmentIndex <= segmentCount;
      segmentIndex += 1
    ) {
      if (index > 0 && segmentIndex === 0) {
        continue;
      }

      positions.push(interpolatePoint(start, end, segmentIndex / segmentCount));
    }
  }

  return positions;
}

export function createRope({
  constraintOptions,
  endAnchors,
  points,
  segmentOptions,
  segmentRadius = 10,
  spacing = 18,
}: RopeOptions) {
  if (points.length < 2) {
    throw new Error("createRope requires at least two path points.");
  }

  const group = Body.nextGroup(true);
  const positions = buildRopePositions(points, spacing);
  const composite = Composite.create({ label: "rope" });
  const segmentRender = {
    fillStyle: "#334155",
    strokeStyle: "#0f172a",
    lineWidth: 1,
    ...segmentOptions?.render,
  };
  const segments = positions.map((position, index) =>
    Bodies.circle(position.x, position.y, segmentRadius, {
      collisionFilter: { group },
      density: segmentOptions?.density ?? 0.001,
      friction: segmentOptions?.friction ?? 0.02,
      frictionAir: segmentOptions?.frictionAir ?? 0.002,
      label: `rope-segment-${String(index)}`,
      render: segmentRender,
    }),
  );

  const constraints = segments.slice(1).map((segment, index) =>
    Constraint.create({
      bodyA: segments[index],
      bodyB: segment,
      damping: constraintOptions?.damping ?? 0.05,
      length: constraintOptions?.length ?? spacing,
      render: {
        lineWidth: 2,
        strokeStyle: "#475569",
        ...constraintOptions?.render,
      },
      stiffness: constraintOptions?.stiffness ?? 0.95,
    }),
  );

  for (const segment of segments) {
    Composite.add(composite, segment);
  }

  for (const constraint of constraints) {
    Composite.add(composite, constraint);
  }

  const startSegment = segments[0];
  const endSegment = segments[segments.length - 1];

  if (startSegment === undefined || endSegment === undefined) {
    throw new Error("Unable to generate rope segments from the supplied path.");
  }

  if (endAnchors?.start !== undefined) {
    Composite.add(
      composite,
      Constraint.create({
        bodyB: startSegment,
        pointA: endAnchors.start,
        pointB: { x: 0, y: 0 },
        damping: constraintOptions?.damping ?? 0.05,
        render: {
          lineWidth: 2,
          strokeStyle: "#64748b",
          ...constraintOptions?.render,
        },
        stiffness: constraintOptions?.stiffness ?? 0.96,
      }),
    );
  }

  if (endAnchors?.end !== undefined) {
    Composite.add(
      composite,
      Constraint.create({
        bodyB: endSegment,
        pointA: endAnchors.end,
        pointB: { x: 0, y: 0 },
        damping: constraintOptions?.damping ?? 0.05,
        render: {
          lineWidth: 2,
          strokeStyle: "#64748b",
          ...constraintOptions?.render,
        },
        stiffness: constraintOptions?.stiffness ?? 0.96,
      }),
    );
  }

  return {
    composite,
    constraints,
    end: endSegment,
    path: points,
    segments,
    start: startSegment,
  };
}

export function createPulley({
  arcEndAngle = 0,
  arcSegments = 8,
  arcStartAngle = Math.PI,
  bodyOptions,
  radius,
  x,
  y,
}: PulleyOptions) {
  if (arcSegments < 1) {
    throw new Error("createPulley requires at least one arc segment.");
  }

  const wheel = Bodies.circle(x, y, radius, {
    isStatic: bodyOptions?.isStatic ?? true,
    label: "pulley-wheel",
    render: {
      fillStyle: "#cbd5e1",
      strokeStyle: "#475569",
      lineWidth: 4,
      ...bodyOptions?.render,
    },
  });

  const center = { x, y };
  const wrapPoints = Array.from({ length: arcSegments + 1 }, (_, index) =>
    getArcPoint(
      center,
      radius,
      arcStartAngle + ((arcEndAngle - arcStartAngle) * index) / arcSegments,
    ),
  );

  return {
    center,
    composite: Composite.create({
      bodies: [wheel],
      label: "pulley",
    }),
    radius,
    wheel,
    wrapPoints,
  };
}

export function attachWeight({
  at = "end",
  constraintOptions,
  offset = { x: 0, y: 72 },
  render,
  rope,
  size = { height: 72, width: 72 },
}: AttachWeightOptions) {
  const ropeBody = at === "start" ? rope.start : rope.end;
  const ropePoint = getBodyCenter(ropeBody);
  const weight = Bodies.rectangle(
    ropePoint.x + offset.x,
    ropePoint.y + offset.y,
    size.width,
    size.height,
    {
      density: 0.003,
      friction: 0.08,
      label: "attached-weight",
      render: {
        fillStyle: "#f97316",
        strokeStyle: "#7c2d12",
        lineWidth: 2,
        ...render,
      },
    },
  );

  const constraint = Constraint.create({
    bodyA: ropeBody,
    bodyB: weight,
    damping: constraintOptions?.damping ?? 0.08,
    length:
      constraintOptions?.length ??
      Math.max(12, getDistance({ x: 0, y: 0 }, offset) - size.height / 2),
    render: {
      lineWidth: 2,
      strokeStyle: "#475569",
      ...constraintOptions?.render,
    },
    stiffness: constraintOptions?.stiffness ?? 0.92,
  });

  return {
    composite: Composite.create({
      bodies: [weight],
      constraints: [constraint],
      label: "attached-weight",
    }),
    constraint,
    weight,
  };
}
