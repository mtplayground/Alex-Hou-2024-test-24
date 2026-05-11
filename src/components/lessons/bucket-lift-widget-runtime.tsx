import { Bodies } from "matter-js";
import { useRef, useState } from "react";

import SimulationCanvas from "@/components/simulation/simulation-canvas";
import { Card, CardContent } from "@/components/ui/card";
import {
  attachWeight,
  createPulley,
  createRope,
} from "@/lib/simulation/pulleys";

function BucketLiftWidget() {
  const simulationPartsRef = useRef<{
    initialBucketY: number | null;
    rope: ReturnType<typeof createRope> | null;
    weight: ReturnType<typeof attachWeight> | null;
  }>({
    initialBucketY: null,
    rope: null,
    weight: null,
  });
  const [liftState, setLiftState] = useState({
    challengeComplete: false,
    currentLift: 0,
    maxLift: 0,
  });

  function handleFrame() {
    const weight = simulationPartsRef.current.weight;
    const initialBucketY = simulationPartsRef.current.initialBucketY;

    if (weight === null || initialBucketY === null) {
      return;
    }

    const currentLift = Math.max(0, initialBucketY - weight.weight.position.y);

    setLiftState((currentState) => {
      const maxLift = Math.max(currentState.maxLift, currentLift);
      const challengeComplete = maxLift >= 34;

      if (
        Math.abs(currentState.currentLift - currentLift) < 0.5 &&
        Math.abs(currentState.maxLift - maxLift) < 0.5 &&
        currentState.challengeComplete === challengeComplete
      ) {
        return currentState;
      }

      return {
        challengeComplete,
        currentLift,
        maxLift,
      };
    });
  }

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-sky-950 via-slate-900 to-cyan-950 shadow-float">
      <CardContent className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
            Hands-On Challenge
          </p>
          <h3 className="font-display text-3xl text-white">
            Pull the rope down to lift the bucket
          </h3>
          <p className="max-w-3xl text-base leading-7 text-slate-200">
            Grab the rope end and drag downward. Watch the wheel guide the rope
            while the bucket rises on the other side.
          </p>
        </div>

        <SimulationCanvas
          className="border-white/10 bg-white/5 shadow-none"
          height={360}
          label="Draggable bucket lift pulley widget"
          onFrame={handleFrame}
          width={620}
          renderScene={(scene) => {
            const pulley = createPulley({
              radius: 42,
              x: 292,
              y: 112,
            });
            const rope = createRope({
              endPoint: { x: 454, y: 214 },
              endAnchors: {
                start: { x: 152, y: 76 },
              },
              segmentRadius: 7,
              spacing: 16,
              startPoint: { x: 152, y: 76 },
            });
            pulley.attachRope(rope);
            const weight = attachWeight({
              offset: { x: 0, y: 70 },
              render: {
                fillStyle: "#38bdf8",
                lineWidth: 3,
                strokeStyle: "#0f172a",
              },
              rope,
              size: { height: 86, width: 70 },
            });

            simulationPartsRef.current = {
              initialBucketY: weight.weight.position.y,
              rope,
              weight,
            };
            setLiftState({
              challengeComplete: false,
              currentLift: 0,
              maxLift: 0,
            });

            scene.setInteractionConfig({
              draggableBodies: [
                {
                  body: rope.end,
                  id: "bucket-rope-end",
                  label: "Rope end",
                },
              ],
              momentumScale: 0.92,
            });

            scene.addBody([
              Bodies.rectangle(310, 28, 560, 24, {
                isStatic: true,
                render: { fillStyle: "#e2e8f0" },
              }),
              Bodies.circle(152, 76, 9, {
                isStatic: true,
                render: { fillStyle: "#f8fafc" },
              }),
              Bodies.rectangle(116, 246, 84, 10, {
                isStatic: true,
                render: { fillStyle: "#fbbf24" },
              }),
            ]);
            scene.addComposite([
              pulley.composite,
              rope.composite,
              weight.composite,
            ]);
          }}
        />

        <div className="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.5rem] bg-white/10 px-4 py-4 text-sm leading-6 text-slate-200">
            <p className="font-semibold text-white">What to notice</p>
            <p className="mt-2">
              Your hand moves the rope end down. The wheel does not pull by
              itself. Instead, it guides the rope so the bucket can move up on
              the other side.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white/10 px-4 py-4 text-sm text-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
              Bucket Lift
            </p>
            <p className="mt-2 font-display text-4xl text-white">
              {liftState.maxLift.toFixed(0)} px
            </p>
            <p className="mt-2 leading-6">
              {liftState.challengeComplete
                ? "Nice work. You lifted the bucket high enough to finish the challenge."
                : "Try lifting the bucket at least 34 px to complete the challenge."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BucketLiftWidget;
