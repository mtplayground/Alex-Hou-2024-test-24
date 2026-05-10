import type { LessonMeta } from "@/lib/lessonRegistry";

const lessonMeta = {
  slug: "movable-pulley",
  title: "Movable Pulley",
  description:
    "Follow a pulley that moves with the load and discover why more supporting rope can mean less input force.",
  order: 3,
  durationMinutes: 12,
  illustration: "🎈",
  prerequisites: ["fixed-pulley"],
  tags: ["mechanical advantage", "motion"],
} satisfies LessonMeta;

export default lessonMeta;
