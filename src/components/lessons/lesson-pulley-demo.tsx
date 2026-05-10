import { lazy, Suspense } from "react";

type PulleyDemoProps = {
  label?: string;
  showReadouts?: boolean;
};

const LessonPulleyDemoRuntime = lazy(
  () => import("@/components/lessons/lesson-pulley-demo-runtime"),
);

function LessonPulleyDemo(props: PulleyDemoProps) {
  return (
    <Suspense
      fallback={
        <div className="rounded-[1.75rem] bg-slate-950/95 p-5 text-sm text-slate-200 shadow-float">
          Loading pulley preview...
        </div>
      }
    >
      <LessonPulleyDemoRuntime {...props} />
    </Suspense>
  );
}

export default LessonPulleyDemo;
