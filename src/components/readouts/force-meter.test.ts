import { describe, expect, it } from "vitest";

import { getForceMeterNeedleRotation } from "@/components/readouts/force-meter";

describe("getForceMeterNeedleRotation", () => {
  it("returns the left-stop angle for values below zero", () => {
    expect(getForceMeterNeedleRotation(-5, 12)).toBe(-120);
  });

  it("returns the midpoint angle for half the max value", () => {
    expect(getForceMeterNeedleRotation(6, 12)).toBe(0);
  });

  it("clamps values above the max to the right-stop angle", () => {
    expect(getForceMeterNeedleRotation(99, 12)).toBe(120);
  });
});
