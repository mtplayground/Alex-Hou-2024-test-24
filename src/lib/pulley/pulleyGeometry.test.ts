import { describe, expect, it } from "vitest";

import {
  arcSweep,
  ropePathCompound,
  ropePathFixed,
  ropePathMovable,
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

describe("explicit per-type rope path generators", () => {
  it("builds a fixed-pulley path over the top semicircle", () => {
    expect(
      ropePathFixed({
        handleEnd: { x: 528, y: 316 },
        loadEnd: { x: 192, y: 316 },
        pulley: { center: { x: 360, y: 174 }, radius: 38 },
      }),
    ).toBe(
      "M 528.00 316.00 L 398.00 174.00 A 38.00 38.00 0 1 0 322.00 174.00 L 192.00 316.00",
    );
  });

  it("builds a movable-pulley path under the lower semicircle", () => {
    expect(
      ropePathMovable({
        upperAnchorL: { x: 240, y: 108 },
        upperAnchorR: { x: 480, y: 108 },
        handleEnd: { x: 576, y: 256 },
        pulley: { center: { x: 360, y: 248 }, radius: 38 },
      }),
    ).toBe(
      "M 240.00 108.00 L 322.00 248.00 A 38.00 38.00 0 1 0 398.00 248.00 L 480.00 108.00 L 576.00 256.00",
    );
  });

  it("builds a compound path with alternating upper and lower wraps", () => {
    expect(
      ropePathCompound({
        handleEnd: { x: 608, y: 224 },
        loadEnd: { x: 144, y: 360 },
        upperPulleys: [
          { center: { x: 460, y: 168 }, radius: 32 },
          { center: { x: 276, y: 168 }, radius: 32 },
        ],
        lowerPulleys: [
          { center: { x: 460, y: 300 }, radius: 32 },
          { center: { x: 276, y: 300 }, radius: 32 },
        ],
      }),
    ).toBe(
      "M 608.00 224.00 L 492.00 168.00 A 32.00 32.00 0 1 0 428.00 168.00 L 428.00 300.00 A 32.00 32.00 0 1 0 492.00 300.00 L 308.00 168.00 A 32.00 32.00 0 1 0 244.00 168.00 L 244.00 300.00 A 32.00 32.00 0 1 0 308.00 300.00 L 144.00 360.00",
    );
  });
});
