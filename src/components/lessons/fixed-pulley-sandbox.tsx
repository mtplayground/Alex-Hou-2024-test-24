import { lazy, Suspense } from "react";

type FixedPulleySandboxProps = {
  label?: string;
};

const FixedPulleySandboxRuntime = lazy(
  () => import("@/components/lessons/fixed-pulley-sandbox-runtime"),
);

function FixedPulleySandbox(props: FixedPulleySandboxProps) {
  return (
    <Suspense
      fallback={
        <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 text-sm text-slate-600 shadow-float">
          Loading fixed pulley sandbox...
        </div>
      }
    >
      <FixedPulleySandboxRuntime {...props} />
    </Suspense>
  );
}

export default FixedPulleySandbox;
