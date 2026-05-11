import { CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { lessons, type RegisteredLessonMeta } from "@/lib/lessonRegistry";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";

function getLessonStatus(
  lesson: RegisteredLessonMeta,
  completedLessons: Set<string>,
  startedLessons: Set<string>,
) {
  const prerequisites = lesson.prerequisites;
  const unlocked = prerequisites.every((slug) => completedLessons.has(slug));
  const completed = completedLessons.has(lesson.slug);
  const started = startedLessons.has(lesson.slug);

  return {
    completed,
    started,
    unlocked,
  };
}

function getLessonActionLabel(status: {
  completed: boolean;
  started: boolean;
  unlocked: boolean;
}) {
  if (!status.unlocked) {
    return "Locked";
  }

  if (status.completed) {
    return "Review lesson";
  }

  if (status.started) {
    return "Continue lesson";
  }

  return "Start lesson";
}

function LessonCardGrid() {
  const lessonProgress = useAppStore((state) => state.lessonProgress);
  const completedLessons = new Set(
    Object.entries(lessonProgress)
      .filter(([, progress]) => progress.completed)
      .map(([slug]) => slug),
  );
  const startedLessons = new Set(
    Object.entries(lessonProgress)
      .filter(([, progress]) => progress.started)
      .map(([slug]) => slug),
  );

  if (lessons.length === 0) {
    return (
      <Card className="border-dashed border-slate-300 bg-white/80 md:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-slate-900">
            Lesson registry connected, waiting for content
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7 text-slate-600">
            The card grid is ready to render lessons automatically as metadata
            modules appear under `src/lessons/*/meta.ts`.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return lessons.map((lesson) => {
    const status = getLessonStatus(lesson, completedLessons, startedLessons);
    const prerequisiteLabels = lesson.prerequisites
      .map(
        (slug) => lessons.find((candidate) => candidate.slug === slug)?.title,
      )
      .filter((title): title is string => title !== undefined);

    return (
      <Card
        key={lesson.slug}
        className={cn(
          "overflow-hidden border-white/70 transition-all duration-200",
          status.unlocked
            ? "bg-white/90 shadow-float"
            : "border-dashed bg-slate-100/90 opacity-80",
        )}
      >
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 via-white to-amber-100 text-3xl shadow-sm">
              <span aria-hidden="true">{lesson.illustration ?? "🧰"}</span>
            </div>

            {status.completed ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </span>
            ) : status.unlocked ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-900">
                <Sparkles className="h-4 w-4" />
                {status.started ? "In Progress" : "Ready"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                <LockKeyhole className="h-4 w-4" />
                Locked
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="inline-flex w-fit items-center rounded-full bg-kid-sky/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-900">
              Lesson {lesson.order}
            </div>
            <CardTitle className="font-display text-2xl text-slate-900">
              {lesson.title}
            </CardTitle>
            <CardDescription className="text-base leading-7 text-slate-600">
              {lesson.description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              {lesson.durationMinutes ?? 10} min
            </span>
            {lesson.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900"
              >
                {tag}
              </span>
            ))}
          </div>

          {prerequisiteLabels.length > 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              Unlock by completing:{" "}
              <span className="font-medium text-slate-900">
                {prerequisiteLabels.join(", ")}
              </span>
            </div>
          ) : (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
              No prerequisites. This lesson is open from the start.
            </div>
          )}

          {status.unlocked ? (
            <Button asChild className="w-full">
              <Link
                to={`/lessons/${lesson.slug}`}
                aria-label={`${getLessonActionLabel(status)}: ${lesson.title}`}
              >
                {getLessonActionLabel(status)}
              </Link>
            </Button>
          ) : (
            <Button disabled className="w-full" variant="secondary">
              {getLessonActionLabel(status)}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  });
}

export default LessonCardGrid;
