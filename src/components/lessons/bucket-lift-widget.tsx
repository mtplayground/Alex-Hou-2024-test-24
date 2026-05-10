import { lazy, Suspense } from "react";

const BucketLiftWidgetRuntime = lazy(
  () => import("@/components/lessons/bucket-lift-widget-runtime"),
);

function BucketLiftWidget() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[1.75rem] bg-slate-950/95 p-5 text-sm text-slate-200 shadow-float">
          Loading bucket lift simulation...
        </div>
      }
    >
      <BucketLiftWidgetRuntime />
    </Suspense>
  );
}

export default BucketLiftWidget;
