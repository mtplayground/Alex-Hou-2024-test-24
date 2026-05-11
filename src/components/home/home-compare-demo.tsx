import { Bodies, Constraint as MatterConstraint } from "matter-js";

import CompareSimulations from "@/components/simulation/compare-simulations";
import {
  attachWeight,
  createPulley,
  createRope,
} from "@/lib/simulation/pulleys";

function HomeCompareDemo() {
  return (
    <CompareSimulations
      title="Direct Lift vs Fixed Pulley"
      description="These two simulations share one control bar so you can pause, play, and reset them together while comparing a straight lift to a direction-changing pulley."
      height={280}
      left={{
        label: "Direct Lift",
        description:
          "A simple rope lifting a load without any pulley redirecting the force.",
        renderScene: (scene) => {
          const weight = Bodies.rectangle(320, 214, 94, 94, {
            density: 0.003,
            render: {
              fillStyle: "#f97316",
              lineWidth: 2,
              strokeStyle: "#7c2d12",
            },
          });

          scene.addBody([
            Bodies.rectangle(320, 28, 620, 24, {
              isStatic: true,
              render: { fillStyle: "#0f172a" },
            }),
            Bodies.circle(320, 72, 10, {
              isStatic: true,
              render: { fillStyle: "#0f172a" },
            }),
            weight,
          ]);
          scene.addConstraint(
            MatterConstraint.create({
              bodyB: weight,
              damping: 0.06,
              length: 110,
              pointA: { x: 320, y: 72 },
              render: {
                lineWidth: 3,
                strokeStyle: "#475569",
              },
              stiffness: 0.96,
            }),
          );
        },
      }}
      right={{
        label: "Fixed Pulley",
        description:
          "The pulley redirects the pull so the effort can move downward while the load rises.",
        renderScene: (scene) => {
          const pulley = createPulley({
            radius: 42,
            x: 320,
            y: 112,
          });
          const rope = createRope({
            endPoint: { x: 462, y: 202 },
            endAnchors: {
              start: { x: 172, y: 76 },
            },
            segmentRadius: 7,
            spacing: 16,
            startPoint: { x: 172, y: 76 },
          });
          pulley.attachRope(rope);
          const weight = attachWeight({
            offset: { x: 0, y: 68 },
            rope,
            size: { height: 78, width: 78 },
          });

          scene.addBody([
            Bodies.rectangle(320, 28, 620, 24, {
              isStatic: true,
              render: { fillStyle: "#0f172a" },
            }),
            Bodies.circle(172, 76, 9, {
              isStatic: true,
              render: { fillStyle: "#0f172a" },
            }),
          ]);
          scene.addComposite([
            pulley.composite,
            rope.composite,
            weight.composite,
          ]);
        },
      }}
    />
  );
}

export default HomeCompareDemo;
