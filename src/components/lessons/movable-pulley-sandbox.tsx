import { Bodies, Body as MatterBody } from "matter-js";
import { useRef, useState } from "react";

import SimulationCanvas, {
  type SimulationOverlayApi,
} from "@/components/simulation/simulation-canvas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MovablePulleySandboxProps = {
  label?: string;
};

function drawMovablePulleyOverlay(
  overlay: SimulationOverlayApi,
  pulleyCenter: { x: number; y: number } | null,
  ropeEnd: { x: number; y: number } | null,
  anchorPoint: { x: number; y: number } | null,
  radius: number,
) {
  if (pulleyCenter === null || ropeEnd === null || anchorPoint === null) {
    return;
  }

  const { context } = overlay;
  const leftContact = { x: pulleyCenter.x - radius, y: pulleyCenter.y };

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 6;
  context.strokeStyle = "#475569";
  context.beginPath();
  context.moveTo(anchorPoint.x, anchorPoint.y);
  context.lineTo(leftContact.x, leftContact.y);
  context.arc(pulleyCenter.x, pulleyCenter.y, radius, Math.PI, 0, true);
  context.lineTo(ropeEnd.x, ropeEnd.y);
  context.stroke();

  context.fillStyle = "#0f172a";
  context.beginPath();
  context.arc(anchorPoint.x, anchorPoint.y, 7, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function MovablePulleySandbox({
  label = "Movable pulley sandbox",
}: MovablePulleySandboxProps) {
  const simulationPartsRef = useRef<{
    anchorPoint: { x: number; y: number } | null;
    baseBucketY: number;
    basePulleyY: number;
    pulleyRadius: number;
    ropeEnd: MatterBody | null;
    ropeEndHome: { x: number; y: number } | null;
    weight: MatterBody | null;
    wheel: MatterBody | null;
  }>({
    anchorPoint: null,
    baseBucketY: 0,
    basePulleyY: 0,
    pulleyRadius: 42,
    ropeEnd: null,
    ropeEndHome: null,
    weight: null,
    wheel: null,
  });
  const [distanceState, setDistanceState] = useState({
    bucketRise: 0,
    pullDistance: 0,
  });

  function handleFrame() {
    const ropeEnd = simulationPartsRef.current.ropeEnd;
    const ropeEndHome = simulationPartsRef.current.ropeEndHome;
    const wheel = simulationPartsRef.current.wheel;
    const weight = simulationPartsRef.current.weight;

    if (
      ropeEnd === null ||
      ropeEndHome === null ||
      wheel === null ||
      weight === null
    ) {
      return;
    }

    const pullDistance = Math.max(0, ropeEnd.position.y - ropeEndHome.y);
    const bucketRise = pullDistance / 2;

    MatterBody.setPosition(ropeEnd, {
      x: ropeEndHome.x,
      y: ropeEnd.position.y,
    });
    MatterBody.setVelocity(ropeEnd, { x: 0, y: ropeEnd.velocity.y });
    MatterBody.setPosition(wheel, {
      x: wheel.position.x,
      y: simulationPartsRef.current.basePulleyY - bucketRise,
    });
    MatterBody.setVelocity(wheel, { x: 0, y: 0 });
    MatterBody.setPosition(weight, {
      x: weight.position.x,
      y: simulationPartsRef.current.baseBucketY - bucketRise,
    });
    MatterBody.setVelocity(weight, { x: 0, y: 0 });

    setDistanceState((currentState) => {
      if (
        Math.abs(currentState.pullDistance - pullDistance) < 0.4 &&
        Math.abs(currentState.bucketRise - bucketRise) < 0.4
      ) {
        return currentState;
      }

      return {
        bucketRise,
        pullDistance,
      };
    });
  }

  return (
    <div className="space-y-4">
      <Card className="border-white/70 bg-white/90 shadow-float">
        <CardHeader className="space-y-3">
          <CardTitle className="font-display text-3xl text-slate-900">
            Movable Pulley Sandbox
          </CardTitle>
          <p className="text-base leading-7 text-slate-600">
            Drag the rope end downward. In this setup, the pulley moves with the
            load, so the bucket rises a shorter distance than the rope you pull.
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SimulationCanvas
          className="border-white/70 bg-white/90"
          gravity={{ scale: 0 }}
          height={360}
          label={label}
          onFrame={handleFrame}
          overlayRenderer={(overlay) => {
            drawMovablePulleyOverlay(
              overlay,
              simulationPartsRef.current.wheel === null
                ? null
                : {
                    x: simulationPartsRef.current.wheel.position.x,
                    y: simulationPartsRef.current.wheel.position.y,
                  },
              simulationPartsRef.current.ropeEnd === null
                ? null
                : {
                    x: simulationPartsRef.current.ropeEnd.position.x,
                    y: simulationPartsRef.current.ropeEnd.position.y,
                  },
              simulationPartsRef.current.anchorPoint,
              simulationPartsRef.current.pulleyRadius,
            );
          }}
          width={640}
          renderScene={(scene) => {
            const anchorPoint = { x: 166, y: 86 };
            const pulleyRadius = 42;
            const basePulleyY = 204;
            const wheel = Bodies.circle(318, basePulleyY, pulleyRadius, {
              render: {
                fillStyle: "#cbd5e1",
                lineWidth: 4,
                strokeStyle: "#475569",
              },
            });
            const weight = Bodies.rectangle(318, basePulleyY + 92, 84, 84, {
              render: {
                fillStyle: "#22c55e",
                lineWidth: 3,
                strokeStyle: "#14532d",
              },
            });
            const ropeEnd = Bodies.circle(476, 124, 16, {
              inertia: Infinity,
              label: "movable-rope-end",
              render: {
                fillStyle: "#0ea5e9",
                lineWidth: 3,
                strokeStyle: "#0f172a",
              },
            });

            simulationPartsRef.current = {
              anchorPoint,
              baseBucketY: weight.position.y,
              basePulleyY,
              pulleyRadius,
              ropeEnd,
              ropeEndHome: {
                x: ropeEnd.position.x,
                y: ropeEnd.position.y,
              },
              weight,
              wheel,
            };
            setDistanceState({
              bucketRise: 0,
              pullDistance: 0,
            });

            scene.setInteractionConfig({
              draggableBodies: [
                {
                  body: ropeEnd,
                  id: "movable-pulley-rope-end",
                  label: "Rope end",
                },
              ],
              momentumScale: 0.94,
            });

            scene.addBody([
              Bodies.rectangle(320, 28, 600, 24, {
                isStatic: true,
                render: { fillStyle: "#0f172a" },
              }),
              wheel,
              weight,
              ropeEnd,
            ]);
          }}
        />

        <div className="space-y-4">
          <Card className="border-white/70 bg-white/90 shadow-float">
            <CardHeader className="space-y-2">
              <CardTitle className="font-display text-2xl text-slate-900">
                Distance Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.35rem] bg-slate-950 px-4 py-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Rope Pulled
                </p>
                <p className="mt-2 font-display text-4xl">
                  {distanceState.pullDistance.toFixed(0)} px
                </p>
              </div>
              <div className="rounded-[1.35rem] bg-emerald-600 px-4 py-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                  Bucket Rise
                </p>
                <p className="mt-2 font-display text-4xl">
                  {distanceState.bucketRise.toFixed(0)} px
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-float">
            <CardContent className="space-y-3 pt-6 text-sm leading-6 text-slate-700">
              <p className="font-semibold text-slate-900">What to notice</p>
              <p>
                The rope travels farther than the bucket does. In an ideal
                movable pulley, the tradeoff for needing less force is that you
                must pull more rope.
              </p>
              <p>
                In this simplified sandbox, the bucket rises about half as far
                as the rope is pulled.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MovablePulleySandbox;
