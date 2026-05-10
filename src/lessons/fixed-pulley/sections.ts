import type { LessonSectionMeta } from "@/lib/lessonRegistry";

export const lessonSections = [
  { id: "direction-change", title: "Direction Change" },
  { id: "sandbox", title: "Sandbox" },
  { id: "force-formula", title: "Force Formula" },
  { id: "quiz-one", title: "Quiz One" },
  { id: "quiz-two", title: "Quiz Two" },
] satisfies readonly LessonSectionMeta[];
