import type { LessonMeta } from "@/lib/lessonRegistry";

const lessonMeta = {
  slug: "fixed-pulley",
  title: "Fixed Pulley",
  description:
    "See how a fixed pulley changes the direction of the pull so you can pull down while the load goes up.",
  order: 2,
  durationMinutes: 10,
  illustration: "🏁",
  prerequisites: ["what-is-a-pulley"],
  tags: ["direction", "basics"],
} satisfies LessonMeta;

export default lessonMeta;
