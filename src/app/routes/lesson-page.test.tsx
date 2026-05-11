import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import LessonPage from "@/app/routes/lesson-page";
import { lessons } from "@/lib/lessonRegistry";
import { resetAppStore } from "@/test/test-utils";

describe("LessonPage smoke tests", () => {
  beforeEach(() => {
    resetAppStore();
  });

  it.each(lessons)("renders lesson %s without crashing", async (lesson) => {
    render(
      <MemoryRouter initialEntries={[`/lessons/${lesson.slug}`]}>
        <Routes>
          <Route path="/lessons/:slug" element={<LessonPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByText("Loading lesson content..."),
    );

    expect(screen.getAllByText(lesson.title).length).toBeGreaterThan(0);
  });
});
