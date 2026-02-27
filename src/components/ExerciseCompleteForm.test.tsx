import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeExerciseDefinition } from "../test-utils/factories";
import {
  ExerciseCompleteForm,
  ExerciseCompleteFormProps,
} from "./ExerciseCompleteForm";

function renderExerciseCompleteForm(
  propsOverrides: Partial<ExerciseCompleteFormProps> = {},
) {
  const user = userEvent.setup();
  const props: ExerciseCompleteFormProps = {
    exerciseDefinition: makeExerciseDefinition(),
    onSave: vi.fn(),
    ...propsOverrides,
  };
  render(
    <MantineProvider>
      <ExerciseCompleteForm {...props} />
    </MantineProvider>,
  );
  return { user, ...props };
}

describe("ExerciseCompleteForm", () => {
  describe("initial state", () => {
    it("selects Do nothing by default", () => {
      renderExerciseCompleteForm();
      expect(screen.getByRole("radio", { name: "Do nothing" })).toBeChecked();
    });

    it("pre-fills Weight, Sets, and Reps from the exercise", () => {
      renderExerciseCompleteForm({
        exerciseDefinition: makeExerciseDefinition({
          trainingLoad: { weight: 135, sets: 3, reps: 5 },
        }),
      });
      expect(screen.getByRole("textbox", { name: "Weight" })).toHaveValue(
        "135",
      );
      expect(screen.getByRole("textbox", { name: "Sets" })).toHaveValue("3");
      expect(screen.getByRole("textbox", { name: "Reps" })).toHaveValue("5");
    });

    it("disables the Weight, Sets, and Reps fields", () => {
      renderExerciseCompleteForm();
      expect(screen.getByRole("textbox", { name: "Weight" })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Sets" })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Reps" })).toBeDisabled();
    });

    it("enables the Save button", () => {
      renderExerciseCompleteForm();
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });
  });

  describe("field enablement", () => {
    it("keeps fields disabled when Add a rep is selected", async () => {
      const { user } = renderExerciseCompleteForm();
      await user.click(screen.getByRole("radio", { name: "Add a rep" }));
      expect(screen.getByRole("textbox", { name: "Weight" })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Sets" })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Reps" })).toBeDisabled();
    });

    it("keeps fields disabled when Add weight is selected", async () => {
      const { user } = renderExerciseCompleteForm();
      await user.click(screen.getByRole("radio", { name: "Add weight" }));
      expect(screen.getByRole("textbox", { name: "Weight" })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Sets" })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Reps" })).toBeDisabled();
    });

    it("enables fields when Custom is selected", async () => {
      const { user } = renderExerciseCompleteForm();
      await user.click(screen.getByRole("radio", { name: "Custom" }));
      expect(
        screen.getByRole("textbox", { name: "Weight" }),
      ).not.toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Sets" })).not.toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Reps" })).not.toBeDisabled();
    });
  });

  describe("onSave", () => {
    it("saves an empty plan when Do nothing is selected", async () => {
      const { user, onSave } = renderExerciseCompleteForm();
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onSave).toHaveBeenCalledWith({});
    });

    it("saves reps + 1 when Add a rep is selected", async () => {
      const { user, onSave } = renderExerciseCompleteForm({
        exerciseDefinition: makeExerciseDefinition({
          trainingLoad: { weight: 135, sets: 3, reps: 5 },
        }),
      });
      await user.click(screen.getByRole("radio", { name: "Add a rep" }));
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onSave).toHaveBeenCalledWith({ reps: 6 });
    });

    it("saves weight + increment and current reps when Add weight is selected", async () => {
      const { user, onSave } = renderExerciseCompleteForm({
        exerciseDefinition: makeExerciseDefinition({
          minimumWeightIncrement: 5,
          trainingLoad: { weight: 135, sets: 3, reps: 5 },
        }),
      });
      await user.click(screen.getByRole("radio", { name: "Add weight" }));
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onSave).toHaveBeenCalledWith({ weight: 140, reps: 5 });
    });

    it("saves entered weight, sets, and reps when Custom is selected", async () => {
      const { user, onSave } = renderExerciseCompleteForm();
      await user.click(screen.getByRole("radio", { name: "Custom" }));
      const weightInput = screen.getByRole("textbox", { name: "Weight" });
      const setsInput = screen.getByRole("textbox", { name: "Sets" });
      const repsInput = screen.getByRole("textbox", { name: "Reps" });
      await user.clear(weightInput);
      await user.type(weightInput, "150");
      await user.clear(setsInput);
      await user.type(setsInput, "4");
      await user.clear(repsInput);
      await user.type(repsInput, "6");
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onSave).toHaveBeenCalledWith({ weight: 150, sets: 4, reps: 6 });
    });
  });
});
