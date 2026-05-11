import PulleyDiagram from "@/components/pulley/pulley-diagram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function BucketLiftWidget() {
  return (
    <div className="space-y-4">
      <Card className="border-white/70 bg-white/90 shadow-float">
        <CardHeader className="space-y-3">
          <CardTitle className="font-display text-3xl text-slate-900">
            Pull the rope down to lift the bucket
          </CardTitle>
          <p className="text-base leading-7 text-slate-600">
            Drag the handle dot downward. The rope changes direction over the
            wheel, so the bucket rises even though your hand is moving down.
          </p>
        </CardHeader>
        <CardContent>
          <PulleyDiagram
            loadWeight={120}
            maxPullDistance={170}
            pulleyCount={1}
            showForceArrows
            type="fixed"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default BucketLiftWidget;
