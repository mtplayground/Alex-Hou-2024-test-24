import { ArrowRight, BookOpen, GalleryHorizontalEnd } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { lessons } from "@/lib/lessonRegistry";

function HomePage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-sky-200/95 via-cyan-100 to-amber-100 shadow-float">
          <CardHeader className="space-y-4 pb-4">
            <div className="inline-flex w-fit items-center rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-sky-900 shadow-sm">
              React Router app shell is live
            </div>
            <CardTitle className="max-w-3xl font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
              Learn pulleys through guided lessons and a playful global layout.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7 text-slate-700">
              Home, lesson, and real-world gallery routes are in place, and the
              shell is ready to host richer lesson content as metadata appears
              in the registry.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="shadow-lg shadow-sky-500/20">
              <Link to="/gallery">
                Explore Gallery
                <GalleryHorizontalEnd className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#lesson-registry">
                Browse Lesson Registry
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/85 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-display text-2xl text-slate-900">
              Route Map
            </CardTitle>
            <CardDescription className="text-slate-600">
              The application now has dedicated entry points for the landing
              page, individual lessons, and the real-world gallery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              <p className="font-semibold text-slate-900">Home</p>
              <p className="mt-1">`/` for course overview and lesson list.</p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              <p className="font-semibold text-slate-900">Lesson</p>
              <p className="mt-1">
                ` /lessons/:slug` for metadata-backed lesson entry points.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              <p className="font-semibold text-slate-900">Real-World Gallery</p>
              <p className="mt-1">
                ` /gallery` for examples and inspiration outside the lesson
                track.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

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
