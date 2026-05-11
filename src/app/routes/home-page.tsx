import { lazy, Suspense } from "react";
import {
  ArrowRight,
  BookOpen,
  GalleryHorizontalEnd,
  Orbit,
} from "lucide-react";
import { Link } from "react-router-dom";

import LessonCardGrid from "@/components/lessons/lesson-card-grid";
import DragMatch from "@/components/drag-match/drag-match";
import NumericAnswer from "@/components/numeric-answer/numeric-answer";
import Quiz from "@/components/quiz/quiz";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LazyHomeForceDemo = lazy(
  () => import("@/components/home/home-force-demo"),
);
const LazyHomeHeroSimulationDemo = lazy(
  () => import("@/components/home/home-hero-simulation-demo"),
);
const LazyHomeCompareDemo = lazy(
  () => import("@/components/home/home-compare-demo"),
);

function HomePage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <Card className="overflow-hidden border-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_34%),linear-gradient(135deg,rgba(125,211,252,0.95),rgba(34,211,238,0.82)_42%,rgba(253,224,71,0.86))] shadow-float">
          <CardHeader className="space-y-5 pb-3 pt-8 sm:pt-10">
            <div className="inline-flex w-fit items-center rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-950 shadow-sm">
              Animated pulley demo
            </div>
            <h1 className="max-w-3xl font-display text-4xl tracking-tight text-slate-950 sm:text-5xl xl:text-6xl">
              Start learning with a pulley that never stops moving.
            </h1>
            <CardDescription className="max-w-2xl text-base leading-7 text-slate-800">
              Explore hands-on simulations, short checks, and lesson pages that
              turn force, motion, and mechanical advantage into something you
              can see and play with right away.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pb-8">
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-slate-950 text-white shadow-lg shadow-slate-950/20 hover:bg-slate-900"
              >
                <a href="#lesson-registry">
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/80 bg-white/65 text-slate-900 hover:bg-white"
              >
                <Link to="/gallery">
                  Explore Gallery
                  <GalleryHorizontalEnd className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-900">
                  Home
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Course overview, live demos, and quick practice widgets.
                </p>
              </div>
              <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-900">
                  Lessons
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Metadata-backed lesson routes ready for MDX content.
                </p>
              </div>
              <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-900">
                  Gallery
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Real-world pulley examples from cranes to stage rigging.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-4 shadow-float sm:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.25),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(253,224,71,0.18),transparent_24%)]" />
          <Suspense
            fallback={
              <div className="rounded-[1.5rem] bg-white/5 p-5 text-sm text-slate-200">
                Loading hero simulation...
              </div>
            }
          >
            <LazyHomeHeroSimulationDemo />
          </Suspense>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-coral/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-kid-ink">
              <Orbit className="h-4 w-4" />
              Pulley Diagram
            </div>
            <CardTitle className="font-display text-3xl text-slate-900">
              Deterministic pulley diagrams are ready for lesson scenes.
            </CardTitle>
            <CardDescription className="text-base leading-7 text-slate-600">
              The reusable `PulleyDiagram` component renders a bounded SVG rope
              path, supports direct drag interaction, and exposes derived force
              and mechanical-advantage readouts through context.
            </CardDescription>
          </CardHeader>
        </Card>

        <Suspense
          fallback={
            <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 text-sm text-slate-600 shadow-float">
              Loading force demo...
            </div>
          }
        >
          <LazyHomeForceDemo />
        </Suspense>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-mint/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-950">
              <BookOpen className="h-4 w-4" />
              Quiz Widget
            </div>
            <CardTitle className="font-display text-3xl text-slate-900">
              Multiple-choice checks can now save progress in Zustand.
            </CardTitle>
            <CardDescription className="text-base leading-7 text-slate-600">
              The new `Quiz` widget reveals explanations, gives animated
              feedback for correct and incorrect answers, and persists attempts
              and completion state across reloads.
            </CardDescription>
          </CardHeader>
        </Card>

        <Quiz
          quizId="home-pulley-basics"
          title="Pulley Playground Check-In"
          prompt="A fixed pulley makes lifting easier mainly because it..."
          correctOptionId="b"
          explanation="A fixed pulley changes the direction of the pull, so you can pull down while the load moves up. It does not reduce the amount of force required the way a movable pulley can."
          options={[
            {
              id: "a",
              label: "A",
              text: "cuts the load's weight in half every time",
            },
            {
              id: "b",
              label: "B",
              text: "changes the direction of your pulling force",
            },
            {
              id: "c",
              label: "C",
              text: "removes the need for rope tension entirely",
            },
          ]}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-sun/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-950">
              <Orbit className="h-4 w-4" />
              Drag Match Widget
            </div>
            <CardTitle className="font-display text-3xl text-slate-900">
              Drag real-world examples onto the pulley type they match.
            </CardTitle>
            <CardDescription className="text-base leading-7 text-slate-600">
              The new `DragMatch` widget uses `@dnd-kit/core`, supports
              pointer-based dragging, and saves completion to Zustand so
              students can return to an in-progress board later.
            </CardDescription>
          </CardHeader>
        </Card>

        <DragMatch
          widgetId="home-pulley-drag-match"
          title="Pulley Match Board"
          instructions="Match each picture card to the pulley type it most likely uses."
          items={[
            {
              id: "flagpole",
              image: "🏳️",
              label: "Flagpole",
              matchId: "fixed-pulley",
            },
            {
              id: "crane",
              image: "🏗️",
              label: "Construction crane hook",
              matchId: "movable-pulley",
            },
            {
              id: "stage-rigging",
              image: "🎭",
              label: "Theater stage rigging",
              matchId: "block-and-tackle",
            },
          ]}
          targets={[
            {
              id: "fixed-pulley",
              label: "Fixed Pulley",
              helperText: "Changes pull direction from down to up.",
            },
            {
              id: "movable-pulley",
              label: "Movable Pulley",
              helperText: "Moves with the load to reduce input force.",
            },
            {
              id: "block-and-tackle",
              label: "Block and Tackle",
              helperText: "Combines several pulleys for bigger lifts.",
            },
          ]}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-coral/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-950">
              <BookOpen className="h-4 w-4" />
              Numeric Answer Widget
            </div>
            <CardTitle className="font-display text-3xl text-slate-900">
              Numeric checks can now accept tolerance ranges and reveal worked
              solutions.
            </CardTitle>
            <CardDescription className="text-base leading-7 text-slate-600">
              The new `NumericAnswer` widget validates numeric input against a
              correct value with tolerance, displays units, and reveals the
              worked solution after submission.
            </CardDescription>
          </CardHeader>
        </Card>

        <NumericAnswer
          widgetId="home-mechanical-advantage-answer"
          title="Mechanical Advantage Check"
          prompt="If a setup uses 4 supporting rope segments, what mechanical advantage should you predict?"
          correctValue={4}
          tolerance={0.1}
          unit="x"
          workedSolution="For an ideal pulley system, the mechanical advantage is approximately the number of rope segments supporting the load. With 4 supporting segments, the predicted mechanical advantage is 4x, meaning the input force is about one fourth of the load."
        />
      </section>

      <Suspense
        fallback={
          <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 text-sm text-slate-600 shadow-float">
            Loading comparison demo...
          </div>
        }
      >
        <LazyHomeCompareDemo />
      </Suspense>

      <section
        id="lesson-registry"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <LessonCardGrid />
      </section>
    </div>
  );
}

export default HomePage;
