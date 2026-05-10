import { describe, expect, it } from "vitest";

import { getLessonBySlug, lessons } from "@/lib/lessonRegistry";

describe("lessonRegistry", () => {
  it("returns lessons sorted by order", () => {
    const lessonOrders = lessons.map((lesson) => lesson.order);
    const sortedOrders = [...lessonOrders].sort((left, right) => left - right);

    expect(lessonOrders).toEqual(sortedOrders);
  });

  it("registers content and section metadata for every lesson", async () => {
    expect(lessons.length).toBeGreaterThan(0);

    for (const lesson of lessons) {
      const lessonContentModule = await lesson.loadContent();

      expect(lesson.slug).not.toHaveLength(0);
      expect(lesson.lessonSections.length).toBeGreaterThan(0);
      expect(lessonContentModule.default).toBeTypeOf("function");
      expect(getLessonBySlug(lesson.slug)).toBe(lesson);
    }
  });

  it("returns undefined for unknown slugs", () => {
    expect(getLessonBySlug("not-a-real-lesson")).toBeUndefined();
  });
});
