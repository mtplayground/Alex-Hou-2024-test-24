import { describe, expect, it } from "vitest";

import {
  arcSweep,
  ropePathCompound,
  ropePathFixed,
  ropePathMovable,
  tangentPoints,
  type Point,
  type RopePathPulley,
} from "@/lib/pulley/pulleyGeometry";

type MoveCommand = {
  point: Point;
  type: "M";
};

type LineCommand = {
  point: Point;
  start: Point;
  type: "L";
};

type ArcCommand = {
  end: Point;
  largeArcFlag: 0 | 1;
  radius: number;
  start: Point;
  sweepFlag: 0 | 1;
  type: "A";
};

type ParsedCommand = ArcCommand | LineCommand | MoveCommand;

function parsePathCommands(path: string): ParsedCommand[] {
  const tokens = path.match(/[MLA]|-?\d+(?:\.\d+)?/g) ?? [];
  const commands: ParsedCommand[] = [];
  let index = 0;
  let currentPoint = { x: 0, y: 0 };

  while (index < tokens.length) {
    const token = tokens[index];

    if (token === "M") {
      const point = {
        x: Number(tokens[index + 1]),
        y: Number(tokens[index + 2]),
      };
      commands.push({ point, type: "M" });
      currentPoint = point;
      index += 3;
      continue;
    }

    if (token === "L") {
      const point = {
        x: Number(tokens[index + 1]),
        y: Number(tokens[index + 2]),
      };
      commands.push({
        point,
        start: currentPoint,
        type: "L",
      });
      currentPoint = point;
      index += 3;
      continue;
    }

    if (token === "A") {
      const end = {
        x: Number(tokens[index + 6]),
        y: Number(tokens[index + 7]),
      };
      commands.push({
        end,
        largeArcFlag: Number(tokens[index + 4]) as 0 | 1,
        radius: Number(tokens[index + 1]),
        start: currentPoint,
        sweepFlag: Number(tokens[index + 5]) as 0 | 1,
        type: "A",
      });
      currentPoint = end;
      index += 8;
      continue;
    }

    throw new Error(`Unexpected SVG path token: ${token}`);
  }

  return commands;
}

function distanceFromCircle(point: Point, pulley: RopePathPulley) {
  return Math.abs(
    Math.hypot(point.x - pulley.center.x, point.y - pulley.center.y) - pulley.radius,
  );
}

function normalizeAngle(angle: number) {
  const fullTurn = Math.PI * 2;
  let normalized = angle % fullTurn;

  if (normalized < 0) {
    normalized += fullTurn;
  }

  return normalized;
}

function arcMidpoint(arc: ArcCommand, pulley: RopePathPulley) {
  const startAngle = Math.atan2(
    arc.start.y - pulley.center.y,
    arc.start.x - pulley.center.x,
  );
  const endAngle = Math.atan2(
    arc.end.y - pulley.center.y,
    arc.end.x - pulley.center.x,
  );
  const counterClockwiseDelta = normalizeAngle(endAngle - startAngle);
  let delta = arc.sweepFlag === 1 ? counterClockwiseDelta : counterClockwiseDelta - Math.PI * 2;

  if (
    (arc.largeArcFlag === 1 && Math.abs(delta) < Math.PI) ||
    (arc.largeArcFlag === 0 && Math.abs(delta) > Math.PI)
  ) {
    delta += arc.sweepFlag === 1 ? -Math.PI * 2 : Math.PI * 2;
  }

  const midpointAngle = startAngle + delta / 2;

  return {
    x: pulley.center.x + Math.cos(midpointAngle) * pulley.radius,
    y: pulley.center.y + Math.sin(midpointAngle) * pulley.radius,
  };
}

function expectArcEndpointsOnCircle(path: string, pulleys: RopePathPulley[]) {
  const arcs = parsePathCommands(path).filter(
    (command): command is ArcCommand => command.type === "A",
  );

  expect(arcs.length).toBeGreaterThan(0);
  expect(arcs.length).toBe(pulleys.length);

  arcs.forEach((arc, index) => {
    const pulley = pulleys[index];

    if (!pulley) {
      throw new Error(`Missing pulley for arc index ${String(index)}`);
    }

    expect(distanceFromCircle(arc.start, pulley)).toBeLessThanOrEqual(0.5);
    expect(distanceFromCircle(arc.end, pulley)).toBeLessThanOrEqual(0.5);
  });
}

function expectVerticalLines(path: string, expectedCount: number) {
  const lines = parsePathCommands(path).filter(
    (command): command is LineCommand => command.type === "L",
  );

  expect(lines).toHaveLength(expectedCount);

  lines.forEach((line) => {
    expect(line.start.x).toBeCloseTo(line.point.x, 6);
  });
}

describe("tangentPoints", () => {
  it("returns the two tangent contacts for a point outside the circle", () => {
    const tangents = tangentPoints(
      { x: 13, y: 0 },
      { x: 0, y: 0 },
      5,
    );

    expect(tangents).not.toBeNull();
    expect(tangents?.[0].x).toBeCloseTo(25 / 13, 6);
    expect(tangents?.[0].y).toBeCloseTo(-60 / 13, 6);
    expect(tangents?.[1].x).toBeCloseTo(25 / 13, 6);
    expect(tangents?.[1].y).toBeCloseTo(60 / 13, 6);
  });

  it("returns null when the point is inside or on the circle", () => {
    expect(tangentPoints({ x: 3, y: 4 }, { x: 0, y: 0 }, 5)).toBeNull();
    expect(tangentPoints({ x: 2, y: 0 }, { x: 0, y: 0 }, 5)).toBeNull();
  });
});

describe("arcSweep", () => {
  it("uses a positive sweep for counter-clockwise quarter turns", () => {
    const sweep = arcSweep(
      { x: 0, y: 0 },
      5,
      { x: 5, y: 0 },
      { x: 0, y: 5 },
    );

    expect(sweep.startAngle).toBeCloseTo(0, 6);
    expect(sweep.endAngle).toBeCloseTo(Math.PI / 2, 6);
    expect(sweep.deltaAngle).toBeCloseTo(Math.PI / 2, 6);
    expect(sweep.largeArcFlag).toBe(0);
    expect(sweep.sweepFlag).toBe(1);
  });

  it("uses a negative sweep for clockwise quarter turns", () => {
    const sweep = arcSweep(
      { x: 0, y: 0 },
      5,
      { x: 0, y: 5 },
      { x: 5, y: 0 },
    );

    expect(sweep.deltaAngle).toBeCloseTo(-Math.PI / 2, 6);
    expect(sweep.largeArcFlag).toBe(0);
    expect(sweep.sweepFlag).toBe(0);
  });
});

describe("physical rope-path correctness", () => {
  it("keeps the fixed pulley contact on the wheel and external strands vertical", () => {
    const pulley = { center: { x: 360, y: 174 }, radius: 38 };
    const path = ropePathFixed({
      handleEnd: { x: 398, y: 316 },
      loadEnd: { x: 322, y: 334 },
      pulley,
    });

    expect(path).toMatchInlineSnapshot(
      "\"M 398.00 316.00 L 398.00 174.00 A 38.00 38.00 0 1 0 322.00 174.00 L 322.00 334.00\"",
    );
    expectArcEndpointsOnCircle(path, [pulley]);
    expectVerticalLines(path, 2);
  });

  it("keeps the two-pulley movable path on the correct upper and lower wraps", () => {
    const upperPulley = { center: { x: 360, y: 174 }, radius: 38 };
    const lowerPulley = { center: { x: 360, y: 262 }, radius: 38 };
    const path = ropePathMovable({
      ceilingAnchor: { x: 398, y: 108 },
      handleEnd: { x: 398, y: 214 },
      lowerPulley,
      upperPulley,
    });

    expect(path).toMatchInlineSnapshot(
      "\"M 398.00 108.00 L 398.00 262.00 A 38.00 38.00 0 1 1 322.00 262.00 L 322.00 174.00 A 38.00 38.00 0 1 1 398.00 174.00 L 398.00 214.00\"",
    );

    const arcs = parsePathCommands(path).filter(
      (command): command is ArcCommand => command.type === "A",
    );

    expect(arcs).toHaveLength(2);
    const [lowerArc, upperArc] = arcs;

    if (!lowerArc || !upperArc) {
      throw new Error("Expected exactly two arc commands in movable pulley path");
    }

    expectArcEndpointsOnCircle(path, [lowerPulley, upperPulley]);
    expect(arcMidpoint(lowerArc, lowerPulley).y).toBeGreaterThan(lowerPulley.center.y);
    expect(arcMidpoint(upperArc, upperPulley).y).toBeLessThan(upperPulley.center.y);
    expectVerticalLines(path, 3);
  });

  it("keeps compound pulley contacts on their wheels and the strand bundle vertical", () => {
    const upperPulley = { center: { x: 460, y: 174 }, radius: 38 };
    const lowerPulley = { center: { x: 460, y: 292 }, radius: 38 };
    const path = ropePathCompound({
      handleEnd: { x: 498, y: 206 },
      loadEnd: { x: 498, y: 102 },
      upperPulleys: [upperPulley],
      lowerPulleys: [lowerPulley],
    });

    expect(path).toMatchInlineSnapshot(
      "\"M 498.00 206.00 L 498.00 174.00 A 38.00 38.00 0 1 0 422.00 174.00 L 422.00 292.00 A 38.00 38.00 0 1 0 498.00 292.00 L 498.00 102.00\"",
    );
    expectArcEndpointsOnCircle(path, [upperPulley, lowerPulley]);
    expectVerticalLines(path, 3);
  });
});
