import { ArrowLeft, Compass } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLessonBySlug } from "@/lib/lessonRegistry";

function LessonPage() {
  const { slug } = useParams();
  const lesson = slug === undefined ? undefined : getLessonBySlug(slug);

  if (lesson === undefined) {
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
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-900 px-4 py-2 text-sm font-semibold text-white">
            <Compass className="h-4 w-4" />
            Lesson {lesson.order}
          </div>
          <CardTitle className="font-display text-4xl text-slate-900 sm:text-5xl">
            {lesson.title}
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7 text-slate-700">
            {lesson.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to lesson list
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/85">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-slate-900">
            Content shell placeholder
          </CardTitle>
          <CardDescription className="text-base leading-7 text-slate-600">
            This route now resolves lesson metadata by slug. The MDX lesson body
            and lesson-specific shell will slot into this page in later issues.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default LessonPage;
