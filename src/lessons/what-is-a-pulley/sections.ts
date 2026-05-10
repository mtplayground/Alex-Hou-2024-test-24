import type { LessonSectionMeta } from "@/lib/lessonRegistry";

export const lessonSections = [
  { id: "meet-the-machine", title: "Meet the Machine" },
  { id: "lift-the-bucket", title: "Lift the Bucket" },
  { id: "what-the-wheel-does", title: "What the Wheel Does" },
  { id: "lesson-check", title: "Lesson Check" },
] satisfies readonly LessonSectionMeta[];
