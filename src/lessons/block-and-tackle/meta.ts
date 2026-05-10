import type { LessonMeta } from "@/lib/lessonRegistry";

const lessonMeta = {
  slug: "block-and-tackle",
  title: "Block & Tackle",
  description:
    "Combine multiple pulleys into one lifting system and compare the tradeoff between force and rope distance.",
  order: 4,
  durationMinutes: 14,
  illustration: "🏗️",
  prerequisites: ["movable-pulley"],
  tags: ["compound", "mechanical advantage"],
  advancedAvailable: true,
} satisfies LessonMeta;

export default lessonMeta;
