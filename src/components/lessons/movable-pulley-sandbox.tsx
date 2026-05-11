import PulleyDiagram from "@/components/pulley/pulley-diagram";
import ForceMeter from "@/components/readouts/force-meter";
import MechanicalAdvantage from "@/components/readouts/mechanical-advantage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MovablePulleySandboxProps = {
  label?: string;
};

function MovablePulleySandbox({
  label = "Movable pulley sandbox",
}: MovablePulleySandboxProps) {
  return (
    <div className="space-y-4">
      <Card className="border-white/70 bg-white/90 shadow-float">
        <CardHeader className="space-y-3">
          <CardTitle className="font-display text-3xl text-slate-900">
            {label}
          </CardTitle>
          <p className="text-base leading-7 text-slate-600">
            Drag the handle and watch the load travel a shorter distance. Two
            rope segments support the bucket, so the mechanical advantage rises
            to 2.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <PulleyDiagram
            loadWeight={180}
            maxPullDistance={180}
            pulleyCount={2}
            showForceArrows
            type="movable"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ForceMeter maxValue={180} />
              <MechanicalAdvantage />
            </div>
          </PulleyDiagram>
        </CardContent>
      </Card>
    </div>
  );
}

export default MovablePulleySandbox;
