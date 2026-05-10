import {
  Pause,
  Play,
  RotateCcw,
  Rows3,
  SplitSquareVertical,
} from "lucide-react";
import { useRef, useState } from "react";

import SimulationCanvas, {
  type SimulationCanvasHandle,
  type SimulationOverlayApi,
  type SimulationSceneApi,
} from "@/components/simulation/simulation-canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { soundManager } from "@/lib/sound/sound-manager";
import { cn } from "@/lib/utils";

type CompareSimulationPane = {
  description?: string;
  label: string;
  overlayRenderer?: (overlay: SimulationOverlayApi) => void;
  renderScene: (scene: SimulationSceneApi) => void;
};

type CompareSimulationsProps = {
  className?: string;
  description?: string;
  height?: number;
  left: CompareSimulationPane;
  right: CompareSimulationPane;
  title?: string;
};

function CompareSimulations({
  className,
  description = "Run both simulations together, then compare what changes and what stays the same.",
  height = 300,
  left,
  right,
  title = "Compare Simulations",
}: CompareSimulationsProps) {
  const leftRef = useRef<SimulationCanvasHandle | null>(null);
  const rightRef = useRef<SimulationCanvasHandle | null>(null);
  const [isRunning, setIsRunning] = useState(true);

  function handlePlayAll() {
    leftRef.current?.play();
    rightRef.current?.play();
    setIsRunning(true);
    soundManager.playClick();
  }

  function handlePauseAll() {
    leftRef.current?.pause();
    rightRef.current?.pause();
    setIsRunning(false);
    soundManager.playClick();
  }

  function handleResetAll() {
    leftRef.current?.reset();
    rightRef.current?.reset();
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-white/70 bg-white/90 shadow-float backdrop-blur",
        className,
      )}
    >
      <CardHeader className="space-y-4 border-b border-slate-200/80">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-sky/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-900">
              <SplitSquareVertical className="h-4 w-4" />
              Synced Compare Panel
            </div>
            <CardTitle className="font-display text-3xl text-slate-900">
              {title}
            </CardTitle>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isRunning ? (
              <Button size="sm" variant="outline" onClick={handlePauseAll}>
                <Pause className="mr-2 h-4 w-4" />
                Pause Both
              </Button>
            ) : (
              <Button size="sm" onClick={handlePlayAll}>
                <Play className="mr-2 h-4 w-4" />
                Play Both
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={handleResetAll}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Both
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
          <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">
            {isRunning ? "Both running" : "Both paused"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">
            <Rows3 className="mr-2 inline h-3.5 w-3.5" />
            Stacks on mobile
          </span>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 p-4 md:p-6 xl:grid-cols-2">
        {[left, right].map((pane, index) => (
          <div
            key={pane.label}
            className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-4"
          >
            <div className="mb-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {index === 0 ? "Left" : "Right"} Simulation
              </p>
              <h3 className="font-display text-2xl text-slate-900">
                {pane.label}
              </h3>
              {pane.description !== undefined ? (
                <p className="text-sm leading-7 text-slate-600">
                  {pane.description}
                </p>
              ) : null}
            </div>

            <SimulationCanvas
              ref={index === 0 ? leftRef : rightRef}
              height={height}
              label={pane.label}
              renderScene={pane.renderScene}
              showControls={false}
              {...(pane.overlayRenderer !== undefined
                ? {
                    overlayRenderer: pane.overlayRenderer,
                  }
                : {})}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default CompareSimulations;
