import { motion, useReducedMotion } from "framer-motion";
import { Layers3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useAnimatedNumber } from "./use-animated-number";

type MechanicalAdvantageProps = {
  className?: string;
  value: number;
};

function MechanicalAdvantage({ className, value }: MechanicalAdvantageProps) {
  const reduceMotion = useReducedMotion();
  const normalizedValue = Math.max(0, value);
  const displayValue = useAnimatedNumber(normalizedValue, 1);
  const badgeScale = 1 + Math.min(normalizedValue, 6) * 0.03;

  return (
    <Card
      className={cn(
        "overflow-hidden border-white/70 bg-white/90 shadow-float backdrop-blur",
        className,
      )}
    >
      <CardHeader className="space-y-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-mint/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-950">
          <Layers3 className="h-4 w-4" />
          Mechanical Advantage
        </div>
        <CardTitle className="font-display text-2xl text-slate-900">
          Lifting Efficiency
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <motion.div
          className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.25),rgba(255,255,255,0.95))] shadow-[inset_0_0_0_12px_rgba(220,252,231,0.9)]"
          animate={{ scale: badgeScale }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { damping: 18, stiffness: 170, type: "spring" }
          }
        >
          <div className="rounded-full bg-white/90 px-6 py-5 text-center shadow-lg">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Advantage
            </p>
            <p className="mt-2 font-display text-4xl text-slate-900">
              {displayValue}
              <span className="ml-1 text-lg text-slate-500">x</span>
            </p>
          </div>
        </motion.div>

        <div className="rounded-[1.3rem] bg-emerald-50 px-4 py-3 text-sm leading-7 text-emerald-950">
          Mechanical advantage compares load support to pulling effort. Higher
          values mean the pulley setup lets you move the load with less force.
        </div>
      </CardContent>
    </Card>
  );
}

export default MechanicalAdvantage;
