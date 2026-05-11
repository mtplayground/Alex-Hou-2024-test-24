import { createContext, useContext } from "react";

import type { PulleyType } from "@/lib/pulley/use-pulley-state";

export type PulleyDiagramContextValue = {
  forceNeeded: number;
  loadDistance: number;
  loadWeight: number;
  mechanicalAdvantage: number;
  pulleyCount: number;
  pullDistance: number;
  type: PulleyType;
};

export const PulleyDiagramContext =
  createContext<PulleyDiagramContextValue | null>(null);

export function usePulleyDiagramContext() {
  return useContext(PulleyDiagramContext);
}
