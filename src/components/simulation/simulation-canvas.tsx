import { useEffect, useRef, useState } from "react";
import {
  Composite,
  Engine,
  Render,
  type Body,
  type Composite as MatterComposite,
  type Constraint,
} from "matter-js";
import { Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SimulationGravity = {
  x?: number;
  y?: number;
  scale?: number;
};

export type SimulationSceneApi = {
  engine: Engine;
  world: MatterComposite;
  addBody: (body: Body | Body[]) => void;
  addComposite: (composite: MatterComposite | MatterComposite[]) => void;
  addConstraint: (constraint: Constraint | Constraint[]) => void;
  clearScene: () => void;
};

export type SimulationOverlayApi = {
  context: CanvasRenderingContext2D;
  engine: Engine;
  pixelRatio: number;
  render: Render;
  size: {
    height: number;
    width: number;
  };
};

type SimulationCanvasProps = {
  className?: string;
  gravity?: SimulationGravity;
  height?: number;
  label?: string;
  overlayRenderer?: (overlay: SimulationOverlayApi) => void;
  renderScene: (scene: SimulationSceneApi) => void;
  width?: number;
};

function createSceneApi(engine: Engine): SimulationSceneApi {
  return {
    engine,
    world: engine.world,
    addBody: (body) => {
      Composite.add(engine.world, body);
    },
    addComposite: (composite) => {
      Composite.add(engine.world, composite);
    },
    addConstraint: (constraint) => {
      Composite.add(engine.world, constraint);
    },
    clearScene: () => {
      Composite.clear(engine.world, false, true);
    },
  };
}

function SimulationCanvas({
  className,
  gravity,
  height = 340,
  label = "Physics simulation canvas",
  overlayRenderer,
  renderScene,
  width = 640,
}: SimulationCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const renderRef = useRef<Render | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const renderSceneRef = useRef(renderScene);
  const overlayRendererRef = useRef(overlayRenderer);
  const isRunningRef = useRef(true);
  const showForcesRef = useRef(overlayRenderer !== undefined);
  const [isRunning, setIsRunning] = useState(true);
  const [showForces, setShowForces] = useState(overlayRenderer !== undefined);

  useEffect(() => {
    renderSceneRef.current = renderScene;
  }, [renderScene]);

  useEffect(() => {
    overlayRendererRef.current = overlayRenderer;
  }, [overlayRenderer]);

  useEffect(() => {
    showForcesRef.current = showForces;
  }, [showForces]);

  useEffect(() => {
    const container = containerRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    if (container === null || overlayCanvas === null) {
      return undefined;
    }

    const engine = Engine.create();
    engine.gravity.x = gravity?.x ?? 0;
    engine.gravity.y = gravity?.y ?? 1;
    engine.gravity.scale = gravity?.scale ?? 0.001;

    const render = Render.create({
      element: container,
      engine,
      options: {
        width,
        height,
        wireframes: false,
        background: "transparent",
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      },
    });
    const overlayContext = overlayCanvas.getContext("2d");

    engineRef.current = engine;
    renderRef.current = render;

    if (overlayContext === null) {
      Render.stop(render);
      render.canvas.remove();
      render.textures = {};
      engineRef.current = null;
      renderRef.current = null;

      return undefined;
    }

    const scene = createSceneApi(engine);
    const overlayContext2d = overlayContext;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    overlayCanvas.width = width * pixelRatio;
    overlayCanvas.height = height * pixelRatio;
    overlayCanvas.style.width = `${String(width)}px`;
    overlayCanvas.style.height = `${String(height)}px`;

    function clearOverlay() {
      overlayContext2d.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      overlayContext2d.clearRect(0, 0, width, height);
    }

    function drawOverlay() {
      clearOverlay();

      if (!showForcesRef.current || overlayRendererRef.current === undefined) {
        return;
      }

      overlayRendererRef.current({
        context: overlayContext2d,
        engine,
        pixelRatio,
        render,
        size: {
          height,
          width,
        },
      });
    }

    function rebuildScene() {
      scene.clearScene();
      engine.timing.timestamp = 0;
      renderSceneRef.current(scene);
    }

    function frame(previousTime: number) {
      return (time: number) => {
        const delta = Math.min(time - previousTime, 1000 / 30);

        if (isRunningRef.current) {
          Engine.update(engine, delta);
        }

        Render.world(render);
        drawOverlay();
        animationFrameRef.current = window.requestAnimationFrame(frame(time));
      };
    }

    rebuildScene();
    drawOverlay();
    animationFrameRef.current = window.requestAnimationFrame(
      frame(performance.now()),
    );

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      Render.stop(render);
      Composite.clear(engine.world, false, true);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
      clearOverlay();
      engineRef.current = null;
      renderRef.current = null;
    };
  }, [gravity?.scale, gravity?.x, gravity?.y, height, width]);

  function handlePlay() {
    isRunningRef.current = true;
    setIsRunning(true);
  }

  function handlePause() {
    isRunningRef.current = false;
    setIsRunning(false);
  }

  function handleReset() {
    const engine = engineRef.current;
    const render = renderRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    if (engine === null || render === null || overlayCanvas === null) {
      return;
    }

    const overlayContext = overlayCanvas.getContext("2d");

    if (overlayContext === null) {
      return;
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const scene = createSceneApi(engine);
    scene.clearScene();
    engine.timing.timestamp = 0;
    renderSceneRef.current(scene);
    Render.world(render);
    overlayContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    overlayContext.clearRect(0, 0, width, height);

    if (showForcesRef.current && overlayRendererRef.current !== undefined) {
      overlayRendererRef.current({
        context: overlayContext,
        engine,
        pixelRatio,
        render,
        size: {
          height,
          width,
        },
      });
    }
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/85 shadow-float backdrop-blur",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
              isRunning
                ? "bg-kid-mint/20 text-slate-900"
                : "bg-slate-200 text-slate-700",
            )}
          >
            {isRunning ? "Running" : "Paused"}
          </span>

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Simulation Canvas
          </p>
          <p className="text-sm font-medium text-slate-700">{label}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {overlayRenderer !== undefined ? (
            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <input
                checked={showForces}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                type="checkbox"
                onChange={(event) => {
                  setShowForces(event.target.checked);
                }}
              />
              Show forces
            </label>
          ) : null}
          {isRunning ? (
            <Button size="sm" variant="outline" onClick={handlePause}>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button size="sm" onClick={handlePlay}>
              <Play className="mr-2 h-4 w-4" />
              Play
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div
        aria-label={label}
        className="relative w-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_28%),linear-gradient(180deg,rgba(250,245,255,0.65),rgba(224,247,250,0.85))]"
        style={{ minHeight: `${String(height)}px` }}
      >
        <div ref={containerRef} className="h-full w-full" />
        <canvas
          ref={overlayCanvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        />
      </div>
    </div>
  );
}

export default SimulationCanvas;
