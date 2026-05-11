import { forwardRef, lazy, Suspense, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

import type {
  SimulationCanvasHandle,
  SimulationCanvasProps,
} from "@/components/simulation/simulation-canvas-runtime";

const SimulationCanvasRuntime = lazy(
  () => import("@/components/simulation/simulation-canvas-runtime"),
);

const SimulationCanvas = forwardRef<
  SimulationCanvasHandle,
  SimulationCanvasProps
>(function SimulationCanvas(props, ref) {
  const runtimeHandleRef = useRef<SimulationCanvasHandle | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      pause: () => {
        runtimeHandleRef.current?.pause();
      },
      play: () => {
        runtimeHandleRef.current?.play();
      },
      reset: () => {
        runtimeHandleRef.current?.reset();
      },
    }),
    [],
  );

  return (
    <Suspense
      fallback={
        <div
          className={cn(
            "overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/90 shadow-float backdrop-blur",
            props.className,
          )}
        >
          <div className="px-4 pb-4 pt-4">
            <div
              className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950/5 shadow-inner"
              style={{
                aspectRatio: `${String(props.width ?? 640)} / ${String(
                  props.height ?? 340,
                )}`,
              }}
            >
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-100 via-sky-50 to-cyan-100" />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Loading simulation...
            </p>
          </div>
        </div>
      }
    >
      <SimulationCanvasRuntime {...props} ref={runtimeHandleRef} />
    </Suspense>
  );
});

SimulationCanvas.displayName = "SimulationCanvas";

export type {
  SimulationBounds,
  SimulationCameraMode,
  SimulationCanvasHandle,
  SimulationCanvasProps,
  SimulationGravity,
  SimulationOverlayApi,
  SimulationSceneApi,
} from "@/components/simulation/simulation-canvas-runtime";

export default SimulationCanvas;
