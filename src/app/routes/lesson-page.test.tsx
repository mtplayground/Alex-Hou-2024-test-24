import { render, screen } from "@testing-library/react";
import { forwardRef, useImperativeHandle } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LessonPage from "@/app/routes/lesson-page";
import { lessons } from "@/lib/lessonRegistry";
import { resetAppStore } from "@/test/test-utils";

vi.mock("@/components/simulation/simulation-canvas", () => ({
  __esModule: true,
  default: forwardRef(function SimulationCanvasMock(
    {
      label = "Simulation canvas",
      showControls = true,
    }: {
      label?: string;
      showControls?: boolean;
    },
    ref,
  ) {
    useImperativeHandle(ref, () => ({
      pause: vi.fn(),
      play: vi.fn(),
      reset: vi.fn(),
    }));

    return (
      <div data-testid="simulation-canvas-mock">
        {showControls ? "Mocked controls" : "Mocked canvas"}: {label}
      </div>
    );
  }),
}));

describe("LessonPage smoke tests", () => {
  beforeEach(() => {
    resetAppStore();
  });

  it.each(lessons)("renders lesson %s without crashing", (lesson) => {
    render(
      <MemoryRouter initialEntries={[`/lessons/${lesson.slug}`]}>
        <Routes>
          <Route path="/lessons/:slug" element={<LessonPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: lesson.title }),
    ).toBeInTheDocument();
  });
});
