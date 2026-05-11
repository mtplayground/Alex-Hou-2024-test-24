import {
  Body as MatterBody,
  Bodies,
  type Engine,
  type Vector,
} from "matter-js";
import { useRef } from "react";

import SimulationCanvas from "@/components/simulation/simulation-canvas";
import {
  attachWeight,
  createPulley,
  createRope,
} from "@/lib/simulation/pulleys";

function HomeHeroSimulationDemo() {
  const heroSimulationPartsRef = useRef<{
    rope: ReturnType<typeof createRope> | null;
    ropeEndHome: Vector | null;
  }>({
    rope: null,
    ropeEndHome: null,
  });

  function handleHeroSimulationFrame(engine: Engine) {
    const rope = heroSimulationPartsRef.current.rope;
    const ropeEndHome = heroSimulationPartsRef.current.ropeEndHome;

    if (rope === null || ropeEndHome === null) {
      return;
    }

    const cycle = engine.timing.timestamp / 620;
    const target = {
      x: ropeEndHome.x + Math.cos(cycle * 0.55) * 8,
      y: ropeEndHome.y + Math.sin(cycle) * 34,
    };
    const deltaX = target.x - rope.end.position.x;
    const deltaY = target.y - rope.end.position.y;

    MatterBody.setVelocity(rope.end, {
      x: deltaX * 0.2,
      y: deltaY * 0.2,
    });
    MatterBody.setPosition(rope.end, {
      x: rope.end.position.x + deltaX * 0.12,
      y: rope.end.position.y + deltaY * 0.12,
    });
    MatterBody.setAngularVelocity(rope.end, 0);
  }

  return (
    <div className="relative space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
            Idle Loop Demo
          </p>
          <h2 className="mt-2 font-display text-2xl text-white">
            Pull down, load rises
          </h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
          Auto-running
        </div>
      </div>

      <SimulationCanvas
        className="border-white/10 bg-white/5 shadow-none"
        height={320}
        label="Auto-running pulley hero demo"
        onFrame={handleHeroSimulationFrame}
        showControls={false}
        width={560}
        renderScene={(scene) => {
          const pulley = createPulley({
            radius: 42,
            x: 280,
            y: 110,
          });
          const rope = createRope({
            endPoint: { x: 402, y: 198 },
            endAnchors: {
              start: { x: 132, y: 78 },
            },
            segmentRadius: 7,
            spacing: 16,
            startPoint: { x: 132, y: 78 },
          });
          pulley.attachRope(rope);
          const weight = attachWeight({
            offset: { x: 0, y: 66 },
            rope,
            size: { height: 74, width: 74 },
          });

          heroSimulationPartsRef.current = {
            rope,
            ropeEndHome: {
              x: rope.end.position.x,
              y: rope.end.position.y,
            },
          };
          scene.setRopeOverlays([rope]);

          scene.addBody([
            Bodies.rectangle(280, 30, 520, 24, {
              isStatic: true,
              render: { fillStyle: "#e2e8f0" },
            }),
            Bodies.circle(132, 78, 10, {
              isStatic: true,
              render: { fillStyle: "#f8fafc" },
            }),
          ]);
          scene.addComposite([
            pulley.composite,
            rope.composite,
            weight.composite,
          ]);
        }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="bg-white/8 rounded-2xl px-4 py-3 text-sm text-slate-200">
          <p className="font-semibold text-white">See the motion</p>
          <p className="mt-1 leading-6 text-slate-300">
            The rope end loops continuously so the demo feels alive on first
            load.
          </p>
        </div>
        <div className="bg-white/8 rounded-2xl px-4 py-3 text-sm text-slate-200">
          <p className="font-semibold text-white">Build intuition</p>
          <p className="mt-1 leading-6 text-slate-300">
            Watch the load respond before digging into force and mechanical
            advantage.
          </p>
        </div>
        <div className="bg-white/8 rounded-2xl px-4 py-3 text-sm text-slate-200">
          <p className="font-semibold text-white">Jump into lessons</p>
          <p className="mt-1 leading-6 text-slate-300">
            Use the call to action to move straight into the lesson registry
            below.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomeHeroSimulationDemo;
