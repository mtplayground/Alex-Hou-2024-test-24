import { useState } from "react";
import { Sparkles, SunMedium } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function App() {
  const [advancedMode, setAdvancedMode] = useState(false);

  return (
    <TooltipProvider delayDuration={150}>
      <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
        <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-sky-200/95 via-cyan-100 to-amber-100 shadow-[0_24px_80px_rgba(14,116,144,0.18)]">
            <CardHeader className="gap-6 pb-4">
              <div className="flex items-center gap-3 text-sky-800">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/80 shadow-sm">
                  <SunMedium className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold uppercase tracking-[0.28em]">
                  Pulley Playground
                </p>
              </div>
              <div className="space-y-4">
                <CardTitle className="max-w-2xl font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
                  Tailwind, shadcn/ui, and theme tokens are ready for the lesson
                  experience.
                </CardTitle>
                <CardDescription className="max-w-xl text-base leading-7 text-slate-700">
                  The foundation now includes a bright, kid-friendly design
                  system with reusable primitives that future issues can build
                  on without restyling from scratch.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="shadow-lg shadow-sky-500/20">
                Launch Workshop
              </Button>
              <Button
                size="lg"
                variant="sunset"
                className="shadow-lg shadow-orange-400/20"
              >
                Explore Themes
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="lg">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Why shadcn?
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Accessible primitives with project-owned source files.
                </TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.1)] backdrop-blur">
            <CardHeader>
              <CardTitle className="font-display text-2xl text-slate-900">
                Theme Preview
              </CardTitle>
              <CardDescription className="text-slate-600">
                Tokens are wired through CSS variables so global theming can
                expand later without rewriting components.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-2xl bg-slate-950/90 p-5 text-slate-50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-300">
                      Advanced mode palette
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {advancedMode ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <Switch
                    checked={advancedMode}
                    onCheckedChange={setAdvancedMode}
                    aria-label="Toggle advanced mode preview"
                  />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Later issues can hook this into state and route-level theme
                  behavior without changing the primitive API surface.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 rounded-2xl bg-primary" />
                <div className="h-20 rounded-2xl bg-secondary" />
                <div className="h-20 rounded-2xl bg-accent" />
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </TooltipProvider>
  );
}

export default App;
