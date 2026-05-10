import { Gauge, GalleryHorizontalEnd, Home, Sparkles } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { lessons } from "@/lib/lessonRegistry";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";

const navigationItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Real-World Gallery", to: "/gallery", icon: GalleryHorizontalEnd },
];

function AppShell() {
  const lessonCount = lessons.length;
  const advancedMode = useAppStore((state) => state.advancedMode);
  const setAdvancedMode = useAppStore((state) => state.setAdvancedMode);
  const lessonProgress = useAppStore((state) => state.lessonProgress);
  const soundEnabled = useAppStore((state) => state.soundEnabled);
  const completedLessonCount = lessons.filter(
    (lesson) => lessonProgress[lesson.slug]?.completed === true,
  ).length;
  const startedLessonCount = lessons.filter(
    (lesson) => lessonProgress[lesson.slug]?.started === true,
  ).length;
  const remainingLessonCount = Math.max(lessonCount - completedLessonCount, 0);
  const progressLabel =
    lessonCount > 0
      ? `${String(completedLessonCount)} complete, ${String(
          startedLessonCount,
        )} started, ${String(remainingLessonCount)} remaining`
      : "Progress placeholder: lesson tracking will appear here";

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          "min-h-screen bg-background text-foreground",
          advancedMode && "theme-adventure",
        )}
      >
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
          <header className="sticky top-4 z-20 mb-6 rounded-[2rem] border border-white/60 bg-white/85 p-4 shadow-float backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <NavLink
                  to="/"
                  className="flex items-center gap-3 text-slate-900"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-kid-sky/15 text-kid-ink shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-2xl leading-none">
                      Pulley Playground
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Lessons, simulations, and real-world examples
                    </p>
                  </div>
                </NavLink>

                <nav className="flex flex-wrap gap-2">
                  {navigationItems.map(({ label, to, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                          isActive
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="border-0 bg-slate-950 text-slate-50 shadow-none">
                      <CardContent className="flex items-center gap-3 px-4 py-3">
                        <Gauge className="h-4 w-4 text-kid-sun" />
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                            Progress
                          </p>
                          <p className="text-sm font-medium">
                            {lessonCount > 0
                              ? `${String(completedLessonCount)}/${String(
                                  lessonCount,
                                )}`
                              : "Pending"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>{progressLabel}</TooltipContent>
                </Tooltip>

                <div className="flex items-center justify-between gap-3 rounded-full bg-slate-100 px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Advanced Mode
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {advancedMode ? "On" : "Off"}
                    </p>
                  </div>
                  <Switch
                    checked={advancedMode}
                    onCheckedChange={setAdvancedMode}
                    aria-label="Toggle advanced mode preview"
                  />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <Outlet />
          </main>

          <footer className="mt-8 rounded-[2rem] border border-white/60 bg-white/80 px-6 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-display text-2xl text-slate-900">
                  Built for future pulley lessons
                </p>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  The shell is ready for lesson routes, richer progress state,
                  and content pulled from the lesson registry.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-700">
                <span className="rounded-full bg-kid-sky/15 px-4 py-2">
                  {progressLabel}
                </span>
                <span className="rounded-full bg-kid-sun/25 px-4 py-2">
                  Advanced Mode {advancedMode ? "enabled" : "disabled"}
                </span>
                <span className="rounded-full bg-kid-mint/20 px-4 py-2">
                  Sound {soundEnabled ? "enabled" : "disabled"}
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default AppShell;
