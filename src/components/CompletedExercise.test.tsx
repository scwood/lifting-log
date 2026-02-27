import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  makeDayExercise,
  makeExerciseDefinition,
} from "../test-utils/factories";
import { CompletedExercise } from "./CompletedExercise";
import type { CompletedExerciseProps } from "./CompletedExercise";

const defaultExercise = makeDayExercise({
  workingSets: {
    0: { reps: 5, isLogged: true, weight: 135 },
    1: { reps: 5, isLogged: true, weight: 135 },
    2: { reps: 5, isLogged: true, weight: 140 },
  },
});

const defaultExerciseDefinition = makeExerciseDefinition({
  name: "Squat",
  trainingLoad: {
    sets: 3,
    reps: 5,
    weight: 135,
  },
});

function renderCompletedExercise(
  propsOverrides: Partial<CompletedExerciseProps> = {},
) {
  const user = userEvent.setup();
  const props: CompletedExerciseProps = {
    exercise: defaultExercise,
    exerciseDefinition: defaultExerciseDefinition,
    onUndo: vi.fn(),
    ...propsOverrides,
  };
  render(
    <MantineProvider>
      <CompletedExercise {...props} />
    </MantineProvider>,
  );
  return { user, ...props };
}

describe("CompletedExercise", () => {
  it("renders the exercise name", () => {
    renderCompletedExercise();
    expect(screen.getByRole("heading", { name: "Squat" })).toBeInTheDocument();
  });

  it("renders the this-session reps x weight values", () => {
    renderCompletedExercise();
    expect(
      screen.getByText(/This session:\s*5x135,\s*5x135,\s*5x140/, {
        selector: "p",
      }),
    ).toBeInTheDocument();
  });

  describe("next session volume load", () => {
    it("uses the exercise definition training load", () => {
      const exerciseDefinition = makeExerciseDefinition({
        trainingLoad: {
          sets: 3,
          reps: 5,
          weight: 140,
        },
      });
      renderCompletedExercise({ exerciseDefinition });
      expect(
        screen.getByText(/Next session: 3x5x140/, { selector: "p" }),
      ).toBeInTheDocument();
    });

    it("renders the default exercise definition training load", () => {
      renderCompletedExercise();
      expect(
        screen.getByText(/Next session: 3x5x135/, { selector: "p" }),
      ).toBeInTheDocument();
    });
  });

  it("calls onUndo with the exercise when Undo is clicked", async () => {
    const onUndo = vi.fn();
    const { user } = renderCompletedExercise({ onUndo });
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledWith(defaultExercise);
  });
});
