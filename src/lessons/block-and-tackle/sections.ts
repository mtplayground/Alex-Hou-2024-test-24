import type { LessonSectionMeta } from "@/lib/lessonRegistry";

export const lessonSections = [
  { id: "build-the-rig", title: "Build the Rig" },
  { id: "live-readout", title: "Live Readout" },
  { id: "lift-the-piano", title: "Lift the Piano" },
  { id: "tradeoff", title: "Tradeoff" },
] satisfies readonly LessonSectionMeta[];
