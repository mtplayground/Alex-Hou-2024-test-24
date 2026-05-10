import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Compass, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PulleyGalleryScenario = {
  accentClassName: string;
  benefit: string;
  description: string;
  deviceLabel: string;
  icon: string;
  id: string;
  liftRatio: number;
  pulleyType: "Compound" | "Fixed" | "Movable";
  ropeMode: "compound" | "fixed" | "movable";
  story: string;
};

const galleryScenarios: PulleyGalleryScenario[] = [
  {
    accentClassName: "from-sky-200 via-cyan-100 to-white",
    benefit: "You pull down and the blind panel rises upward.",
    description: "Window blinds use a fixed pulley to redirect your pull.",
    deviceLabel: "Window blinds",
    icon: "🪟",
    id: "window-blinds",
    liftRatio: 1,
    pulleyType: "Fixed",
    ropeMode: "fixed",
    story:
      "The cord changes direction so your hands can stay low and easy to reach.",
  },
  {
    accentClassName: "from-rose-200 via-orange-100 to-white",
    benefit: "A flag climbs while you pull the rope down at the pole.",
    description: "A flagpole pulley makes lifting simple and tidy.",
    deviceLabel: "Flagpole",
    icon: "🏳️",
    id: "flagpole",
    liftRatio: 1,
    pulleyType: "Fixed",
    ropeMode: "fixed",
    story: "The pulley at the top turns a downward pull into an upward lift.",
  },
  {
    accentClassName: "from-amber-200 via-yellow-100 to-white",
    benefit: "Several rope segments share the load of the heavy hook.",
    description: "Crane blocks use a compound system for huge loads.",
    deviceLabel: "Crane",
    icon: "🏗️",
    id: "crane",
    liftRatio: 0.32,
    pulleyType: "Compound",
    ropeMode: "compound",
    story:
      "Block-and-tackle rigs let construction crews lift more with manageable force.",
  },
  {
    accentClassName: "from-slate-200 via-zinc-100 to-white",
    benefit: "Multiple sheaves guide the cable and steady the car.",
    description: "Elevator hoists combine redirection and load sharing.",
    deviceLabel: "Elevator",
    icon: "🛗",
    id: "elevator",
    liftRatio: 0.36,
    pulleyType: "Compound",
    ropeMode: "compound",
    story:
      "The motor and cable system keeps the elevator car balanced and controlled.",
  },
  {
    accentClassName: "from-lime-200 via-emerald-100 to-white",
    benefit: "One moving pulley helps the weight stack feel lighter.",
    description: "Gym cables often use movable pulleys to shape resistance.",
    deviceLabel: "Gym cable",
    icon: "🏋️",
    id: "gym-cable",
    liftRatio: 0.5,
    pulleyType: "Movable",
    ropeMode: "movable",
    story:
      "The handle travels farther than the stack, which spreads the work across rope segments.",
  },
  {
    accentClassName: "from-cyan-200 via-sky-100 to-white",
    benefit: "Rigging blocks help sailors trim heavy sails in the wind.",
    description: "Sailboats rely on compound pulley arrangements.",
    deviceLabel: "Sailboat",
    icon: "⛵",
    id: "sailboat",
    liftRatio: 0.34,
    pulleyType: "Compound",
    ropeMode: "compound",
    story:
      "Extra pulleys make it possible to tighten sail lines with finer control.",
  },
  {
    accentClassName: "from-fuchsia-200 via-pink-100 to-white",
    benefit: "The curtain opens sideways while stagehands pull from below.",
    description: "Theatre curtains use fixed pulleys to route the lines.",
    deviceLabel: "Theatre curtain",
    icon: "🎭",
    id: "theatre-curtain",
    liftRatio: 1,
    pulleyType: "Fixed",
    ropeMode: "fixed",
    story:
      "The rope path twists around corners so the control line can stay backstage.",
  },
  {
    accentClassName: "from-stone-200 via-amber-50 to-white",
    benefit: "A bucket rises from the well while the person pulls downward.",
    description: "A well bucket is a classic fixed-pulley example.",
    deviceLabel: "Well bucket",
    icon: "🪣",
    id: "well-bucket",
    liftRatio: 1,
    pulleyType: "Fixed",
    ropeMode: "fixed",
    story:
      "The wheel at the top changes the direction of pull and keeps the rope centered.",
  },
];

type MiniSimulationProps = {
  scenario: PulleyGalleryScenario;
};

function DeviceMiniSimulation({ scenario }: MiniSimulationProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let animationFrameId = 0;

    function animate(time: number) {
      setPhase(time / 900);
      animationFrameId = window.requestAnimationFrame(animate);
    }

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const pullWave = (Math.sin(phase) + 1) / 2;
  const secondaryWave = (Math.sin(phase * 0.7 + 1.2) + 1) / 2;
  const ropeTravel = 54 + pullWave * 110;
  const loadTravel = ropeTravel * scenario.liftRatio;
  const compoundOffset =
    scenario.ropeMode === "compound" ? loadTravel * 0.85 : 0;
  const topBeamY = 52;
  const lowerPulleyY = 210 - compoundOffset;
  const loadY = 282 - loadTravel;
  const ropeEndY = 122 + ropeTravel;
  const movableRopeEndY = 124 + ropeTravel;
  const svg = (value: number) => value.toFixed(1);
  const accentFill =
    scenario.ropeMode === "compound"
      ? "#f97316"
      : scenario.ropeMode === "movable"
        ? "#0ea5e9"
        : "#8b5cf6";
  const loadFill =
    scenario.ropeMode === "compound"
      ? "#f59e0b"
      : scenario.ropeMode === "movable"
        ? "#22c55e"
        : "#ec4899";

  function renderDecoration() {
    switch (scenario.id) {
      case "window-blinds":
        return (
          <>
            <rect
              fill="#dbeafe"
              height="116"
              rx="16"
              width="96"
              x="324"
              y="88"
            />
            {Array.from({ length: 6 }, (_, index) => (
              <rect
                key={String(index)}
                fill="#93c5fd"
                height="10"
                rx="4"
                width="84"
                x="330"
                y={96 + index * 16}
              />
            ))}
          </>
        );
      case "flagpole":
        return (
          <>
            <rect
              fill="#475569"
              height="192"
              rx="8"
              width="12"
              x="330"
              y="56"
            />
            <path
              d={`M342 90 L396 ${svg(86 + secondaryWave * 14)} L360 ${svg(112 + secondaryWave * 10)} L396 ${svg(136 + secondaryWave * 16)} L342 132 Z`}
              fill="#ef4444"
              opacity="0.92"
            />
          </>
        );
      case "crane":
        return (
          <>
            <path
              d="M70 232 L146 74 L220 74 L142 232 Z"
              fill="#fbbf24"
              opacity="0.9"
            />
            <rect
              fill="#f59e0b"
              height="16"
              rx="6"
              width="190"
              x="146"
              y="78"
            />
            <rect
              fill="#334155"
              height="26"
              rx="10"
              width="70"
              x="286"
              y={loadY - 12}
            />
          </>
        );
      case "elevator":
        return (
          <>
            <rect
              fill="#cbd5e1"
              height="194"
              rx="22"
              width="132"
              x="266"
              y="54"
            />
            <rect
              fill="#475569"
              height="126"
              rx="18"
              width="80"
              x="292"
              y={loadY - 34}
            />
            <rect
              fill="#e2e8f0"
              height="62"
              rx="12"
              width="54"
              x="305"
              y={loadY - 8}
            />
          </>
        );
      case "gym-cable":
        return (
          <>
            <rect
              fill="#475569"
              height="206"
              rx="16"
              width="18"
              x="306"
              y="42"
            />
            <rect
              fill="#22c55e"
              height="72"
              rx="10"
              width="74"
              x="340"
              y={loadY - 14}
            />
            <path
              d={`M120 ${svg(ropeEndY)} Q156 ${svg(ropeEndY + 18)} 192 ${svg(ropeEndY)}`}
              fill="none"
              stroke="#0f172a"
              strokeLinecap="round"
              strokeWidth="10"
            />
          </>
        );
      case "sailboat":
        return (
          <>
            <path
              d="M108 236 L412 236 L384 266 L136 266 Z"
              fill="#0f172a"
              opacity="0.92"
            />
            <rect
              fill="#475569"
              height="164"
              rx="8"
              width="10"
              x="252"
              y="66"
            />
            <path
              d={`M262 78 L342 ${svg(82 + secondaryWave * 10)} L262 194 Z`}
              fill="#e0f2fe"
              opacity="0.95"
              stroke="#7dd3fc"
              strokeWidth="3"
            />
          </>
        );
      case "theatre-curtain":
        return (
          <>
            <rect
              fill="#7c2d12"
              height="24"
              rx="10"
              width="310"
              x="100"
              y="54"
            />
            <path
              d={`M110 78 H402 V216 Q370 ${svg(224 + secondaryWave * 8)} 338 216 Q306 ${svg(208 - secondaryWave * 8)} 274 216 Q242 ${svg(224 + secondaryWave * 8)} 210 216 Q178 ${svg(208 - secondaryWave * 8)} 146 216 Q128 ${svg(214 + secondaryWave * 6)} 110 216 Z`}
              fill="#ef4444"
              opacity="0.86"
            />
          </>
        );
      case "well-bucket":
        return (
          <>
            <path
              d="M138 92 L186 238"
              fill="none"
              stroke="#92400e"
              strokeWidth="10"
            />
            <path
              d="M346 92 L298 238"
              fill="none"
              stroke="#92400e"
              strokeWidth="10"
            />
            <rect
              fill="#78350f"
              height="12"
              rx="6"
              width="224"
              x="130"
              y="90"
            />
            <path
              d={`M212 ${svg(loadY)} H288 L274 ${svg(loadY + 44)} H226 Z`}
              fill="#a16207"
              stroke="#713f12"
              strokeWidth="4"
            />
          </>
        );
      default:
        return null;
    }
  }

  function renderRope() {
    if (scenario.ropeMode === "fixed") {
      return (
        <>
          <path
            d={`M180 92 H246 A24 24 0 0 1 294 92 L294 ${svg(ropeEndY)} M246 92 L246 ${svg(loadY)}`}
            fill="none"
            stroke={accentFill}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="8"
          />
          <circle
            cx="270"
            cy="92"
            fill="#cbd5e1"
            r="24"
            stroke="#475569"
            strokeWidth="4"
          />
          <circle cx="270" cy="92" fill="#64748b" r="6" />
          <circle
            cx="246"
            cy={loadY}
            fill={loadFill}
            r="18"
            stroke="#0f172a"
            strokeWidth="4"
          />
          <circle
            cx="294"
            cy={ropeEndY}
            fill={accentFill}
            r="14"
            stroke="#0f172a"
            strokeWidth="4"
          />
        </>
      );
    }

    if (scenario.ropeMode === "movable") {
      return (
        <>
          <path
            d={`M164 92 H238 A24 24 0 0 1 286 92 L286 ${svg(lowerPulleyY)} A24 24 0 0 1 334 ${svg(lowerPulleyY)} L334 ${svg(movableRopeEndY)}`}
            fill="none"
            stroke={accentFill}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="8"
          />
          <circle
            cx="262"
            cy="92"
            fill="#cbd5e1"
            r="24"
            stroke="#475569"
            strokeWidth="4"
          />
          <circle
            cx="310"
            cy={lowerPulleyY}
            fill="#cbd5e1"
            r="24"
            stroke="#475569"
            strokeWidth="4"
          />
          <rect
            fill={loadFill}
            height="54"
            rx="14"
            stroke="#14532d"
            strokeWidth="4"
            width="88"
            x="266"
            y={loadY}
          />
          <circle
            cx="334"
            cy={movableRopeEndY}
            fill={accentFill}
            r="14"
            stroke="#0f172a"
            strokeWidth="4"
          />
        </>
      );
    }

    return (
      <>
        <path
          d={`M134 ${svg(topBeamY)} H362 M168 92 H214 A22 22 0 0 1 258 92 L258 ${svg(lowerPulleyY)} A22 22 0 0 1 302 ${svg(lowerPulleyY)} L302 92 A22 22 0 0 1 346 92 L346 ${svg(ropeEndY)}`}
          fill="none"
          stroke={accentFill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8"
        />
        <circle
          cx="236"
          cy="92"
          fill="#cbd5e1"
          r="22"
          stroke="#475569"
          strokeWidth="4"
        />
        <circle
          cx="324"
          cy="92"
          fill="#cbd5e1"
          r="22"
          stroke="#475569"
          strokeWidth="4"
        />
        <circle
          cx="280"
          cy={lowerPulleyY}
          fill="#cbd5e1"
          r="22"
          stroke="#475569"
          strokeWidth="4"
        />
        <rect
          fill={loadFill}
          height="60"
          rx="16"
          stroke="#78350f"
          strokeWidth="4"
          width="92"
          x="234"
          y={loadY}
        />
        <circle
          cx="346"
          cy={ropeEndY}
          fill={accentFill}
          r="14"
          stroke="#0f172a"
          strokeWidth="4"
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-[2rem] border border-white/70 bg-gradient-to-br p-4 shadow-float",
          scenario.accentClassName,
        )}
      >
        <svg
          aria-label={`${scenario.deviceLabel} mini simulation`}
          className="h-auto w-full"
          role="img"
          viewBox="0 0 460 300"
        >
          <rect
            fill="rgba(255,255,255,0.64)"
            height="300"
            rx="30"
            width="460"
          />
          <rect fill="#0f172a" height="14" rx="7" width="226" x="120" y="38" />
          {renderDecoration()}
          {renderRope()}
        </svg>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[1.4rem] bg-slate-950 px-4 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Pulley Type
          </p>
          <p className="mt-2 font-display text-3xl">{scenario.pulleyType}</p>
        </div>
        <div className="rounded-[1.4rem] bg-white/90 px-4 py-4 shadow-sm ring-1 ring-slate-200/80">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            What It Does
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {scenario.benefit}
          </p>
        </div>
        <div className="rounded-[1.4rem] bg-white/90 px-4 py-4 shadow-sm ring-1 ring-slate-200/80">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Why Engineers Use It
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {scenario.story}
          </p>
        </div>
      </div>
    </div>
  );
}

function RealLifeGallery() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    galleryScenarios[0]?.id ?? "",
  );
  const selectedScenario =
    galleryScenarios.find((scenario) => scenario.id === selectedScenarioId) ??
    galleryScenarios[0];

  if (selectedScenario === undefined) {
    return null;
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-white/70 bg-white/90 shadow-float">
        <CardHeader className="space-y-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-sky/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-950">
            <Compass className="h-4 w-4" />
            Scrollable Gallery
          </div>
          <CardTitle className="font-display text-3xl text-slate-900">
            Explore how one pulley idea shows up in very different machines.
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7 text-slate-600">
            Slide through the device cards, pick one, and open its
            mini-simulation. Watch how the rope path and moving load change from
            one real-world system to the next.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="-mx-1 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-4 px-1">
              {galleryScenarios.map((scenario) => {
                const selected = scenario.id === selectedScenario.id;

                return (
                  <button
                    key={scenario.id}
                    className={cn(
                      "w-72 shrink-0 rounded-[1.8rem] border bg-white p-4 text-left shadow-sm transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
                      selected
                        ? "border-sky-400 bg-sky-50 shadow-[0_22px_50px_rgba(14,165,233,0.18)]"
                        : "border-slate-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]",
                    )}
                    type="button"
                    onClick={() => {
                      setSelectedScenarioId(scenario.id);
                    }}
                  >
                    <div
                      className={cn(
                        "mb-4 rounded-[1.5rem] bg-gradient-to-br p-4",
                        scenario.accentClassName,
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-4xl" aria-hidden="true">
                          {scenario.icon}
                        </span>
                        {selected ? (
                          <CheckCircle2 className="h-6 w-6 text-sky-700" />
                        ) : (
                          <Sparkles className="h-6 w-6 text-slate-500" />
                        )}
                      </div>
                      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-slate-600">
                        {scenario.pulleyType} pulley
                      </p>
                      <p className="mt-2 font-display text-2xl text-slate-900">
                        {scenario.deviceLabel}
                      </p>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">
                      {scenario.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50/80 p-3">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2 pt-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Open Mini-Simulation
                </p>
                <h3 className="font-display text-3xl text-slate-900">
                  {selectedScenario.icon} {selectedScenario.deviceLabel}
                </h3>
              </div>
              <Button
                className="rounded-full"
                type="button"
                onClick={() => {
                  const currentIndex = galleryScenarios.findIndex(
                    (scenario) => scenario.id === selectedScenario.id,
                  );
                  const nextScenario =
                    galleryScenarios[
                      (currentIndex + 1) % galleryScenarios.length
                    ];

                  if (nextScenario !== undefined) {
                    setSelectedScenarioId(nextScenario.id);
                  }
                }}
              >
                Next Device
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <DeviceMiniSimulation scenario={selectedScenario} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RealLifeGallery;
