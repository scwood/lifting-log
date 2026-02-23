import { MantineProvider, Table } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeExercise } from "../test-utils/factories";
import { ExerciseType } from "../types/ExerciseType";
import { WorkingSet } from "../types/WorkingSet";
import {
  WorkingSetTableRow,
  WorkingSetTableRowProps,
} from "./WorkingSetTableRow";

function renderRow(props: Partial<WorkingSetTableRowProps> = {}) {
  const user = userEvent.setup();
  const exercise = props.exercise ?? makeExercise({ weight: 135, reps: 5 });
  const workingSet: WorkingSet = props.workingSet ?? {
    reps: 5,
    isLogged: false,
  };
  const onChange = props.onChange ?? vi.fn();
  render(
    <MantineProvider>
      <Table>
        <Table.Tbody>
          <WorkingSetTableRow
            exercise={exercise}
            workingSet={workingSet}
            onChange={onChange}
          />
        </Table.Tbody>
      </Table>
    </MantineProvider>,
  );
  return { user, exercise, workingSet, onChange };
}

describe("WorkingSetTableRow", () => {
  it("renders the exercise weight", () => {
    renderRow();
    expect(screen.getByText("135")).toBeInTheDocument();
  });

  describe("plate column", () => {
    it("shows plate breakdown for DoublePlate exercises", () => {
      const exercise = makeExercise({
        weight: 135,
        type: ExerciseType.DoublePlate,
      });
      renderRow({ exercise });
      // (135 - 45) / 2 = 45 per side -> "45"
      expect(screen.getByText("45")).toBeInTheDocument();
    });

    it("shows plate breakdown for SinglePlate exercises", () => {
      const exercise = makeExercise({
        weight: 35,
        type: ExerciseType.SinglePlate,
      });
      renderRow({ exercise });
      // 35 -> 25 + 10 -> "25, 10"
      expect(screen.getByText("25, 10")).toBeInTheDocument();
    });

    it("does not show plate breakdown for Other exercises", () => {
      const exercise = makeExercise({
        weight: 100,
        type: ExerciseType.Other,
      });
      renderRow({ exercise });
      // If the plate column were rendered it would show "45, 45, 10"
      expect(screen.queryByText("45, 45, 10")).toBeNull();
    });
  });

  describe("reps input", () => {
    it("displays workingSet.reps as the current value", () => {
      renderRow({ workingSet: { reps: 8, isLogged: false } });
      expect(screen.getByDisplayValue("8")).toBeInTheDocument();
    });

    it("falls back to exercise.reps when workingSet.reps is null", () => {
      const exercise = makeExercise({ reps: 5 });
      renderRow({ exercise, workingSet: { reps: null, isLogged: false } });
      expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    });
  });

  describe("checkbox", () => {
    it("is checked when workingSet.isLogged is true", () => {
      renderRow({ workingSet: { reps: 5, isLogged: true } });
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("is unchecked when workingSet.isLogged is false", () => {
      renderRow({ workingSet: { reps: 5, isLogged: false } });
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("is enabled when reps are valid", () => {
      renderRow({ workingSet: { reps: 5, isLogged: false } });
      expect(screen.getByRole("checkbox")).not.toBeDisabled();
    });

    it("becomes disabled after the reps input is cleared", async () => {
      const { user } = renderRow({ workingSet: { reps: 5, isLogged: false } });
      await user.clear(screen.getByRole("textbox"));
      expect(screen.getByRole("checkbox")).toBeDisabled();
    });
  });

  describe("onChange", () => {
    it("calls onChange with updated reps when the reps input changes", async () => {
      const onChange = vi.fn();
      const { user } = renderRow({
        workingSet: { reps: 5, isLogged: false },
        onChange,
      });
      const repsInput = screen.getByRole("textbox");
      await user.clear(repsInput);
      await user.type(repsInput, "8");
      expect(onChange).toHaveBeenLastCalledWith({ reps: 8, isLogged: false });
    });

    it("calls onChange with reps: null and isLogged: false when reps are cleared", async () => {
      const onChange = vi.fn();
      const { user } = renderRow({
        workingSet: { reps: 5, isLogged: true },
        onChange,
      });
      await user.clear(screen.getByRole("textbox"));
      expect(onChange).toHaveBeenLastCalledWith({
        reps: null,
        isLogged: false,
      });
    });

    it("calls onChange with isLogged: true when the checkbox is checked", async () => {
      const onChange = vi.fn();
      const { user } = renderRow({
        workingSet: { reps: 5, isLogged: false },
        onChange,
      });
      await user.click(screen.getByRole("checkbox"));
      expect(onChange).toHaveBeenCalledWith({ reps: 5, isLogged: true });
    });

    it("calls onChange with isLogged: false when the checkbox is unchecked", async () => {
      const onChange = vi.fn();
      const { user } = renderRow({
        workingSet: { reps: 5, isLogged: true },
        onChange,
      });
      await user.click(screen.getByRole("checkbox"));
      expect(onChange).toHaveBeenCalledWith({ reps: 5, isLogged: false });
    });
  });
});
