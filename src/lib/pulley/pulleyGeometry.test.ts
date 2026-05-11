import { describe, expect, it } from "vitest";

import {
  arcSweep,
  ropePath,
  tangentPoints,
} from "@/lib/pulley/pulleyGeometry";

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

describe("ropePath", () => {
  it("returns a direct line when no pulleys are provided", () => {
    expect(
      ropePath({
        handle: { x: 32, y: 48 },
        load: { x: 96, y: 128 },
        pulleys: [],
      }),
    ).toBe("M 32.00 48.00 L 96.00 128.00");
  });

  it("matches the fixed-pulley SVG path snapshot", () => {
    expect(
      ropePath({
        handle: { x: 480, y: 320 },
        load: { x: 220, y: 280 },
        pulleys: [{ center: { x: 360, y: 160 }, radius: 40 }],
      }),
    ).toBe(
      "M 480.00 320.00 L 333.45 189.92 A 40.00 40.00 0 0 0 378.82 195.29 L 220.00 280.00",
    );
  });

  it("matches the movable-pulley SVG path snapshot", () => {
    expect(
      ropePath({
        handle: { x: 520, y: 320 },
        load: { x: 180, y: 140 },
        pulleys: [{ center: { x: 360, y: 220 }, radius: 40 }],
      }),
    ).toBe(
      "M 520.00 320.00 L 346.47 257.64 A 40.00 40.00 0 0 1 336.67 252.49 L 180.00 140.00",
    );
  });

  it("matches the compound-pulley SVG path snapshot", () => {
    expect(
      ropePath({
        handle: { x: 600, y: 320 },
        load: { x: 120, y: 120 },
        pulleys: [
          { center: { x: 420, y: 160 }, radius: 36 },
          { center: { x: 420, y: 280 }, radius: 36 },
          { center: { x: 260, y: 280 }, radius: 36 },
          { center: { x: 260, y: 160 }, radius: 36 },
        ],
      }),
    ).toBe(
      "M 600.00 320.00 L 400.37 190.18 A 36.00 36.00 0 0 1 385.66 170.80 L 449.20 258.95 A 36.00 36.00 0 0 0 411.90 244.92 L 260.22 244.00 A 36.00 36.00 0 0 1 294.34 269.20 L 230.80 181.05 A 36.00 36.00 0 0 0 241.86 191.09 L 120.00 120.00",
    );
  });
});
