import PulleyDiagram from "@/components/pulley/pulley-diagram";
import ForceMeter from "@/components/readouts/force-meter";
import MechanicalAdvantage from "@/components/readouts/mechanical-advantage";

type PulleyDemoProps = {
  label?: string;
  showReadouts?: boolean;
};

function LessonPulleyDemo({
  label = "Pulley preview",
  showReadouts = true,
}: PulleyDemoProps) {
  return (
    <PulleyDiagram
      className="shadow-float"
      loadWeight={180}
      maxPullDistance={170}
      pulleyCount={1}
      showForceArrows
      showLabels={showReadouts}
      type="fixed"
    >
      {showReadouts ? (
        <div className="grid gap-4 md:grid-cols-2">
          <ForceMeter maxValue={220} />
          <MechanicalAdvantage />
        </div>
      ) : (
        <p className="text-sm leading-6 text-slate-600">{label}</p>
      )}
    </PulleyDiagram>
  );
}

export default LessonPulleyDemo;
