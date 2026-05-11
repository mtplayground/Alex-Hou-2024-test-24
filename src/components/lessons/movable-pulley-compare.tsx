import PulleyDiagram from "@/components/pulley/pulley-diagram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function MovablePulleyCompare() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="border-white/70 bg-white/90 shadow-float">
        <CardHeader className="space-y-2">
          <CardTitle className="font-display text-2xl text-slate-900">
            Fixed pulley
          </CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            Pulling down changes direction, but the load force stays close to
            the same as the weight.
          </p>
        </CardHeader>
        <CardContent>
          <PulleyDiagram
            loadWeight={180}
            maxPullDistance={150}
            pulleyCount={1}
            type="fixed"
          />
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/90 shadow-float">
        <CardHeader className="space-y-2">
          <CardTitle className="font-display text-2xl text-slate-900">
            Movable pulley
          </CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            The pulley travels with the bucket, so the load rises less distance
            while the required pull force drops.
          </p>
        </CardHeader>
        <CardContent>
          <PulleyDiagram
            loadWeight={180}
            maxPullDistance={150}
            pulleyCount={2}
            type="movable"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default MovablePulleyCompare;
