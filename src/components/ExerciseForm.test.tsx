import { MantineProvider } from "@mantine/core";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeExercise, makeWarmUpSet } from "../test-utils/factories";
import { testTheme } from "../test-utils/testTheme";
import { ExerciseType } from "../types/ExerciseType";
import { ExerciseForm, ExerciseModalProps } from "./ExerciseForm";

const testUuid = "test-uuid";
vi.mock("uuid", () => ({ v4: () => testUuid }));

function renderExerciseForm(props: Partial<ExerciseModalProps> = {}) {
  const user = userEvent.setup();
  const onSave = props.onSave ?? vi.fn();
  render(
    <MantineProvider theme={testTheme}>
      <ExerciseForm onSave={onSave} defaultValues={props.defaultValues} />
    </MantineProvider>,
  );
  return { user, onSave };
}

describe("ExerciseForm", () => {
  describe("initial state", () => {
    it("leaves the Name, Weight, Sets, and Reps fields empty", () => {
      renderExerciseForm();
      expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("");
      expect(screen.getByRole("textbox", { name: "Weight" })).toHaveValue("");
      expect(screen.getByRole("textbox", { name: "Sets" })).toHaveValue("");
      expect(screen.getByRole("textbox", { name: "Reps" })).toHaveValue("");
    });

    it("selects Two sets of plates by default", () => {
      renderExerciseForm();
      expect(
        screen.getByRole("radio", { name: "Two sets of plates" }),
      ).toBeChecked();
    });

    it("does not show the Minimum weight increment field", () => {
      renderExerciseForm();
      expect(
        screen.queryByRole("textbox", { name: "Minimum weight increment" }),
      ).toBeNull();
    });

    it("disables the Save button", () => {
      renderExerciseForm();
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });
  });

  describe("with defaultValues", () => {
    it("pre-fills the Name, Weight, Sets, and Reps fields", () => {
      renderExerciseForm({
        defaultValues: makeExercise({
          name: "Squat",
          weight: 135,
          sets: 3,
          reps: 5,
        }),
      });
      expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue(
        "Squat",
      );
      expect(screen.getByRole("textbox", { name: "Weight" })).toHaveValue(
        "135",
      );
      expect(screen.getByRole("textbox", { name: "Sets" })).toHaveValue("3");
      expect(screen.getByRole("textbox", { name: "Reps" })).toHaveValue("5");
    });

    it("selects the correct type radio", () => {
      renderExerciseForm({
        defaultValues: makeExercise({ type: ExerciseType.SinglePlate }),
      });
      expect(
        screen.getByRole("radio", { name: "One set of plates" }),
      ).toBeChecked();
    });

    it("renders warm-up set cards from defaultValues", () => {
      renderExerciseForm({
        defaultValues: makeExercise({
          warmUpSets: [makeWarmUpSet({ reps: 5, value: 60 })],
        }),
      });
      expect(
        screen.getByText(/5 reps with 60% of working weight/),
      ).toBeInTheDocument();
    });

    it("enables the Save button", () => {
      renderExerciseForm({ defaultValues: makeExercise() });
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });
  });

  describe("exercise type", () => {
    it("shows the Minimum weight increment field when Other is selected", async () => {
      const { user } = renderExerciseForm();
      await user.click(screen.getByRole("radio", { name: "Other" }));
      expect(
        screen.getByRole("textbox", { name: "Minimum weight increment" }),
      ).toBeInTheDocument();
    });

    it("hides the Minimum weight increment field when a plate type is selected", async () => {
      const { user } = renderExerciseForm({
        defaultValues: makeExercise({ type: ExerciseType.Other }),
      });
      await user.click(
        screen.getByRole("radio", { name: "Two sets of plates" }),
      );
      expect(
        screen.queryByRole("textbox", { name: "Minimum weight increment" }),
      ).toBeNull();
    });

    it("saves minimumWeightIncrement of 2.5 when One set of plates is selected", async () => {
      const exercise = makeExercise();
      const onSave = vi.fn();
      const { user } = renderExerciseForm({ defaultValues: exercise, onSave });
      await user.click(
        screen.getByRole("radio", { name: "One set of plates" }),
      );
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onSave).toHaveBeenCalledWith({
        ...exercise,
        type: ExerciseType.SinglePlate,
        minimumWeightIncrement: 2.5,
        warmUpSets: [],
      });
    });

    it("auto-sets Minimum weight increment back to 5 after switching away from One set of plates", async () => {
      const { user } = renderExerciseForm();
      await user.click(
        screen.getByRole("radio", { name: "One set of plates" }),
      );
      await user.click(
        screen.getByRole("radio", { name: "Two sets of plates" }),
      );
      await user.click(screen.getByRole("radio", { name: "Other" }));
      expect(
        screen.getByRole("textbox", { name: "Minimum weight increment" }),
      ).toHaveValue("5");
    });
  });

  describe("validation", () => {
    it("enables the Save button after filling all required fields", async () => {
      const { user } = renderExerciseForm();
      await user.type(screen.getByRole("textbox", { name: "Name" }), "Squat");
      await user.type(screen.getByRole("textbox", { name: "Weight" }), "135");
      await user.type(screen.getByRole("textbox", { name: "Sets" }), "3");
      await user.type(screen.getByRole("textbox", { name: "Reps" }), "5");
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });

    it("disables the Save button when Name is cleared", async () => {
      const { user } = renderExerciseForm({ defaultValues: makeExercise() });
      await user.clear(screen.getByRole("textbox", { name: "Name" }));
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });
  });

  describe("onSave", () => {
    it("creates a new exercise with a generated id when no defaultValues", async () => {
      const onSave = vi.fn();
      const { user } = renderExerciseForm({ onSave });
      await user.type(screen.getByRole("textbox", { name: "Name" }), "Squat");
      await user.type(screen.getByRole("textbox", { name: "Weight" }), "135");
      await user.type(screen.getByRole("textbox", { name: "Sets" }), "3");
      await user.type(screen.getByRole("textbox", { name: "Reps" }), "5");
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onSave).toHaveBeenCalledWith({
        id: testUuid,
        name: "Squat",
        weight: 135,
        sets: 3,
        reps: 5,
        type: ExerciseType.DoublePlate,
        minimumWeightIncrement: 5,
        warmUpSets: [],
        workingSets: {},
        nextSession: {},
      });
    });

    it("merges updates into defaultValues when editing", async () => {
      const exercise = makeExercise({ name: "Squat" });
      const onSave = vi.fn();
      const { user } = renderExerciseForm({ defaultValues: exercise, onSave });
      const nameInput = screen.getByRole("textbox", { name: "Name" });
      await user.clear(nameInput);
      await user.type(nameInput, "Bench Press");
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onSave).toHaveBeenCalledWith({
        ...exercise,
        name: "Bench Press",
        warmUpSets: [],
      });
    });
  });

  describe("warm-up set management", () => {
    it("opens the create modal when Add warm-up set is clicked", async () => {
      const { user } = renderExerciseForm();
      await user.click(screen.getByRole("button", { name: "Add warm-up set" }));
      expect(screen.getByText("Create warm-up set")).toBeInTheDocument();
    });

    it("adds a warm-up set to the list after saving in the modal", async () => {
      const { user } = renderExerciseForm();
      await user.click(screen.getByRole("button", { name: "Add warm-up set" }));
      const dialog = screen.getByRole("dialog");
      await user.type(
        within(dialog).getByRole("textbox", { name: "Reps" }),
        "5",
      );
      await user.type(
        within(dialog).getByRole("textbox", { name: "Percentage" }),
        "60",
      );
      await user.click(within(dialog).getByRole("button", { name: "Save" }));
      expect(
        screen.getByText(/5 reps with 60% of working weight/),
      ).toBeInTheDocument();
    });
  });
});
