import type { LessonMeta } from "@/lib/lessonRegistry";

const lessonMeta = {
  slug: "pulleys-in-real-life",
  title: "Pulleys in Real Life",
  description:
    "Tour everyday and industrial pulley examples so students can connect the simulations to real machines.",
  order: 5,
  durationMinutes: 9,
  illustration: "🎡",
  prerequisites: ["block-and-tackle"],
  tags: ["gallery", "applications"],
} satisfies LessonMeta;

export default lessonMeta;
