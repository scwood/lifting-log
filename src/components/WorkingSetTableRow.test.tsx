import { MantineProvider, Table } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeExercise } from "../test-utils/factories";
import { ExerciseType } from "../types/ExerciseType";
import {
  WorkingSetTableRow,
  WorkingSetTableRowProps,
} from "./WorkingSetTableRow";

function renderRow(propsOverrides: Partial<WorkingSetTableRowProps> = {}) {
  const user = userEvent.setup();
  const props: WorkingSetTableRowProps = {
    exercise: makeExercise({ weight: 135, reps: 5 }),
    setNumber: 1,
    workingSet: { reps: 5, weight: 135, isLogged: false },
    onChange: vi.fn(),
    ...propsOverrides,
  };
  render(
    <MantineProvider>
      <Table>
        <Table.Tbody>
          <WorkingSetTableRow {...props} />
        </Table.Tbody>
      </Table>
    </MantineProvider>,
  );
  return { user, ...props };
}

describe("WorkingSetTableRow", () => {
  it("renders the weight input default", () => {
    renderRow();
    expect(
      screen.getByRole("textbox", { name: "Weight for set 1" }),
    ).toHaveValue("135");
  });

  describe("plate column", () => {
    it("shows plate breakdown for DoublePlate exercises", () => {
      const exercise = makeExercise({
        weight: 135,
        type: ExerciseType.DoublePlate,
      });
      renderRow({ exercise, workingSet: { reps: 5, weight: 135, isLogged: false } });
      // (135 - 45) / 2 = 45 per side -> "45"
      expect(screen.getByText("45")).toBeInTheDocument();
    });

    it("shows plate breakdown for SinglePlate exercises", () => {
      const exercise = makeExercise({
        weight: 35,
        type: ExerciseType.SinglePlate,
      });
      renderRow({ exercise, workingSet: { reps: 5, weight: 35, isLogged: false } });
      // 35 -> 25 + 10 -> "25, 10"
      expect(screen.getByText("25, 10")).toBeInTheDocument();
    });

    it("does not show plate breakdown for Other exercises", () => {
      const exercise = makeExercise({
        weight: 100,
        type: ExerciseType.Other,
      });
      renderRow({ exercise, workingSet: { reps: 5, weight: 100, isLogged: false } });
      // If the plate column were rendered it would show "45, 45, 10"
      expect(screen.queryByText("45, 45, 10")).toBeNull();
    });
  });

  describe("reps input", () => {
    it("displays workingSet.reps as the current value", () => {
      renderRow({ workingSet: { reps: 8, weight: 135, isLogged: false } });
      expect(screen.getByRole("textbox", { name: "Reps for set 1" })).toHaveValue(
        "8",
      );
    });

    it("falls back to exercise.reps when workingSet.reps is null", () => {
      const exercise = makeExercise({ reps: 5 });
      renderRow({
        exercise,
        workingSet: { reps: null, weight: 135, isLogged: false },
      });
      expect(screen.getByRole("textbox", { name: "Reps for set 1" })).toHaveValue(
        "5",
      );
    });

    it("has an accessible name with the set number", () => {
      renderRow({ setNumber: 2 });
      expect(
        screen.getByRole("textbox", { name: "Reps for set 2" }),
      ).toBeInTheDocument();
    });

    it("selects the full reps value when focused", async () => {
      const { user } = renderRow({ workingSet: { reps: 12, weight: 135, isLogged: false } });
      const repsInput = screen.getByRole("textbox", { name: "Reps for set 1" });

      await user.click(repsInput);

      expect(repsInput).toHaveFocus();
      expect(repsInput).toHaveProperty("selectionStart", 0);
      expect(repsInput).toHaveProperty("selectionEnd", 2);
    });
  });

  describe("checkbox", () => {
    it("is checked when workingSet.isLogged is true", () => {
      renderRow({ workingSet: { reps: 5, weight: 135, isLogged: true } });
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("is unchecked when workingSet.isLogged is false", () => {
      renderRow({ workingSet: { reps: 5, weight: 135, isLogged: false } });
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("is enabled when reps and weight are valid", () => {
      renderRow({ workingSet: { reps: 5, weight: 135, isLogged: false } });
      expect(screen.getByRole("checkbox")).not.toBeDisabled();
    });

    it("becomes disabled after the reps input is cleared", async () => {
      const { user } = renderRow({
        workingSet: { reps: 5, weight: 135, isLogged: false },
      });
      await user.clear(screen.getByRole("textbox", { name: "Reps for set 1" }));
      expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it("becomes disabled after the weight input is cleared", async () => {
      const { user } = renderRow({
        workingSet: { reps: 5, weight: 135, isLogged: false },
      });
      await user.clear(screen.getByRole("textbox", { name: "Weight for set 1" }));
      expect(screen.getByRole("checkbox")).toBeDisabled();
    });
  });

  describe("onChange", () => {
    it("calls onChange with updated reps when the reps input changes", async () => {
      const { user, onChange } = renderRow({
        workingSet: { reps: 5, weight: 135, isLogged: false },
      });
      const repsInput = screen.getByRole("textbox", { name: "Reps for set 1" });
      await user.clear(repsInput);
      await user.type(repsInput, "8");
      expect(onChange).toHaveBeenLastCalledWith({
        reps: 8,
        weight: 135,
        isLogged: false,
      });
    });

    it("calls onChange with reps: null and isLogged: false when reps are cleared", async () => {
      const { user, onChange } = renderRow({
        workingSet: { reps: 5, weight: 135, isLogged: true },
      });
      await user.clear(screen.getByRole("textbox", { name: "Reps for set 1" }));
      expect(onChange).toHaveBeenLastCalledWith({
        reps: null,
        weight: 135,
        isLogged: false,
      });
    });

    it("calls onChange with weight updates when the weight input changes", async () => {
      const { user, onChange } = renderRow({
        workingSet: { reps: 5, weight: 135, isLogged: false },
      });
      const weightInput = screen.getByRole("textbox", { name: "Weight for set 1" });
      await user.clear(weightInput);
      await user.type(weightInput, "140");
      expect(onChange).toHaveBeenLastCalledWith({
        reps: 5,
        weight: 140,
        isLogged: false,
      });
    });

    it("calls onChange with weight: null and isLogged: false when weight is cleared", async () => {
      const { user, onChange } = renderRow({
        workingSet: { reps: 5, weight: 135, isLogged: true },
      });
      await user.clear(screen.getByRole("textbox", { name: "Weight for set 1" }));
      expect(onChange).toHaveBeenLastCalledWith({
        reps: 5,
        weight: null,
        isLogged: false,
      });
    });

    it("calls onChange with isLogged: true when the checkbox is checked", async () => {
      const { user, onChange } = renderRow({
        workingSet: { reps: 5, weight: 135, isLogged: false },
      });
      await user.click(screen.getByRole("checkbox"));
      expect(onChange).toHaveBeenCalledWith({
        reps: 5,
        weight: 135,
        isLogged: true,
      });
    });

    it("calls onChange with isLogged: false when the checkbox is unchecked", async () => {
      const { user, onChange } = renderRow({
        workingSet: { reps: 5, weight: 135, isLogged: true },
      });
      await user.click(screen.getByRole("checkbox"));
      expect(onChange).toHaveBeenCalledWith({
        reps: 5,
        weight: 135,
        isLogged: false,
      });
    });
  });
});
