import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  getMechanicalAdvantage,
  usePulleyState,
} from "@/lib/pulley/use-pulley-state";

describe("getMechanicalAdvantage", () => {
  it("returns expected ideal values for each pulley type", () => {
    expect(getMechanicalAdvantage({ pulleyCount: 4, type: "fixed" })).toBe(1);
    expect(getMechanicalAdvantage({ pulleyCount: 1, type: "movable" })).toBe(2);
    expect(getMechanicalAdvantage({ pulleyCount: 4, type: "compound" })).toBe(4);
  });
});

describe("usePulleyState", () => {
  it.each([
    { pulleyCount: 1, type: "fixed" as const },
    { pulleyCount: 2, type: "movable" as const },
    { pulleyCount: 5, type: "compound" as const },
  ])(
    "keeps loadDistance equal to pullDistance / MA for %s",
    ({ pulleyCount, type }) => {
      const { result } = renderHook(() =>
        usePulleyState({
          loadWeight: 240,
          pulleyCount,
          type,
        }),
      );

      act(() => {
        result.current.setPull(150);
      });

      expect(result.current.mechanicalAdvantage).toBe(
        getMechanicalAdvantage({ pulleyCount, type }),
      );
      expect(result.current.loadDistance).toBeCloseTo(
        result.current.pullDistance / result.current.mechanicalAdvantage,
        6,
      );
    },
  );

  it("clamps negative and non-finite pull values back to zero", () => {
    const { result } = renderHook(() =>
      usePulleyState({
        loadWeight: 120,
        pulleyCount: 3,
        type: "compound",
      }),
    );

    act(() => {
      result.current.setPull(-40);
    });
    expect(result.current.pullDistance).toBe(0);

    act(() => {
      result.current.setPull(Number.NaN);
    });
    expect(result.current.pullDistance).toBe(0);
  });

  it("resets the current pull and load distances", () => {
    const { result } = renderHook(() =>
      usePulleyState({
        loadWeight: 300,
        pulleyCount: 2,
        type: "movable",
      }),
    );

    act(() => {
      result.current.setPull(96);
    });
    expect(result.current.pullDistance).toBe(96);
    expect(result.current.loadDistance).toBe(48);

    act(() => {
      result.current.reset();
    });
    expect(result.current.pullDistance).toBe(0);
    expect(result.current.loadDistance).toBe(0);
  });
});
