export type Point = {
  x: number;
  y: number;
};

export type PulleyCircle = {
  center: Point;
  radius: number;
};

export type ArcSweep = {
  deltaAngle: number;
  endAngle: number;
  largeArcFlag: 0 | 1;
  startAngle: number;
  sweepFlag: 0 | 1;
};

export type RopePathPulley = PulleyCircle;

export type RopePathConfig = {
  handle: Point;
  load: Point;
  pulleys: RopePathPulley[];
};

export type RopePathFixedConfig = {
  handleEnd: Point;
  loadEnd: Point;
  pulley: RopePathPulley;
};

export type RopePathMovableConfig = {
  handleEnd: Point;
  pulley: RopePathPulley;
  upperAnchorL: Point;
  upperAnchorR: Point;
};

export type RopePathCompoundConfig = {
  handleEnd: Point;
  loadEnd: Point;
  lowerPulleys: RopePathPulley[];
  upperPulleys: RopePathPulley[];
};

const TWO_PI = Math.PI * 2;
const EPSILON = 1e-6;

function normalizeAngle(angle: number) {
  let normalized = angle % TWO_PI;

  if (normalized < 0) {
    normalized += TWO_PI;
  }

  return normalized;
}

function shortestAngleDelta(startAngle: number, endAngle: number) {
  let delta = normalizeAngle(endAngle) - normalizeAngle(startAngle);

  if (delta > Math.PI) {
    delta -= TWO_PI;
  } else if (delta < -Math.PI) {
    delta += TWO_PI;
  }

  return delta;
}

function distanceBetween(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pointToSvg(point: Point) {
  return `${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
}

function pointAngle(center: Point, point: Point) {
  return Math.atan2(point.y - center.y, point.x - center.x);
}

function leftTangent(pulley: RopePathPulley): Point {
  return {
    x: pulley.center.x - pulley.radius,
    y: pulley.center.y,
  };
}

function rightTangent(pulley: RopePathPulley): Point {
  return {
    x: pulley.center.x + pulley.radius,
    y: pulley.center.y,
  };
}

function arcCommand(
  radius: number,
  largeArcFlag: 0 | 1,
  sweepFlag: 0 | 1,
  destination: Point,
) {
  return `A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 ${String(
    largeArcFlag,
  )} ${String(sweepFlag)} ${pointToSvg(destination)}`;
}

function appendPulleyWrap(
  commands: string[],
  pulley: RopePathPulley,
  startSide: "left" | "right",
  arcSide: "upper" | "lower",
) {
  const entry = startSide === "left" ? leftTangent(pulley) : rightTangent(pulley);
  const exit = startSide === "left" ? rightTangent(pulley) : leftTangent(pulley);
  const sweepFlag =
    arcSide === "upper"
      ? startSide === "left"
        ? 1
        : 0
      : startSide === "left"
        ? 0
        : 1;

  commands.push(`L ${pointToSvg(entry)}`);
  commands.push(arcCommand(pulley.radius, 1, sweepFlag, exit));

  return exit;
}

/**
 * @deprecated Use the explicit per-type rope path generators instead.
 */
function chooseArcTangents(
  from: Point,
  to: Point,
  circleCenter: Point,
  radius: number,
) {
  const entryOptions = tangentPoints(from, circleCenter, radius);
  const exitOptions = tangentPoints(to, circleCenter, radius);

  if (!entryOptions || !exitOptions) {
    return null;
  }

  let bestPair:
    | {
        arc: ArcSweep;
        entry: Point;
        exit: Point;
        score: number;
      }
    | null = null;

  for (const entry of entryOptions) {
    for (const exit of exitOptions) {
      const arc = arcSweep(circleCenter, radius, entry, exit);
      const score =
        Math.abs(arc.deltaAngle) * radius +
        distanceBetween(from, entry) +
        distanceBetween(exit, to);

      if (!bestPair || score < bestPair.score) {
        bestPair = {
          arc,
          entry,
          exit,
          score,
        };
      }
    }
  }

  return bestPair;
}

export function tangentPoints(
  externalPoint: Point,
  circleCenter: Point,
  radius: number,
): [Point, Point] | null {
  if (!Number.isFinite(radius) || radius <= 0) {
    return null;
  }

  const dx = externalPoint.x - circleCenter.x;
  const dy = externalPoint.y - circleCenter.y;
  const distanceSquared = dx * dx + dy * dy;
  const radiusSquared = radius * radius;

  if (distanceSquared <= radiusSquared + EPSILON) {
    return null;
  }

  const baseScale = radiusSquared / distanceSquared;
  const offsetScale =
    (radius * Math.sqrt(distanceSquared - radiusSquared)) / distanceSquared;

  const tangentA = {
    x: circleCenter.x + baseScale * dx - offsetScale * dy,
    y: circleCenter.y + baseScale * dy + offsetScale * dx,
  };
  const tangentB = {
    x: circleCenter.x + baseScale * dx + offsetScale * dy,
    y: circleCenter.y + baseScale * dy - offsetScale * dx,
  };

  return pointAngle(circleCenter, tangentA) <= pointAngle(circleCenter, tangentB)
    ? [tangentA, tangentB]
    : [tangentB, tangentA];
}

export function arcSweep(
  circleCenter: Point,
  radius: number,
  tangentA: Point,
  tangentB: Point,
): ArcSweep {
  if (!Number.isFinite(radius) || radius <= 0) {
    return {
      deltaAngle: 0,
      endAngle: 0,
      largeArcFlag: 0,
      startAngle: 0,
      sweepFlag: 0,
    };
  }

  const startAngle = pointAngle(circleCenter, tangentA);
  const endAngle = pointAngle(circleCenter, tangentB);
  const deltaAngle = shortestAngleDelta(startAngle, endAngle);

  return {
    deltaAngle,
    endAngle,
    largeArcFlag: Math.abs(deltaAngle) > Math.PI ? 1 : 0,
    startAngle,
    sweepFlag: deltaAngle >= 0 ? 1 : 0,
  };
}

export function ropePathFixed({
  handleEnd,
  loadEnd,
  pulley,
}: RopePathFixedConfig) {
  const commands = [`M ${pointToSvg(handleEnd)}`];

  appendPulleyWrap(commands, pulley, "right", "upper");
  commands.push(`L ${pointToSvg(loadEnd)}`);

  return commands.join(" ");
}

export function ropePathMovable({
  handleEnd,
  pulley,
  upperAnchorL,
  upperAnchorR,
}: RopePathMovableConfig) {
  const commands = [`M ${pointToSvg(upperAnchorL)}`];

  appendPulleyWrap(commands, pulley, "left", "lower");
  commands.push(`L ${pointToSvg(upperAnchorR)}`);
  commands.push(`L ${pointToSvg(handleEnd)}`);

  return commands.join(" ");
}

export function ropePathCompound({
  handleEnd,
  loadEnd,
  lowerPulleys,
  upperPulleys,
}: RopePathCompoundConfig) {
  const commands = [`M ${pointToSvg(handleEnd)}`];
  const wrapCount = Math.max(lowerPulleys.length, upperPulleys.length);

  for (let index = 0; index < wrapCount; index += 1) {
    const upperPulley = upperPulleys[index];
    const lowerPulley = lowerPulleys[index];

    if (upperPulley) {
      appendPulleyWrap(commands, upperPulley, "right", "upper");
    }

    if (lowerPulley) {
      appendPulleyWrap(commands, lowerPulley, "left", "lower");
    }
  }

  commands.push(`L ${pointToSvg(loadEnd)}`);

  return commands.join(" ");
}

export function ropePath({ handle, load, pulleys }: RopePathConfig) {
  if (pulleys.length === 0) {
    return `M ${pointToSvg(handle)} L ${pointToSvg(load)}`;
  }

  const commands: string[] = [`M ${pointToSvg(handle)}`];
  let currentPoint = handle;

  pulleys.forEach((pulley, index) => {
    const nextPulley = index < pulleys.length - 1 ? pulleys[index + 1] : null;
    const nextAnchor = nextPulley ? nextPulley.center : load;
    const tangentPair = chooseArcTangents(
      currentPoint,
      nextAnchor,
      pulley.center,
      pulley.radius,
    );

    if (!tangentPair) {
      commands.push(`L ${pointToSvg(pulley.center)}`);
      currentPoint = pulley.center;
      return;
    }

    commands.push(`L ${pointToSvg(tangentPair.entry)}`);
    commands.push(
      `A ${pulley.radius.toFixed(2)} ${pulley.radius.toFixed(2)} 0 ${String(
        tangentPair.arc.largeArcFlag,
      )} ${String(tangentPair.arc.sweepFlag)} ${pointToSvg(tangentPair.exit)}`,
    );
    currentPoint = tangentPair.exit;
  });

  commands.push(`L ${pointToSvg(load)}`);

  return commands.join(" ");
}

export const renderRopePath = ropePath;
