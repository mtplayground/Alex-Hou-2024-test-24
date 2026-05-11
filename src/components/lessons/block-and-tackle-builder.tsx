import { Trophy } from "lucide-react";
import { useMemo, useState } from "react";

import AdvancedOnly from "@/components/advanced/advanced-only";
import PulleyDiagram from "@/components/pulley/pulley-diagram";
import ForceMeter from "@/components/readouts/force-meter";
import MechanicalAdvantage from "@/components/readouts/mechanical-advantage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMechanicalAdvantage } from "@/lib/pulley/use-pulley-state";
import { cn } from "@/lib/utils";

const PIANO_WEIGHT_N = 3920;
const MAX_STUDENT_PULL_N = 900;

function clampPulleyCount(value: number) {
  return Math.max(1, Math.min(6, Math.round(value)));
}

function BlockAndTackleBuilder() {
  const [pulleyCount, setPulleyCount] = useState(2);
  const mechanicalAdvantage = useMemo(
    () => getMechanicalAdvantage({ pulleyCount, type: "compound" }),
    [pulleyCount],
  );
  const pullForce = PIANO_WEIGHT_N / mechanicalAdvantage;
  const success = pullForce <= MAX_STUDENT_PULL_N;
  const score = Math.max(
    0,
    Math.round(100 - (pullForce / MAX_STUDENT_PULL_N) * 55),
  );

  return (
    <div className="space-y-4">
      <Card className="border-white/70 bg-white/90 shadow-float">
        <CardHeader className="space-y-3">
          <CardTitle className="font-display text-3xl text-slate-900">
            Block &amp; Tackle Rig Builder
          </CardTitle>
          <p className="text-base leading-7 text-slate-600">
            Choose between 1 and 6 pulleys. The diagram updates immediately,
            and the live readouts show how more supporting rope segments reduce
            the ideal pulling force.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                Pulleys in rig
              </span>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-900">
                {pulleyCount}
              </span>
            </div>
            <input
              className="h-3 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-500"
              max="6"
              min="1"
              step="1"
              type="range"
              value={pulleyCount}
              onChange={(event) => {
                setPulleyCount(clampPulleyCount(Number(event.target.value)));
              }}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }, (_, index) => index + 1).map((count) => (
              <button
                key={count}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  pulleyCount === count
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                )}
                type="button"
                onClick={() => {
                  setPulleyCount(count);
                }}
              >
                {count} pulley{count === 1 ? "" : "s"}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <PulleyDiagram
          loadWeight={PIANO_WEIGHT_N}
          maxPullDistance={190}
          pulleyCount={pulleyCount}
          showForceArrows
          type="compound"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <MechanicalAdvantage />
            <ForceMeter maxValue={4000} />
          </div>
        </PulleyDiagram>

        <div className="space-y-4">
          <Card
            className={cn(
              "border-white/70 shadow-float",
              success ? "bg-emerald-50" : "bg-rose-50",
            )}
          >
            <CardHeader className="space-y-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-800">
                <Trophy className="h-4 w-4" />
                Lift the Piano
              </div>
              <CardTitle className="font-display text-2xl text-slate-900">
                {success
                  ? "Challenge cleared"
                  : "Add more pulleys to reduce the pull"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-700">
              <p>
                Piano load:{" "}
                <span className="font-semibold">{PIANO_WEIGHT_N.toFixed(0)} N</span>
              </p>
              <p>
                Required pull:{" "}
                <span className="font-semibold">{pullForce.toFixed(0)} N</span>
              </p>
              <p>
                Student strength limit:{" "}
                <span className="font-semibold">{MAX_STUDENT_PULL_N} N</span>
              </p>
              <div className="rounded-[1.25rem] bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Score
                </p>
                <p className="mt-2 font-display text-4xl text-slate-900">
                  {success ? score : 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <AdvancedOnly>
            <Card className="border-white/70 bg-slate-950 text-slate-50 shadow-float">
              <CardContent className="pt-6 text-sm leading-6 text-slate-300">
                In this ideal model, the force drops in proportion to the
                supporting rope segments. More pulleys mean more rope to pull,
                but less force needed at the handle.
              </CardContent>
            </Card>
          </AdvancedOnly>
        </div>
      </div>
    </div>
  );
}

export default BlockAndTackleBuilder;
