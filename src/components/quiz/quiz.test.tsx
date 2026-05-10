import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import Quiz from "@/components/quiz/quiz";
import { resetAppStore } from "@/test/test-utils";

describe("Quiz", () => {
  beforeEach(() => {
    resetAppStore();
  });

  it("reveals incorrect feedback and lets the learner try again", async () => {
    const user = userEvent.setup();

    render(
      <Quiz
        correctOptionId="movable"
        explanation="A movable pulley travels with the load."
        options={[
          { id: "fixed", label: "A", text: "A fixed pulley stays in place." },
          {
            id: "movable",
            label: "B",
            text: "A movable pulley travels with the load.",
          },
        ]}
        prompt="Which pulley moves together with the load?"
        quizId="quiz-movable"
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /a fixed pulley stays in place/i,
      }),
    );

    expect(screen.getByText(/not quite yet/i)).toBeInTheDocument();
    expect(screen.getByText(/you chose a/i)).toBeInTheDocument();
    expect(screen.getByText(/attempts 1/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /a movable pulley travels with the load/i,
      }),
    );

    expect(screen.getByText(/correct answer/i)).toBeInTheDocument();
    expect(
      screen.getByText(/explanation revealed and completion saved/i),
    ).toBeInTheDocument();
  });
});
