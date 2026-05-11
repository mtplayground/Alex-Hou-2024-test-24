import { useState } from "react";
import { ArrowRight, CheckCircle2, Compass, Sparkles } from "lucide-react";

import PulleyDiagram from "@/components/pulley/pulley-diagram";
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
  loadWeight: number;
  pulleyCount: number;
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
    loadWeight: 70,
    pulleyCount: 1,
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
    loadWeight: 60,
    pulleyCount: 1,
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
    loadWeight: 1200,
    pulleyCount: 4,
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
    loadWeight: 900,
    pulleyCount: 4,
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
    loadWeight: 140,
    pulleyCount: 2,
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
    loadWeight: 220,
    pulleyCount: 4,
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
    loadWeight: 100,
    pulleyCount: 1,
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
    loadWeight: 110,
    pulleyCount: 1,
    pulleyType: "Fixed",
    ropeMode: "fixed",
    story:
      "The wheel at the top changes the direction of pull and keeps the rope centered.",
  },
];

function RealLifeGallery() {
  const [activeId, setActiveId] = useState(galleryScenarios[0]?.id ?? null);
  const activeScenario =
    galleryScenarios.find((scenario) => scenario.id === activeId) ??
    galleryScenarios[0];

  if (!activeScenario) {
    return null;
  }

  return (
    <div className="space-y-5">
      <Card className="border-white/70 bg-white/90 shadow-float">
        <CardHeader className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-mint/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-950">
            <Compass className="h-4 w-4" />
            Real-World Devices
          </div>
          <CardTitle className="font-display text-3xl text-slate-900">
            Open a machine and inspect its pulley pattern.
          </CardTitle>
          <CardDescription className="text-base leading-7 text-slate-600">
            Pick a device card to open a matching pulley diagram. The same
            fixed, movable, and compound ideas show up again and again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {galleryScenarios.map((scenario) => {
              const active = scenario.id === activeScenario.id;

              return (
                <button
                  key={scenario.id}
                  className={cn(
                    "rounded-[1.4rem] border px-4 py-4 text-left transition",
                    active
                      ? "border-slate-900 bg-slate-950 text-white shadow-lg shadow-slate-950/20"
                      : "border-slate-200 bg-gradient-to-br text-slate-900 hover:border-slate-300",
                    !active && scenario.accentClassName,
                  )}
                  type="button"
                  onClick={() => {
                    setActiveId(scenario.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-3xl">{scenario.icon}</span>
                    {active ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em]">
                    {scenario.pulleyType}
                  </p>
                  <h3 className="mt-2 font-display text-2xl">
                    {scenario.deviceLabel}
                  </h3>
                  <p
                    className={cn(
                      "mt-2 text-sm leading-6",
                      active ? "text-slate-200" : "text-slate-700",
                    )}
                  >
                    {scenario.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <PulleyDiagram
          loadWeight={activeScenario.loadWeight}
          maxPullDistance={180}
          pulleyCount={activeScenario.pulleyCount}
          showForceArrows
          type={activeScenario.ropeMode}
        />

        <Card className="border-white/70 bg-white/90 shadow-float">
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-sun/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-950">
              <Sparkles className="h-4 w-4" />
              {activeScenario.deviceLabel}
            </div>
            <CardTitle className="font-display text-3xl text-slate-900">
              {activeScenario.benefit}
            </CardTitle>
            <CardDescription className="text-base leading-7 text-slate-600">
              {activeScenario.story}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-700">
            <p>
              <span className="font-semibold">Pulley type:</span>{" "}
              {activeScenario.pulleyType}
            </p>
            <p>
              <span className="font-semibold">Diagram load:</span>{" "}
              {activeScenario.loadWeight} N
            </p>
            <p>
              <span className="font-semibold">Why it helps:</span>{" "}
              {activeScenario.benefit}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-2 border-slate-300 bg-white hover:bg-slate-50"
              onClick={() => {
                setActiveId(galleryScenarios[0]?.id ?? null);
              }}
            >
              Back to first example
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RealLifeGallery;
