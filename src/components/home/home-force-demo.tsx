import {
  Bodies,
  type Body,
  type Constraint as MatterConstraintType,
  type Engine,
  type Vector,
} from "matter-js";
import { useRef, useState } from "react";

import AdvancedOnly from "@/components/advanced/advanced-only";
import ForceMeter from "@/components/readouts/force-meter";
import MechanicalAdvantage from "@/components/readouts/mechanical-advantage";
import SimulationCanvas from "@/components/simulation/simulation-canvas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { drawForceOverlay } from "@/lib/simulation/force-overlay";
import {
  attachWeight,
  createPulley,
  createRope,
} from "@/lib/simulation/pulleys";

function getConstraintPoint(
  body: Body | null | undefined,
  point: Vector | undefined,
) {
  if (body != null && point !== undefined) {
    return {
      x: body.position.x + point.x,
      y: body.position.y + point.y,
    };
  }

  if (point !== undefined) {
    return { x: point.x, y: point.y };
  }

  if (body != null) {
    return { x: body.position.x, y: body.position.y };
  }

  return null;
}

function getConstraintStretch(constraint: MatterConstraintType) {
  const start = getConstraintPoint(constraint.bodyA, constraint.pointA);
  const end = getConstraintPoint(constraint.bodyB, constraint.pointB);

  if (start === null || end === null) {
    return 0;
  }

  return Math.max(
    0,
    Math.hypot(end.x - start.x, end.y - start.y) - constraint.length,
  );
}

function HomeForceDemo() {
  const simulationPartsRef = useRef<{
    rope: ReturnType<typeof createRope> | null;
    weight: ReturnType<typeof attachWeight> | null;
  }>({
    rope: null,
    weight: null,
  });
  const [simulationMetrics, setSimulationMetrics] = useState({
    pullForce: 0,
    mechanicalAdvantage: 1,
  });

  function handleSimulationFrame(engine: Engine) {
    const rope = simulationPartsRef.current.rope;
    const weight = simulationPartsRef.current.weight;

    if (rope === null || weight === null) {
      return;
    }

    const gravityMagnitude =
      Math.hypot(engine.gravity.x, engine.gravity.y) * engine.gravity.scale;
    const baseLoadForce = weight.weight.mass * gravityMagnitude * 1000;
    const averageStretch =
      rope.constraints.reduce(
        (totalStretch, constraint) =>
          totalStretch + getConstraintStretch(constraint),
        0,
      ) / Math.max(rope.constraints.length, 1);
    const pullingForce = Math.max(0.2, baseLoadForce + averageStretch * 0.12);
    const mechanicalAdvantage = Math.max(
      0.6,
      Math.min(1.2, baseLoadForce / Math.max(pullingForce, 0.001)),
    );

    setSimulationMetrics((currentMetrics) => {
      if (
        Math.abs(currentMetrics.pullForce - pullingForce) < 0.03 &&
        Math.abs(currentMetrics.mechanicalAdvantage - mechanicalAdvantage) <
          0.01
      ) {
        return currentMetrics;
      }

      return {
        pullForce: pullingForce,
        mechanicalAdvantage,
      };
    });
  }

  return (
    <div className="space-y-4">
      <SimulationCanvas
        height={360}
        label="Matter.js preview with draggable rope and weight"
        onFrame={handleSimulationFrame}
        overlayRenderer={(overlay) => {
          drawForceOverlay(overlay);
        }}
        renderScene={(scene) => {
          const ceilingY = 28;
          const pulley = createPulley({
            radius: 44,
            x: 320,
            y: 108,
          });
          const rope = createRope({
            endPoint: { x: 486, y: 210 },
            endAnchors: {
              start: { x: 162, y: 74 },
            },
            segmentRadius: 7,
            spacing: 16,
            startPoint: { x: 162, y: 74 },
          });
          pulley.attachRope(rope);
          const weight = attachWeight({
            offset: { x: 0, y: 68 },
            rope,
            size: { height: 78, width: 78 },
          });
          simulationPartsRef.current = {
            rope,
            weight,
          };
          scene.setRopeOverlays([rope]);
          scene.setInteractionConfig({
            draggableBodies: [
              {
                body: rope.end,
                id: "rope-end",
                label: "Rope end",
                snapBack: {
                  anchor: {
                    x: rope.end.position.x,
                    y: rope.end.position.y,
                  },
                  damping: 0.12,
                  stiffness: 0.02,
                },
              },
              {
                body: weight.weight,
                id: "weight",
                label: "Weight",
                snapBack: {
                  anchor: {
                    x: weight.weight.position.x,
                    y: weight.weight.position.y,
                  },
                  damping: 0.14,
                  stiffness: 0.018,
                },
              },
            ],
            momentumScale: 0.94,
          });

          scene.addBody([
            Bodies.rectangle(320, ceilingY, 620, 24, {
              isStatic: true,
              render: { fillStyle: "#0f172a" },
            }),
            Bodies.circle(162, 74, 9, {
              isStatic: true,
              render: { fillStyle: "#0f172a" },
            }),
          ]);
          scene.addComposite([
            pulley.composite,
            rope.composite,
            weight.composite,
          ]);
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ForceMeter value={simulationMetrics.pullForce} />
        <MechanicalAdvantage value={simulationMetrics.mechanicalAdvantage} />
      </div>

      <AdvancedOnly
        fallback={
          <Card className="border-dashed border-sky-300/80 bg-sky-50/80">
            <CardContent className="pt-6 text-sm leading-6 text-slate-700">
              Turn on <span className="font-semibold">Advanced Mode</span> in
              the header to reveal the engineering notes for this pulley scene.
            </CardContent>
          </Card>
        }
      >
        <Card className="border-sky-300/80 bg-slate-950 text-slate-50 shadow-lg shadow-slate-950/20">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
              Advanced Mode
            </div>
            <CardTitle className="font-display text-2xl text-white">
              Tension estimate for the live scene
            </CardTitle>
            <CardDescription className="text-slate-300">
              This preview uses rope stretch as a simple stand-in for tension,
              so students can connect force, load, and mechanical advantage
              before the lesson-specific physics arrives.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
                Pull Force
              </p>
              <p className="mt-2 font-display text-3xl text-white">
                {simulationMetrics.pullForce.toFixed(2)} N
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Estimated from load weight plus average rope-constraint stretch
                in the Matter.js scene.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Mechanical Advantage
              </p>
              <p className="mt-2 font-display text-3xl text-white">
                {simulationMetrics.mechanicalAdvantage.toFixed(2)}x
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Computed as load force divided by pull force, then clamped to
                keep the demo readable.
              </p>
            </div>
          </CardContent>
        </Card>
      </AdvancedOnly>
    </div>
  );
}

export default HomeForceDemo;
