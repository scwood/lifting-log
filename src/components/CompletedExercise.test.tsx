import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeExercise } from "../test-utils/factories";
import { CompletedExercise, CompletedExerciseProps } from "./CompletedExercise";

const defaultExercise = makeExercise({
  name: "Squat",
  sets: 3,
  reps: 5,
  weight: 135,
  workingSets: {
    0: { reps: 5, isLogged: true },
    1: { reps: 5, isLogged: true },
    2: { reps: 5, isLogged: true },
  },
  nextSession: {},
});

function renderCompletedExercise(props: Partial<CompletedExerciseProps> = {}) {
  const user = userEvent.setup();
  const exercise = props.exercise ?? defaultExercise;
  const onUndo = props.onUndo ?? vi.fn();
  render(
    <MantineProvider>
      <CompletedExercise exercise={exercise} onUndo={onUndo} />
    </MantineProvider>,
  );
  return { user, exercise, onUndo };
}

describe("CompletedExercise", () => {
  it("renders the exercise name", () => {
    renderCompletedExercise();
    expect(screen.getByRole("heading", { name: "Squat" })).toBeDefined();
  });

  it("renders the this-session volume load and reps", () => {
    renderCompletedExercise();
    // Mantine <Text> renders as <p>; selector scopes the match to avoid
    // parent containers that also contain this substring
    expect(
      screen.getByText(/This session: 3x5x135 \(5,5,5\)/, { selector: "p" }),
    ).toBeDefined();
  });

  describe("next session volume load", () => {
    it("uses nextSession overrides when set", () => {
      const exercise = makeExercise({
        sets: 3,
        reps: 5,
        weight: 135,
        workingSets: { 0: { reps: 5, isLogged: true } },
        nextSession: { weight: 140 },
      });
      renderCompletedExercise({ exercise });
      expect(
        screen.getByText(/Next session: 3x5x140/, { selector: "p" }),
      ).toBeDefined();
    });

    it("falls back to exercise values when nextSession is empty", () => {
      renderCompletedExercise();
      expect(
        screen.getByText(/Next session: 3x5x135/, { selector: "p" }),
      ).toBeDefined();
    });
  });

  it("calls onUndo with the exercise when Undo is clicked", async () => {
    const onUndo = vi.fn();
    const { user } = renderCompletedExercise({ onUndo });
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledWith(defaultExercise);
  });
});
