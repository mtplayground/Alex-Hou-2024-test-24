import type { LessonSectionMeta } from "@/lib/lessonRegistry";

export const lessonSections = [
  { id: "moving-with-load", title: "Moving With the Load" },
  { id: "sandbox", title: "Sandbox" },
  { id: "compare", title: "Compare" },
  { id: "rope-distance", title: "Rope Distance" },
] satisfies readonly LessonSectionMeta[];
