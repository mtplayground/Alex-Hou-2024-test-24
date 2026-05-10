import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { lessonMdxComponents } from "@/components/lessons/lesson-mdx-components";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLessonBySlug, lessons } from "@/lib/lessonRegistry";
import { useAppStore } from "@/store/use-app-store";

function LessonPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lesson = slug === undefined ? undefined : getLessonBySlug(slug);
  const isPresentationMode = searchParams.get("present") === "1";
  const markLessonVisited = useAppStore((state) => state.markLessonVisited);
  const markLessonCompleted = useAppStore((state) => state.markLessonCompleted);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (lesson !== undefined) {
      markLessonVisited(lesson.slug);
    }
  }, [lesson, markLessonVisited]);

  useEffect(() => {
    if (lesson === undefined || lesson.lessonSections.length === 0) {
      return undefined;
    }

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-lesson-section='true']"),
    );

    if (sections.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) => right.intersectionRatio - left.intersectionRatio,
          )[0];

        if (visibleEntry?.target instanceof HTMLElement) {
          setActiveSectionId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.2, 0.45, 0.7],
      },
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, [lesson]);

  const lessonIndex =
    lesson === undefined
      ? -1
      : lessons.findIndex(
          (registeredLesson) => registeredLesson.slug === lesson.slug,
        );
  const previousLesson =
    lessonIndex > 0 ? (lessons[lessonIndex - 1] ?? null) : null;
  const nextLesson =
    lessonIndex >= 0 && lessonIndex < lessons.length - 1
      ? (lessons[lessonIndex + 1] ?? null)
      : null;
  const LessonContent = lesson?.Content ?? null;
  const currentSectionId =
    lesson?.lessonSections.some((section) => section.id === activeSectionId) ===
    true
      ? activeSectionId
      : (lesson?.lessonSections[0]?.id ?? null);
  const activeSectionIndex =
    lesson?.lessonSections.findIndex(
      (section) => section.id === currentSectionId,
    ) ?? -1;
  const progressStep =
    activeSectionIndex >= 0
      ? activeSectionIndex + 1
      : lesson?.lessonSections[0] !== undefined
        ? 1
        : 0;
  const progressPercent =
    lesson !== undefined && lesson.lessonSections.length > 0
      ? (progressStep / lesson.lessonSections.length) * 100
      : 0;

  useEffect(() => {
    if (
      lesson !== undefined &&
      lesson.lessonSections.length > 0 &&
      activeSectionIndex === lesson.lessonSections.length - 1
    ) {
      markLessonCompleted(lesson.slug, true);
    }
  }, [activeSectionIndex, lesson, markLessonCompleted]);

  useEffect(() => {
    if (
      !isPresentationMode ||
      lesson === undefined ||
      lesson.lessonSections.length === 0
    ) {
      return undefined;
    }

    const currentLesson = lesson;

    function scrollToSection(sectionIndex: number) {
      const targetSection = currentLesson.lessonSections[sectionIndex];

      if (targetSection === undefined) {
        return;
      }

      const targetElement = document.getElementById(targetSection.id);
      targetElement?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setActiveSectionId(targetSection.id);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      const activeElement = document.activeElement;

      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement ||
        activeElement?.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      const currentIndex = activeSectionIndex >= 0 ? activeSectionIndex : 0;

      if (event.key === "ArrowRight") {
        if (currentIndex < currentLesson.lessonSections.length - 1) {
          event.preventDefault();
          scrollToSection(currentIndex + 1);
          return;
        }

        if (nextLesson !== null) {
          event.preventDefault();
          void navigate(`/lessons/${nextLesson.slug}?present=1`);
        }

        return;
      }

      if (currentIndex > 0) {
        event.preventDefault();
        scrollToSection(currentIndex - 1);
        return;
      }

      if (previousLesson !== null) {
        event.preventDefault();
        void navigate(`/lessons/${previousLesson.slug}?present=1`);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeSectionIndex,
    isPresentationMode,
    lesson,
    navigate,
    nextLesson,
    previousLesson,
  ]);

  if (lesson === undefined || LessonContent === null) {
    return (
      <Card className="border-dashed border-slate-300 bg-white/85">
        <CardHeader>
          <CardTitle className="font-display text-4xl text-slate-900">
            Lesson route is ready, but this lesson is not registered yet.
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7 text-slate-600">
            The `/lessons/:slug` route is working. Once a metadata module exists
            for this slug, this page will resolve the lesson through the
            registry instead of showing the placeholder state.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back home
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-white via-cyan-50 to-sky-100 shadow-float">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-900 px-4 py-2 text-sm font-semibold text-white">
              <Compass className="h-4 w-4" />
              Lesson {lesson.order}
            </div>
            <div
              data-present-hide="true"
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              <span aria-hidden="true" className="text-xl">
                {lesson.illustration ?? "🧰"}
              </span>
              {lesson.durationMinutes ?? 10} min
            </div>
          </div>
          <CardTitle className="font-display text-4xl text-slate-900 sm:text-5xl">
            {lesson.title}
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7 text-slate-700">
            {lesson.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                Section Progress
              </p>
              <p className="text-sm font-medium text-slate-700">
                {progressStep} / {Math.max(lesson.lessonSections.length, 1)}
              </p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${String(progressPercent)}%` }}
              />
            </div>
            {lesson.lessonSections.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {lesson.lessonSections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={
                      currentSectionId === section.id
                        ? "rounded-full bg-slate-950 px-3 py-2 text-sm font-medium text-white"
                        : "rounded-full bg-white/80 px-3 py-2 text-sm font-medium text-slate-700"
                    }
                  >
                    {index + 1}. {section.title}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to lesson list
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <article className="space-y-6">
        <LessonContent components={lessonMdxComponents} />
      </article>

      <section className="grid gap-4 md:grid-cols-2">
        {previousLesson !== null ? (
          <Card
            data-present-hide="true"
            className="border-white/70 bg-white/85"
          >
            <CardHeader>
              <CardDescription className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Previous lesson
              </CardDescription>
              <CardTitle className="font-display text-2xl text-slate-900">
                {previousLesson.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to={`/lessons/${previousLesson.slug}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go to previous
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card
            data-present-hide="true"
            className="border-dashed border-slate-300 bg-white/80"
          >
            <CardHeader>
              <CardTitle className="font-display text-2xl text-slate-900">
                You are at the first lesson.
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        {nextLesson !== null ? (
          <Card
            data-present-hide="true"
            className="border-white/70 bg-white/85"
          >
            <CardHeader>
              <CardDescription className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Next lesson
              </CardDescription>
              <CardTitle className="font-display text-2xl text-slate-900">
                {nextLesson.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-start md:justify-end">
              <Button asChild>
                <Link to={`/lessons/${nextLesson.slug}`}>
                  Go to next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card
            data-present-hide="true"
            className="border-dashed border-slate-300 bg-white/80"
          >
            <CardHeader>
              <CardTitle className="font-display text-2xl text-slate-900">
                You reached the final lesson in the current path.
              </CardTitle>
            </CardHeader>
          </Card>
        )}
      </section>
    </div>
  );
}

export default LessonPage;
