import { lazy, Suspense } from "react";

type MovablePulleySandboxProps = {
  label?: string;
};

const MovablePulleySandboxRuntime = lazy(
  () => import("@/components/lessons/movable-pulley-sandbox-runtime"),
);

function MovablePulleySandbox(props: MovablePulleySandboxProps) {
  return (
    <Suspense
      fallback={
        <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 text-sm text-slate-600 shadow-float">
          Loading movable pulley sandbox...
        </div>
      }
    >
      <MovablePulleySandboxRuntime {...props} />
    </Suspense>
  );
}

export default MovablePulleySandbox;
