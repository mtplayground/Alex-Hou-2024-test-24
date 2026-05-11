import { useCallback, useMemo, useState } from "react";

export type PulleyType = "compound" | "fixed" | "movable";

export type PulleyStateConfig = {
  loadWeight: number;
  pulleyCount: number;
  type: PulleyType;
};

export type PulleyState = {
  loadDistance: number;
  mechanicalAdvantage: number;
  pullDistance: number;
  reset: () => void;
  setPull: (nextPullDistance: number) => void;
};

function clampPullDistance(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

export function getMechanicalAdvantage({
  pulleyCount,
  type,
}: Pick<PulleyStateConfig, "pulleyCount" | "type">) {
  const normalizedPulleyCount = Math.max(1, Math.floor(pulleyCount));

  switch (type) {
    case "fixed":
      return 1;
    case "movable":
      return 2;
    case "compound":
      return normalizedPulleyCount;
    default:
      return 1;
  }
}

export function usePulleyState(config: PulleyStateConfig): PulleyState {
  const [pullDistance, setPullDistance] = useState(0);
  const { pulleyCount, type } = config;

  const mechanicalAdvantage = useMemo(
    () => getMechanicalAdvantage({ pulleyCount, type }),
    [pulleyCount, type],
  );

  const setPull = useCallback((nextPullDistance: number) => {
    setPullDistance(clampPullDistance(nextPullDistance));
  }, []);

  const reset = useCallback(() => {
    setPullDistance(0);
  }, []);

  return {
    loadDistance: pullDistance / mechanicalAdvantage,
    mechanicalAdvantage,
    pullDistance,
    reset,
    setPull,
  };
}
