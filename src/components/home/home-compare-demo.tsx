import PulleyDiagram from "@/components/pulley/pulley-diagram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function HomeCompareDemo() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="border-white/70 bg-white/90 shadow-float">
        <CardHeader className="space-y-2">
          <CardTitle className="font-display text-2xl text-slate-900">
            Fixed pulley
          </CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            The pulley redirects your effort so you can pull down while the load
            goes up.
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
            The moving wheel spreads the load across more rope, which lowers the
            ideal pulling force but increases rope distance.
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

export default HomeCompareDemo;
