import { motion, useReducedMotion } from "framer-motion";
import { Gauge } from "lucide-react";

import { usePulleyDiagramContext } from "@/components/pulley/pulley-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useAnimatedNumber } from "./use-animated-number";

type ForceMeterProps = {
  className?: string;
  maxValue?: number;
  unit?: string;
  value?: number;
};

export function getForceMeterNeedleRotation(value: number, maxValue = 12) {
  const clampedValue = Math.max(0, Math.min(value, maxValue));

  return -120 + (clampedValue / maxValue) * 240;
}

function ForceMeter({
  className,
  maxValue = 12,
  unit = "N",
  value: valueProp,
}: ForceMeterProps) {
  const pulleyContext = usePulleyDiagramContext();
  const reduceMotion = useReducedMotion();
  const value = valueProp ?? pulleyContext?.forceNeeded ?? 0;
  const clampedValue = Math.max(0, Math.min(value, maxValue));
  const displayValue = useAnimatedNumber(clampedValue, 1);
  const needleRotation = getForceMeterNeedleRotation(value, maxValue);

  return (
    <Card
      className={cn(
        "overflow-hidden border-white/70 bg-white/90 shadow-float backdrop-blur",
        className,
      )}
    >
      <CardHeader className="space-y-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-coral/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-950">
          <Gauge className="h-4 w-4" />
          Force Meter
        </div>
        <CardTitle className="font-display text-2xl text-slate-900">
          Pulling Force
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative mx-auto h-40 w-40">
          <div className="absolute inset-0 rounded-full border-[12px] border-slate-100" />
          <div className="absolute inset-[14px] rounded-full bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.2),rgba(255,255,255,0.95))]" />
          <div className="absolute inset-[8px] rounded-full border border-dashed border-slate-300" />

          <motion.div
            className="absolute left-1/2 top-1/2 h-14 w-1 -translate-x-1/2 -translate-y-[92%] rounded-full bg-gradient-to-b from-orange-500 to-rose-600 shadow-[0_8px_18px_rgba(244,63,94,0.3)]"
            animate={{ rotate: needleRotation }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { damping: 18, stiffness: 180, type: "spring" }
            }
            style={{ originY: "100%" }}
          />

          <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-slate-900 shadow-sm" />
        </div>

        <div className="rounded-[1.3rem] bg-slate-950 px-4 py-3 text-center text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Current Pull
          </p>
          <p className="mt-1 font-display text-4xl">
            {displayValue}
            <span className="ml-2 text-lg text-slate-300">{unit}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ForceMeter;
