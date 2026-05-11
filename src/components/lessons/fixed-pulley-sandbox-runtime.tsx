import {
  Bodies,
  Body as MatterBody,
  type Body,
  type Constraint as MatterConstraintType,
  type Engine,
  type Vector,
} from "matter-js";
import { useRef, useState } from "react";

import AdvancedOnly from "@/components/advanced/advanced-only";
import ForceMeter from "@/components/readouts/force-meter";
import SimulationCanvas from "@/components/simulation/simulation-canvas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  attachWeight,
  createPulley,
  createRope,
} from "@/lib/simulation/pulleys";

type FixedPulleySandboxProps = {
  label?: string;
};

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

function FixedPulleySandbox({
  label = "Fixed pulley adjustable sandbox",
}: FixedPulleySandboxProps) {
  const [loadMassKg, setLoadMassKg] = useState(3);
  const [pullForce, setPullForce] = useState(0);
  const simulationPartsRef = useRef<{
    rope: ReturnType<typeof createRope> | null;
    weight: ReturnType<typeof attachWeight> | null;
  }>({
    rope: null,
    weight: null,
  });

  function handleFrame(engine: Engine) {
    const rope = simulationPartsRef.current.rope;
    const weight = simulationPartsRef.current.weight;

    if (rope === null || weight === null) {
      return;
    }

    const gravityMagnitude =
      Math.hypot(engine.gravity.x, engine.gravity.y) * engine.gravity.scale;
    const baseLoadForce = loadMassKg * gravityMagnitude * 1000;
    const averageStretch =
      rope.constraints.reduce(
        (totalStretch, constraint) =>
          totalStretch + getConstraintStretch(constraint),
        0,
      ) / Math.max(rope.constraints.length, 1);
    const nextPullForce = Math.max(0.2, baseLoadForce + averageStretch * 0.15);

    setPullForce((currentForce) =>
      Math.abs(currentForce - nextPullForce) < 0.05
        ? currentForce
        : nextPullForce,
    );
  }

  const idealForce = loadMassKg * 9.8;

  return (
    <div className="space-y-4">
      <Card className="border-white/70 bg-white/90 shadow-float">
        <CardHeader className="space-y-3">
          <CardTitle className="font-display text-3xl text-slate-900">
            Adjustable Fixed Pulley Sandbox
          </CardTitle>
          <p className="text-base leading-7 text-slate-600">
            Move the slider to make the bucket heavier or lighter, then drag the
            rope end to feel how a fixed pulley changes direction but keeps the
            force about the same.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                Bucket Weight
              </span>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-900">
                {loadMassKg.toFixed(1)} kg
              </span>
            </div>
            <input
              className="h-3 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-500"
              max="6"
              min="1"
              step="0.5"
              type="range"
              value={loadMassKg}
              onChange={(event) => {
                setLoadMassKg(Number(event.target.value));
              }}
            />
          </label>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SimulationCanvas
          className="border-white/70 bg-white/90"
          height={360}
          label={label}
          onFrame={handleFrame}
          width={640}
          renderScene={(scene) => {
            const pulley = createPulley({
              radius: 42,
              x: 310,
              y: 112,
            });
            const rope = createRope({
              endPoint: { x: 478, y: 214 },
              endAnchors: {
                start: { x: 162, y: 78 },
              },
              segmentRadius: 7,
              spacing: 16,
              startPoint: { x: 162, y: 78 },
            });
            pulley.attachRope(rope);
            const weight = attachWeight({
              offset: { x: 0, y: 72 },
              render: {
                fillStyle: "#f59e0b",
                lineWidth: 3,
                strokeStyle: "#78350f",
              },
              rope,
              size: {
                height: 62 + loadMassKg * 6,
                width: 58 + loadMassKg * 4,
              },
            });

            MatterBody.setMass(weight.weight, loadMassKg);

            simulationPartsRef.current = {
              rope,
              weight,
            };
            setPullForce(idealForce);
            scene.setRopeOverlays([rope]);

            scene.setInteractionConfig({
              draggableBodies: [
                {
                  body: rope.end,
                  id: "fixed-pulley-rope-end",
                  label: "Rope end",
                },
              ],
              momentumScale: 0.94,
            });

            scene.addBody([
              Bodies.rectangle(320, 28, 590, 24, {
                isStatic: true,
                render: { fillStyle: "#0f172a" },
              }),
              Bodies.circle(162, 78, 9, {
                isStatic: true,
                render: { fillStyle: "#0f172a" },
              }),
              Bodies.rectangle(120, 264, 92, 10, {
                isStatic: true,
                render: { fillStyle: "#cbd5e1" },
              }),
            ]);
            scene.addComposite([
              pulley.composite,
              rope.composite,
              weight.composite,
            ]);
          }}
        />

        <div className="space-y-4">
          <ForceMeter maxValue={60} value={pullForce} />

          <Card className="border-white/70 bg-white/90 shadow-float">
            <CardContent className="space-y-3 pt-6 text-sm leading-6 text-slate-700">
              <p className="font-semibold text-slate-900">What to notice</p>
              <p>
                As the bucket gets heavier, the force meter climbs. The pulley
                makes it easier to pull downward, but in an ideal fixed pulley
                it does not cut the force by half.
              </p>
              <p>
                Try a light bucket and a heavy bucket, then compare how much the
                meter changes.
              </p>
            </CardContent>
          </Card>

          <AdvancedOnly
            fallback={
              <Card className="border-dashed border-sky-300/80 bg-sky-50/80">
                <CardContent className="pt-6 text-sm leading-6 text-slate-700">
                  Turn on <span className="font-semibold">Advanced Mode</span>{" "}
                  to see the ideal fixed-pulley force estimate.
                </CardContent>
              </Card>
            }
          >
            <Card className="border-slate-900/80 bg-slate-950 text-white shadow-float">
              <CardHeader className="space-y-2">
                <CardTitle className="font-display text-2xl">
                  Formula Overlay
                </CardTitle>
                <p className="text-sm leading-6 text-slate-300">
                  In an ideal fixed pulley, the mechanical advantage is about 1,
                  so the pulling force stays close to the load's weight.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-[1.25rem] bg-white/5 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
                    Ideal Estimate
                  </p>
                  <p className="mt-2 font-display text-3xl">
                    F ≈ m × g = {loadMassKg.toFixed(1)} × 9.8 ={" "}
                    {idealForce.toFixed(1)} N
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-300">
                  The live meter may drift slightly because the simulation also
                  includes rope stretch and motion, but it should stay near the
                  ideal estimate.
                </p>
              </CardContent>
            </Card>
          </AdvancedOnly>
        </div>
      </div>
    </div>
  );
}

export default FixedPulleySandbox;
