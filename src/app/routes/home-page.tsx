import {
  Body as MatterBody,
  Bodies,
  Constraint as MatterConstraint,
  type Body,
  type Constraint as MatterConstraintType,
  type Engine,
  type Vector,
} from "matter-js";
import {
  ArrowRight,
  BookOpen,
  GalleryHorizontalEnd,
  Orbit,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import AdvancedOnly from "@/components/advanced/advanced-only";
import SimulationCanvas from "@/components/simulation/simulation-canvas";
import DragMatch from "@/components/drag-match/drag-match";
import NumericAnswer from "@/components/numeric-answer/numeric-answer";
import Quiz from "@/components/quiz/quiz";
import ForceMeter from "@/components/readouts/force-meter";
import MechanicalAdvantage from "@/components/readouts/mechanical-advantage";
import CompareSimulations from "@/components/simulation/compare-simulations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { lessons } from "@/lib/lessonRegistry";
import {
  attachWeight,
  createPulley,
  createRope,
} from "@/lib/simulation/pulleys";
import { drawForceOverlay } from "@/lib/simulation/force-overlay";

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

function HomePage() {
  const heroSimulationPartsRef = useRef<{
    rope: ReturnType<typeof createRope> | null;
    ropeEndHome: Vector | null;
  }>({
    rope: null,
    ropeEndHome: null,
  });
  const simulationPartsRef = useRef<{
    rope: ReturnType<typeof createRope> | null;
    weight: ReturnType<typeof attachWeight> | null;
  }>({
    rope: null,
    weight: null,
  });
  const [simulationMetrics, setSimulationMetrics] = useState({
    pullForce: 0,
    mechanicalAdvantage: 1,
  });

  function handleSimulationFrame(engine: Engine) {
    const rope = simulationPartsRef.current.rope;
    const weight = simulationPartsRef.current.weight;

    if (rope === null || weight === null) {
      return;
    }

    const gravityMagnitude =
      Math.hypot(engine.gravity.x, engine.gravity.y) * engine.gravity.scale;
    const baseLoadForce = weight.weight.mass * gravityMagnitude * 1000;
    const averageStretch =
      rope.constraints.reduce(
        (totalStretch, constraint) =>
          totalStretch + getConstraintStretch(constraint),
        0,
      ) / Math.max(rope.constraints.length, 1);
    const pullingForce = Math.max(0.2, baseLoadForce + averageStretch * 0.12);
    const mechanicalAdvantage = Math.max(
      0.6,
      Math.min(1.2, baseLoadForce / Math.max(pullingForce, 0.001)),
    );

    setSimulationMetrics((currentMetrics) => {
      if (
        Math.abs(currentMetrics.pullForce - pullingForce) < 0.03 &&
        Math.abs(currentMetrics.mechanicalAdvantage - mechanicalAdvantage) <
          0.01
      ) {
        return currentMetrics;
      }

      return {
        pullForce: pullingForce,
        mechanicalAdvantage,
      };
    });
  }

  function handleHeroSimulationFrame(engine: Engine) {
    const rope = heroSimulationPartsRef.current.rope;
    const ropeEndHome = heroSimulationPartsRef.current.ropeEndHome;

    if (rope === null || ropeEndHome === null) {
      return;
    }

    const cycle = engine.timing.timestamp / 620;
    const target = {
      x: ropeEndHome.x + Math.cos(cycle * 0.55) * 8,
      y: ropeEndHome.y + Math.sin(cycle) * 34,
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
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <Card className="overflow-hidden border-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_34%),linear-gradient(135deg,rgba(125,211,252,0.95),rgba(34,211,238,0.82)_42%,rgba(253,224,71,0.86))] shadow-float">
          <CardHeader className="space-y-5 pb-3 pt-8 sm:pt-10">
            <div className="inline-flex w-fit items-center rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-950 shadow-sm">
              Animated pulley demo
            </div>
            <CardTitle className="max-w-3xl font-display text-4xl tracking-tight text-slate-950 sm:text-5xl xl:text-6xl">
              Start learning with a pulley that never stops moving.
            </CardTitle>
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
          <div className="relative space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
                  Idle Loop Demo
                </p>
                <h2 className="mt-2 font-display text-2xl text-white">
                  Pull down, load rises
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                Auto-running
              </div>
            </div>

            <SimulationCanvas
              className="border-white/10 bg-white/5 shadow-none"
              height={320}
              label="Auto-running pulley hero demo"
              onFrame={handleHeroSimulationFrame}
              showControls={false}
              width={560}
              renderScene={(scene) => {
                const pulley = createPulley({
                  arcEndAngle: 0,
                  arcSegments: 12,
                  arcStartAngle: Math.PI,
                  radius: 42,
                  x: 280,
                  y: 110,
                });
                const rope = createRope({
                  endAnchors: {
                    start: { x: 132, y: 78 },
                  },
                  points: [
                    { x: 132, y: 78 },
                    ...pulley.wrapPoints,
                    { x: 402, y: 198 },
                  ],
                  segmentRadius: 7,
                  spacing: 16,
                });
                const weight = attachWeight({
                  offset: { x: 0, y: 66 },
                  rope,
                  size: { height: 74, width: 74 },
                });

                heroSimulationPartsRef.current = {
                  rope,
                  ropeEndHome: {
                    x: rope.end.position.x,
                    y: rope.end.position.y,
                  },
                };

                scene.addBody([
                  Bodies.rectangle(280, 30, 520, 24, {
                    isStatic: true,
                    render: { fillStyle: "#e2e8f0" },
                  }),
                  Bodies.circle(132, 78, 10, {
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

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="bg-white/8 rounded-2xl px-4 py-3 text-sm text-slate-200">
                <p className="font-semibold text-white">See the motion</p>
                <p className="mt-1 leading-6 text-slate-300">
                  The rope end loops continuously so the demo feels alive on
                  first load.
                </p>
              </div>
              <div className="bg-white/8 rounded-2xl px-4 py-3 text-sm text-slate-200">
                <p className="font-semibold text-white">Build intuition</p>
                <p className="mt-1 leading-6 text-slate-300">
                  Watch the load respond before digging into force and
                  mechanical advantage.
                </p>
              </div>
              <div className="bg-white/8 rounded-2xl px-4 py-3 text-sm text-slate-200">
                <p className="font-semibold text-white">Jump into lessons</p>
                <p className="mt-1 leading-6 text-slate-300">
                  Use the call to action to move straight into the lesson
                  registry below.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-kid-coral/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-kid-ink">
              <Orbit className="h-4 w-4" />
              Matter.js wrapper
            </div>
            <CardTitle className="font-display text-3xl text-slate-900">
              Simulation scaffolding is ready for pulley scenes.
            </CardTitle>
            <CardDescription className="text-base leading-7 text-slate-600">
              The reusable `SimulationCanvas` component mounts a Matter.js
              engine, renders to canvas, supports reset and playback controls,
              accepts scene-specific drag targets, and now lets students drag
              the rope end or weight on desktop and touch devices.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          <SimulationCanvas
            height={360}
            label="Matter.js preview with draggable rope and weight"
            onFrame={handleSimulationFrame}
            overlayRenderer={(overlay) => {
              drawForceOverlay(overlay);
            }}
            renderScene={(scene) => {
              const ceilingY = 28;
              const pulley = createPulley({
                arcEndAngle: 0,
                arcSegments: 10,
                arcStartAngle: Math.PI,
                radius: 44,
                x: 320,
                y: 108,
              });
              const rope = createRope({
                endAnchors: {
                  start: { x: 162, y: 74 },
                },
                points: [
                  { x: 162, y: 74 },
                  ...pulley.wrapPoints,
                  { x: 486, y: 210 },
                ],
                segmentRadius: 7,
                spacing: 16,
              });
              const weight = attachWeight({
                offset: { x: 0, y: 68 },
                rope,
                size: { height: 78, width: 78 },
              });
              simulationPartsRef.current = {
                rope,
                weight,
              };
              scene.setInteractionConfig({
                draggableBodies: [
                  {
                    body: rope.end,
                    id: "rope-end",
                    label: "Rope end",
                    snapBack: {
                      anchor: {
                        x: rope.end.position.x,
                        y: rope.end.position.y,
                      },
                      damping: 0.12,
                      stiffness: 0.02,
                    },
                  },
                  {
                    body: weight.weight,
                    id: "weight",
                    label: "Weight",
                    snapBack: {
                      anchor: {
                        x: weight.weight.position.x,
                        y: weight.weight.position.y,
                      },
                      damping: 0.14,
                      stiffness: 0.018,
                    },
                  },
                ],
                momentumScale: 0.94,
              });

              scene.addBody([
                Bodies.rectangle(320, ceilingY, 620, 24, {
                  isStatic: true,
                  render: { fillStyle: "#0f172a" },
                }),
                Bodies.circle(162, 74, 9, {
                  isStatic: true,
                  render: { fillStyle: "#0f172a" },
                }),
              ]);
              scene.addComposite([
                pulley.composite,
                rope.composite,
                weight.composite,
              ]);
            }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ForceMeter value={simulationMetrics.pullForce} />
            <MechanicalAdvantage
              value={simulationMetrics.mechanicalAdvantage}
            />
          </div>

          <AdvancedOnly
            fallback={
              <Card className="border-dashed border-sky-300/80 bg-sky-50/80">
                <CardContent className="pt-6 text-sm leading-6 text-slate-700">
                  Turn on <span className="font-semibold">Advanced Mode</span>{" "}
                  in the header to reveal the engineering notes for this pulley
                  scene.
                </CardContent>
              </Card>
            }
          >
            <Card className="border-sky-300/80 bg-slate-950 text-slate-50 shadow-lg shadow-slate-950/20">
              <CardHeader>
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
                  Advanced Mode
                </div>
                <CardTitle className="font-display text-2xl text-white">
                  Tension estimate for the live scene
                </CardTitle>
                <CardDescription className="text-slate-300">
                  This preview uses rope stretch as a simple stand-in for
                  tension, so students can connect force, load, and mechanical
                  advantage before the lesson-specific physics arrives.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
                    Pull Force
                  </p>
                  <p className="mt-2 font-display text-3xl text-white">
                    {simulationMetrics.pullForce.toFixed(2)} N
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Estimated from load weight plus average rope-constraint
                    stretch in the Matter.js scene.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Mechanical Advantage
                  </p>
                  <p className="mt-2 font-display text-3xl text-white">
                    {simulationMetrics.mechanicalAdvantage.toFixed(2)}x
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Computed as load force divided by pull force, then clamped
                    to keep the demo readable.
                  </p>
                </div>
              </CardContent>
            </Card>
          </AdvancedOnly>
        </div>
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
              arcEndAngle: 0,
              arcSegments: 10,
              arcStartAngle: Math.PI,
              radius: 42,
              x: 320,
              y: 112,
            });
            const rope = createRope({
              endAnchors: {
                start: { x: 172, y: 76 },
              },
              points: [
                { x: 172, y: 76 },
                ...pulley.wrapPoints,
                { x: 462, y: 202 },
              ],
              segmentRadius: 7,
              spacing: 16,
            });
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

      <section
        id="lesson-registry"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {lessons.length > 0 ? (
          lessons.map((lesson) => (
            <Card key={lesson.slug} className="border-white/70 bg-white/85">
              <CardHeader>
                <div className="inline-flex w-fit items-center rounded-full bg-kid-sky/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-900">
                  Lesson {lesson.order}
                </div>
                <CardTitle className="font-display text-2xl text-slate-900">
                  {lesson.title}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {lesson.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link to={`/lessons/${lesson.slug}`}>
                    Open lesson
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed border-slate-300 bg-white/80 md:col-span-2 xl:col-span-3">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-slate-900">
                Lesson registry connected, waiting for content
              </CardTitle>
              <CardDescription className="max-w-3xl text-base leading-7 text-slate-600">
                The router is ready to link lesson cards as soon as metadata
                modules appear under `src/lessons/*/meta.ts`.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-start gap-3 rounded-b-[1.5rem] bg-slate-50/80 p-6 text-sm text-slate-600">
              <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-kid-sky" />
              <p>
                No lessons are registered yet, so the home page shows this
                placeholder instead of real lesson cards.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

export default HomePage;
