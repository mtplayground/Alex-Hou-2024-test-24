import {
  Bodies,
  Body,
  Composite,
  Constraint,
  Vector,
  type Body as MatterBody,
  type Composite as MatterComposite,
  type Constraint as MatterConstraint,
} from "matter-js";

type Point = {
  x: number;
  y: number;
};

type RenderStyle = {
  fillStyle?: string;
  lineWidth?: number;
  strokeStyle?: string;
  visible?: boolean;
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

export type RopeOverlayStyle = {
  color?: string;
  shadowBlur?: number;
  shadowColor?: string;
  width?: number;
};

type RopeOptions = {
  constraintOptions?: RopeConstraintOptions;
  endAnchors?: {
    end?: Point;
    start?: Point;
  };
  endPoint: Point;
  renderStyle?: RopeOverlayStyle;
  segmentOptions?: RopeSegmentOptions;
  segmentRadius?: number;
  spacing?: number;
  startPoint: Point;
};

type PulleyOptions = {
  arcEndAngle?: number;
  arcSegments?: number;
  arcStartAngle?: number;
  bodyOptions?: {
    density?: number;
    frictionAir?: number;
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

type RopeBranch = {
  constraints: MatterConstraint[];
  innerConstraint: MatterConstraint;
  outerConstraint: MatterConstraint | null;
  outerPoint: Point;
  segments: MatterBody[];
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

function clamp(min: number, value: number, max: number) {
  return Math.min(max, Math.max(min, value));
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

function createBranchSegments(
  positions: Point[],
  group: number,
  segmentOptions: RopeSegmentOptions | undefined,
  segmentRadius: number,
) {
  const segmentRender = {
    fillStyle: "#334155",
    strokeStyle: "#0f172a",
    lineWidth: 1,
    visible: false,
    ...segmentOptions?.render,
  };

  return positions.map((position, index) =>
    Bodies.circle(position.x, position.y, segmentRadius, {
      collisionFilter: { group },
      density: segmentOptions?.density ?? 0.001,
      friction: segmentOptions?.friction ?? 0.02,
      frictionAir: segmentOptions?.frictionAir ?? 0.002,
      label: `rope-segment-${String(index)}`,
      render: segmentRender,
    }),
  );
}

function createBranchConstraints(
  segments: MatterBody[],
  constraintOptions: RopeConstraintOptions | undefined,
  spacing: number,
) {
  return segments.slice(1).map((segment, index) =>
    Constraint.create({
      bodyA: segments[index],
      bodyB: segment,
      damping: constraintOptions?.damping ?? 0.05,
      length: constraintOptions?.length ?? spacing,
      render: {
        lineWidth: 2,
        strokeStyle: "#475569",
        visible: false,
        ...constraintOptions?.render,
      },
      stiffness: constraintOptions?.stiffness ?? 0.95,
    }),
  );
}

function setConstraintLength(constraint: MatterConstraint, start: Point, end: Point) {
  constraint.length = getDistance(start, end);
}

function setBodyPosition(body: MatterBody, point: Point) {
  Body.setPosition(body, Vector.create(point.x, point.y));
  Body.setVelocity(body, Vector.create(0, 0));
  Body.setAngularVelocity(body, 0);
}

function repositionBranch(
  branch: RopeBranch,
  innerPoint: Point,
  spacing: number,
  wheel: MatterBody | null = null,
) {
  const positions = buildRopePositions(
    [branch.outerPoint, innerPoint],
    spacing,
  );
  const lastIndex = branch.segments.length - 1;

  for (let index = 0; index < branch.segments.length; index += 1) {
    const segment = branch.segments[index];
    const fallbackPosition =
      lastIndex <= 0
        ? branch.outerPoint
        : interpolatePoint(branch.outerPoint, innerPoint, index / lastIndex);
    const nextPosition = positions[index] ?? fallbackPosition;

    if (segment === undefined) {
      continue;
    }

    setBodyPosition(segment, nextPosition);
  }

  for (const constraint of branch.constraints) {
    const bodyA = constraint.bodyA;
    const bodyB = constraint.bodyB;

    if (bodyA === null || bodyB === null) {
      continue;
    }

    setConstraintLength(constraint, bodyA.position, bodyB.position);
  }

  const outerSegment = branch.segments[0];
  const innerSegment = branch.segments[lastIndex];

  if (branch.outerConstraint !== null && outerSegment !== undefined) {
    if (branch.outerConstraint.bodyA === null) {
      branch.outerConstraint.pointA = branch.outerPoint;
    } else {
      branch.outerConstraint.pointA = { x: 0, y: 0 };
    }

    setConstraintLength(branch.outerConstraint, branch.outerPoint, outerSegment.position);
  }

  if (innerSegment === undefined) {
    return;
  }

  if (wheel === null) {
    branch.innerConstraint.bodyA = null;
    branch.innerConstraint.pointA = innerPoint;
    setConstraintLength(branch.innerConstraint, innerPoint, innerSegment.position);

    return;
  }

  branch.innerConstraint.bodyA = wheel;
  branch.innerConstraint.pointA = {
    x: innerPoint.x - wheel.position.x,
    y: innerPoint.y - wheel.position.y,
  };
  setConstraintLength(branch.innerConstraint, innerPoint, innerSegment.position);
}

function pickTangentPoint(
  center: Point,
  radius: number,
  endpoint: Point,
  preferredSide: -1 | 1,
) {
  const dx = endpoint.x - center.x;
  const dy = endpoint.y - center.y;
  const distanceSquared = dx * dx + dy * dy;
  const distance = Math.sqrt(distanceSquared);

  if (distance <= radius + 1) {
    return {
      x: center.x + preferredSide * radius,
      y: center.y,
    };
  }

  const scale = (radius * radius) / distanceSquared;
  const offsetScale =
    (radius * Math.sqrt(distanceSquared - radius * radius)) / distanceSquared;
  const perpendicular = { x: -dy, y: dx };
  const candidateA = {
    x: center.x + dx * scale + perpendicular.x * offsetScale,
    y: center.y + dy * scale + perpendicular.y * offsetScale,
  };
  const candidateB = {
    x: center.x + dx * scale - perpendicular.x * offsetScale,
    y: center.y + dy * scale - perpendicular.y * offsetScale,
  };

  return preferredSide < 0
    ? candidateA.x < candidateB.x
      ? candidateA
      : candidateB
    : candidateA.x > candidateB.x
      ? candidateA
      : candidateB;
}

export function createRope({
  constraintOptions,
  endAnchors,
  endPoint,
  renderStyle,
  segmentOptions,
  segmentRadius = 10,
  spacing = 18,
  startPoint,
}: RopeOptions) {
  const group = Body.nextGroup(true);
  const composite = Composite.create({ label: "rope" });
  const initialInnerPoints = {
    end: {
      x: startPoint.x + (endPoint.x - startPoint.x) * 0.6,
      y: startPoint.y + (endPoint.y - startPoint.y) * 0.35,
    },
    start: {
      x: startPoint.x + (endPoint.x - startPoint.x) * 0.4,
      y: startPoint.y + (endPoint.y - startPoint.y) * 0.35,
    },
  };
  const startPositions = buildRopePositions(
    [startPoint, initialInnerPoints.start],
    spacing,
  );
  const endPositions = buildRopePositions(
    [initialInnerPoints.end, endPoint],
    spacing,
  );
  const startSegments = createBranchSegments(
    startPositions,
    group,
    segmentOptions,
    segmentRadius,
  );
  const endSegments = createBranchSegments(
    endPositions,
    group,
    segmentOptions,
    segmentRadius,
  );
  const startConstraints = createBranchConstraints(
    startSegments,
    constraintOptions,
    spacing,
  );
  const endConstraints = createBranchConstraints(
    endSegments,
    constraintOptions,
    spacing,
  );
  const startOuterConstraint =
    endAnchors?.start === undefined
      ? null
      : Constraint.create({
          bodyB: startSegments[0],
          damping: constraintOptions?.damping ?? 0.05,
          pointA: endAnchors.start,
          pointB: { x: 0, y: 0 },
          render: {
            lineWidth: 2,
            strokeStyle: "#64748b",
            visible: false,
            ...constraintOptions?.render,
          },
          stiffness: constraintOptions?.stiffness ?? 0.96,
        });
  const endOuterConstraint =
    endAnchors?.end === undefined
      ? null
      : Constraint.create({
          bodyB: endSegments[endSegments.length - 1],
          damping: constraintOptions?.damping ?? 0.05,
          pointA: endAnchors.end,
          pointB: { x: 0, y: 0 },
          render: {
            lineWidth: 2,
            strokeStyle: "#64748b",
            visible: false,
            ...constraintOptions?.render,
          },
          stiffness: constraintOptions?.stiffness ?? 0.96,
        });
  const startInnerConstraint = Constraint.create({
    bodyB: startSegments[startSegments.length - 1],
    damping: constraintOptions?.damping ?? 0.05,
    pointA: initialInnerPoints.start,
    pointB: { x: 0, y: 0 },
    render: {
      lineWidth: 2,
      strokeStyle: "#64748b",
      visible: false,
      ...constraintOptions?.render,
    },
    stiffness: constraintOptions?.stiffness ?? 0.96,
  });
  const endInnerConstraint = Constraint.create({
    bodyB: endSegments[0],
    damping: constraintOptions?.damping ?? 0.05,
    pointA: initialInnerPoints.end,
    pointB: { x: 0, y: 0 },
    render: {
      lineWidth: 2,
      strokeStyle: "#64748b",
      visible: false,
      ...constraintOptions?.render,
    },
    stiffness: constraintOptions?.stiffness ?? 0.96,
  });

  for (const segment of [...startSegments, ...endSegments]) {
    Composite.add(composite, segment);
  }

  for (const constraint of [
    ...startConstraints,
    ...endConstraints,
    startInnerConstraint,
    endInnerConstraint,
  ]) {
    Composite.add(composite, constraint);
  }

  if (startOuterConstraint !== null) {
    Composite.add(composite, startOuterConstraint);
  }

  if (endOuterConstraint !== null) {
    Composite.add(composite, endOuterConstraint);
  }

  const startSegment = startSegments[0];
  const endSegment = endSegments[endSegments.length - 1];

  if (startSegment === undefined || endSegment === undefined) {
    throw new Error("Unable to generate rope segments from the supplied endpoints.");
  }

  const rope = {
    branches: {
      end: {
        constraints: endConstraints,
        innerConstraint: endInnerConstraint,
        outerConstraint: endOuterConstraint,
        outerPoint: endPoint,
        segments: endSegments,
      },
      start: {
        constraints: startConstraints,
        innerConstraint: startInnerConstraint,
        outerConstraint: startOuterConstraint,
        outerPoint: startPoint,
        segments: startSegments,
      },
    },
    composite,
    constraints: [
      ...startConstraints,
      ...endConstraints,
      startInnerConstraint,
      endInnerConstraint,
      ...(startOuterConstraint === null ? [] : [startOuterConstraint]),
      ...(endOuterConstraint === null ? [] : [endOuterConstraint]),
    ],
    contactPoints: {
      end: initialInnerPoints.end,
      start: initialInnerPoints.start,
    },
    end: endSegment,
    pulley: null as null | {
      center: Point;
      radius: number;
    },
    renderStyle: {
      color: "#334155",
      shadowBlur: 10,
      shadowColor: "rgba(15, 23, 42, 0.2)",
      width: segmentRadius * 1.5,
      ...renderStyle,
    },
    segmentRadius,
    segments: [...startSegments, ...endSegments],
    spacing,
    start: startSegment,
    updateContacts(contactPoints: { end: Point; start: Point }, wheel: MatterBody | null = null) {
      rope.contactPoints = contactPoints;
      repositionBranch(rope.branches.start, contactPoints.start, spacing, wheel);
      repositionBranch(rope.branches.end, contactPoints.end, spacing, wheel);
    },
  };

  return rope;
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
    density: bodyOptions?.density ?? 0.004,
    frictionAir: bodyOptions?.frictionAir ?? 0.01,
    isStatic: bodyOptions?.isStatic ?? false,
    label: "pulley-wheel",
    render: {
      fillStyle: "#cbd5e1",
      strokeStyle: "#475569",
      lineWidth: 4,
      ...bodyOptions?.render,
    },
  });
  const axle = Constraint.create({
    bodyB: wheel,
    damping: 0.04,
    length: 0,
    pointA: { x, y },
    pointB: { x: 0, y: 0 },
    render: {
      lineWidth: 2,
      strokeStyle: "#94a3b8",
    },
    stiffness: 1,
  });
  const center = { x, y };
  const wrapPoints = Array.from({ length: arcSegments + 1 }, (_, index) =>
    getArcPoint(
      center,
      radius,
      arcStartAngle + ((arcEndAngle - arcStartAngle) * index) / arcSegments,
    ),
  );
  const composite = Composite.create({
    bodies: [wheel],
    constraints: [axle],
    label: "pulley",
  });

  function attachRope(rope: ReturnType<typeof createRope>) {
    const startSide = rope.branches.start.outerPoint.x <= center.x ? -1 : 1;
    const endSide = rope.branches.end.outerPoint.x <= center.x ? -1 : 1;
    const startContact = pickTangentPoint(
      center,
      radius,
      rope.branches.start.outerPoint,
      startSide,
    );
    const endContact = pickTangentPoint(
      center,
      radius,
      rope.branches.end.outerPoint,
      endSide,
    );
    const clampedStart = {
      x:
        center.x +
        clamp(-radius, startContact.x - center.x, radius),
      y:
        center.y +
        clamp(-radius, startContact.y - center.y, radius),
    };
    const clampedEnd = {
      x:
        center.x +
        clamp(-radius, endContact.x - center.x, radius),
      y:
        center.y +
        clamp(-radius, endContact.y - center.y, radius),
    };

    rope.updateContacts(
      {
        end: clampedEnd,
        start: clampedStart,
      },
      wheel,
    );
    rope.pulley = {
      center,
      radius,
    };

    return {
      end: clampedEnd,
      start: clampedStart,
    };
  }

  return {
    attachRope,
    axle,
    center,
    composite,
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
