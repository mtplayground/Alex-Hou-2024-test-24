import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import NumericAnswer from "@/components/numeric-answer/numeric-answer";
import { resetAppStore } from "@/test/test-utils";

describe("NumericAnswer", () => {
  beforeEach(() => {
    resetAppStore();
  });

  it("shows a validation error for non-numeric input", async () => {
    const user = userEvent.setup();

    render(
      <NumericAnswer
        correctValue={4}
        prompt="How many rope segments support the load?"
        tolerance={0.1}
        unit="segments"
        widgetId="numeric-invalid"
        workedSolution="Count the strands that directly support the load."
      />,
    );

    await user.type(screen.getByRole("textbox"), "abc");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      screen.getByText(/enter a numeric value before submitting/i),
    ).toBeInTheDocument();
  });

  it("accepts values within tolerance and reveals the worked solution", async () => {
    const user = userEvent.setup();

    render(
      <NumericAnswer
        correctValue={9.8}
        prompt="What force is needed in newtons?"
        tolerance={0.1}
        unit="N"
        widgetId="numeric-correct"
        workedSolution="Use F = m × g with a 1 kg load, so F = 9.8 N."
      />,
    );

    await user.type(screen.getByRole("textbox"), "9.75");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText(/accepted/i)).toBeInTheDocument();
    expect(screen.getByText(/worked solution/i)).toBeInTheDocument();
    expect(
      screen.getByText(/use f = m × g with a 1 kg load/i),
    ).toBeInTheDocument();
  });
});
