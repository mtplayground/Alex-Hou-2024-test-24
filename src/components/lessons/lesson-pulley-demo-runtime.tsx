import {
  Body as MatterBody,
  Bodies,
  type Body,
  type Constraint as MatterConstraintType,
  type Engine,
  type Vector,
} from "matter-js";
import { useRef, useState } from "react";

import ForceMeter from "@/components/readouts/force-meter";
import MechanicalAdvantage from "@/components/readouts/mechanical-advantage";
import SimulationCanvas from "@/components/simulation/simulation-canvas";
import {
  attachWeight,
  createPulley,
  createRope,
} from "@/lib/simulation/pulleys";

type PulleyDemoProps = {
  label?: string;
  showReadouts?: boolean;
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

function LessonPulleyDemo({
  label = "Pulley lesson preview",
  showReadouts = true,
}: PulleyDemoProps) {
  const simulationPartsRef = useRef<{
    rope: ReturnType<typeof createRope> | null;
    ropeEndHome: Vector | null;
    weight: ReturnType<typeof attachWeight> | null;
  }>({
    rope: null,
    ropeEndHome: null,
    weight: null,
  });
  const [metrics, setMetrics] = useState({
    pullForce: 0,
    mechanicalAdvantage: 1,
  });

  function handleFrame(engine: Engine) {
    const rope = simulationPartsRef.current.rope;
    const ropeEndHome = simulationPartsRef.current.ropeEndHome;
    const weight = simulationPartsRef.current.weight;

    if (rope === null || ropeEndHome === null || weight === null) {
      return;
    }

    const cycle = engine.timing.timestamp / 720;
    const target = {
      x: ropeEndHome.x + Math.cos(cycle * 0.5) * 8,
      y: ropeEndHome.y + Math.sin(cycle) * 28,
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

    const gravityMagnitude =
      Math.hypot(engine.gravity.x, engine.gravity.y) * engine.gravity.scale;
    const baseLoadForce = weight.weight.mass * gravityMagnitude * 1000;
    const averageStretch =
      rope.constraints.reduce(
        (totalStretch, constraint) =>
          totalStretch + getConstraintStretch(constraint),
        0,
      ) / Math.max(rope.constraints.length, 1);
    const pullForce = Math.max(0.2, baseLoadForce + averageStretch * 0.12);
    const mechanicalAdvantage = Math.max(
      0.6,
      Math.min(1.2, baseLoadForce / Math.max(pullForce, 0.001)),
    );

    setMetrics((currentMetrics) => {
      if (
        Math.abs(currentMetrics.pullForce - pullForce) < 0.03 &&
        Math.abs(currentMetrics.mechanicalAdvantage - mechanicalAdvantage) <
          0.01
      ) {
        return currentMetrics;
      }

      return {
        pullForce,
        mechanicalAdvantage,
      };
    });
  }

  return (
    <div className="space-y-4 rounded-[1.75rem] bg-slate-950/95 p-4 shadow-float">
      <SimulationCanvas
        className="border-white/10 bg-white/5 shadow-none"
        height={280}
        label={label}
        onFrame={handleFrame}
        showControls={false}
        width={560}
        renderScene={(scene) => {
          const pulley = createPulley({
            radius: 40,
            x: 280,
            y: 96,
          });
          const rope = createRope({
            endPoint: { x: 402, y: 182 },
            endAnchors: {
              start: { x: 134, y: 70 },
            },
            segmentRadius: 7,
            spacing: 16,
            startPoint: { x: 134, y: 70 },
          });
          pulley.attachRope(rope);
          const weight = attachWeight({
            offset: { x: 0, y: 60 },
            rope,
            size: { height: 72, width: 72 },
          });

          simulationPartsRef.current = {
            rope,
            ropeEndHome: {
              x: rope.end.position.x,
              y: rope.end.position.y,
            },
            weight,
          };
          scene.setRopeOverlays([rope]);

          scene.addBody([
            Bodies.rectangle(280, 28, 520, 24, {
              isStatic: true,
              render: { fillStyle: "#e2e8f0" },
            }),
            Bodies.circle(134, 70, 10, {
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

      {showReadouts ? (
        <div className="grid gap-3 md:grid-cols-2">
          <ForceMeter value={metrics.pullForce} />
          <MechanicalAdvantage value={metrics.mechanicalAdvantage} />
        </div>
      ) : null}
    </div>
  );
}

export default LessonPulleyDemo;
