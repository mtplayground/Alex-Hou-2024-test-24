import { Bodies } from "matter-js";

import CompareSimulations from "@/components/simulation/compare-simulations";
import {
  attachWeight,
  createPulley,
  createRope,
} from "@/lib/simulation/pulleys";

function MovablePulleyCompare() {
  return (
    <CompareSimulations
      title="Fixed Pulley vs Movable Pulley"
      description="The left setup redirects your pull. The right setup also changes how far the load moves compared with the rope you pull."
      height={280}
      left={{
        label: "Fixed Pulley",
        description:
          "One top pulley changes the direction of the pull, but the load hangs from a single supporting segment.",
        renderScene: (scene) => {
          const pulley = createPulley({
            radius: 40,
            x: 310,
            y: 96,
          });
          const rope = createRope({
            endPoint: { x: 444, y: 172 },
            endAnchors: {
              start: { x: 170, y: 68 },
            },
            segmentRadius: 7,
            spacing: 16,
            startPoint: { x: 170, y: 68 },
          });
          pulley.attachRope(rope);
          const weight = attachWeight({
            offset: { x: 0, y: 58 },
            rope,
            size: { height: 74, width: 74 },
          });
          scene.setRopeOverlays([rope]);

          scene.addBody([
            Bodies.rectangle(320, 28, 590, 24, {
              isStatic: true,
              render: { fillStyle: "#0f172a" },
            }),
            Bodies.circle(170, 68, 9, {
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
      right={{
        label: "Movable Pulley",
        description:
          "Two supporting rope segments share the load, so the bucket rises a shorter distance than the rope is pulled.",
        renderScene: (scene) => {
          scene.addBody([
            Bodies.rectangle(320, 28, 590, 24, {
              isStatic: true,
              render: { fillStyle: "#0f172a" },
            }),
            Bodies.circle(174, 70, 9, {
              isStatic: true,
              render: { fillStyle: "#0f172a" },
            }),
            Bodies.circle(308, 188, 42, {
              isStatic: true,
              render: {
                fillStyle: "#cbd5e1",
                lineWidth: 4,
                strokeStyle: "#475569",
              },
            }),
            Bodies.rectangle(308, 282, 84, 84, {
              isStatic: true,
              render: {
                fillStyle: "#22c55e",
                lineWidth: 3,
                strokeStyle: "#14532d",
              },
            }),
            Bodies.circle(460, 122, 14, {
              isStatic: true,
              render: {
                fillStyle: "#0ea5e9",
                lineWidth: 3,
                strokeStyle: "#0f172a",
              },
            }),
          ]);
          scene.addConstraint([]);
        },
      }}
    />
  );
}

export default MovablePulleyCompare;
