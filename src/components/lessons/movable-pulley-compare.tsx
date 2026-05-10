import { lazy, Suspense } from "react";

const MovablePulleyCompareRuntime = lazy(
  () => import("@/components/lessons/movable-pulley-compare-runtime"),
);

function MovablePulleyCompare() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 text-sm text-slate-600 shadow-float">
          Loading pulley comparison...
        </div>
      }
    >
      <MovablePulleyCompareRuntime />
    </Suspense>
  );
}

export default MovablePulleyCompare;
