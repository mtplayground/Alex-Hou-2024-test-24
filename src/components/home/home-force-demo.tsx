import AdvancedOnly from "@/components/advanced/advanced-only";
import PulleyDiagram from "@/components/pulley/pulley-diagram";
import ForceMeter from "@/components/readouts/force-meter";
import MechanicalAdvantage from "@/components/readouts/mechanical-advantage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function HomeForceDemo() {
  return (
    <div className="space-y-4">
      <PulleyDiagram
        loadWeight={220}
        maxPullDistance={180}
        pulleyCount={1}
        showForceArrows
        type="fixed"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ForceMeter maxValue={240} />
          <MechanicalAdvantage />
        </div>
      </PulleyDiagram>

      <AdvancedOnly
        fallback={
          <Card className="border-dashed border-sky-300/80 bg-sky-50/80">
            <CardContent className="pt-6 text-sm leading-6 text-slate-700">
              Turn on <span className="font-semibold">Advanced Mode</span> in
              the header to reveal the engineering notes for this pulley scene.
            </CardContent>
          </Card>
        }
      >
        <Card className="border-sky-300/80 bg-slate-950 text-slate-50 shadow-lg shadow-slate-950/20">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
              Advanced Mode
            </div>
            <CardTitle className="font-display text-2xl text-white">
              Ideal force model
            </CardTitle>
            <CardDescription className="text-slate-300">
              In this SVG model, the fixed pulley has mechanical advantage 1, so
              the force meter reads close to the load weight while the pull
              direction flips downward.
            </CardDescription>
          </CardHeader>
        </Card>
      </AdvancedOnly>
    </div>
  );
}

export default HomeForceDemo;
