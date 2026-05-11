import { useState } from "react";

import PulleyDiagram from "@/components/pulley/pulley-diagram";
import ForceMeter from "@/components/readouts/force-meter";
import MechanicalAdvantage from "@/components/readouts/mechanical-advantage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FixedPulleySandboxProps = {
  label?: string;
};

function FixedPulleySandbox({ label = "Fixed pulley sandbox" }: FixedPulleySandboxProps) {
  const [loadWeight, setLoadWeight] = useState(180);

  return (
    <div className="space-y-4">
      <Card className="border-white/70 bg-white/90 shadow-float">
        <CardHeader className="space-y-3">
          <CardTitle className="font-display text-3xl text-slate-900">
            {label}
          </CardTitle>
          <p className="text-base leading-7 text-slate-600">
            Change the bucket weight, then drag the rope handle. A fixed pulley
            mainly changes direction, so the force meter stays close to the
            load's weight.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="block space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                Bucket load
              </span>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-900">
                {loadWeight} N
              </span>
            </div>
            <input
              className="h-3 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-500"
              max="360"
              min="60"
              step="10"
              type="range"
              value={loadWeight}
              onChange={(event) => {
                setLoadWeight(Number(event.target.value));
              }}
            />
          </label>

          <PulleyDiagram
            loadWeight={loadWeight}
            maxPullDistance={180}
            pulleyCount={1}
            showForceArrows
            type="fixed"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ForceMeter maxValue={360} />
              <MechanicalAdvantage />
            </div>
          </PulleyDiagram>
        </CardContent>
      </Card>
    </div>
  );
}

export default FixedPulleySandbox;
