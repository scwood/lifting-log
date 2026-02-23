import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeExercise, makeWarmUpSet } from "../test-utils/factories";
import { testTheme } from "../test-utils/testTheme";
import { PlanExerciseCard, PlanExerciseCardProps } from "./PlanExerciseCard";

function renderPlanExerciseCard(
  propsOverrides: Partial<PlanExerciseCardProps> = {},
) {
  const user = userEvent.setup();
  const props: PlanExerciseCardProps = {
    exercise: makeExercise(),
    moveUpDisabled: false,
    moveDownDisabled: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    ...propsOverrides,
  };
  render(
    <MantineProvider theme={testTheme}>
      <PlanExerciseCard {...props} />
    </MantineProvider>,
  );
  return { user, ...props };
}

describe("PlanExerciseCard", () => {
  it("renders the exercise name", () => {
    renderPlanExerciseCard({ exercise: makeExercise({ name: "Deadlift" }) });
    expect(screen.getByText("Deadlift")).toBeInTheDocument();
  });

  it("renders the volume load and warm-up set count", () => {
    const exercise = makeExercise({
      sets: 3,
      reps: 5,
      weight: 225,
      warmUpSets: [makeWarmUpSet()],
    });
    renderPlanExerciseCard({ exercise });
    expect(
      screen.getByText("3x5x225 with 1 warm-up sets."),
    ).toBeInTheDocument();
  });

  it("renders 0 warm-up sets when there are none", () => {
    const exercise = makeExercise({ warmUpSets: [] });
    renderPlanExerciseCard({ exercise });
    expect(screen.getByText(/with 0 warm-up sets/)).toBeInTheDocument();
  });

  describe("menu", () => {
    it("calls onEdit with the exercise when Edit is clicked", async () => {
      const exercise = makeExercise({ name: "Bench Press" });
      const { user, onEdit } = renderPlanExerciseCard({ exercise });
      await user.click(screen.getByRole("button", { name: "Exercise menu" }));
      await user.click(screen.getByText("Edit"));
      expect(onEdit).toHaveBeenCalledWith(exercise);
    });

    it("calls onDelete with the exercise when Delete is clicked", async () => {
      const exercise = makeExercise({ name: "Squat" });
      const { user, onDelete } = renderPlanExerciseCard({ exercise });
      await user.click(screen.getByRole("button", { name: "Exercise menu" }));
      await user.click(screen.getByText("Delete"));
      expect(onDelete).toHaveBeenCalledWith(exercise);
    });

    it("calls onMoveUp with the exercise when Move up is clicked", async () => {
      const exercise = makeExercise();
      const { user, onMoveUp } = renderPlanExerciseCard({
        exercise,
        moveUpDisabled: false,
      });
      await user.click(screen.getByRole("button", { name: "Exercise menu" }));
      await user.click(screen.getByText("Move up"));
      expect(onMoveUp).toHaveBeenCalledWith(exercise);
    });

    it("calls onMoveDown with the exercise when Move down is clicked", async () => {
      const exercise = makeExercise();
      const { user, onMoveDown } = renderPlanExerciseCard({
        exercise,
        moveDownDisabled: false,
      });
      await user.click(screen.getByRole("button", { name: "Exercise menu" }));
      await user.click(screen.getByText("Move down"));
      expect(onMoveDown).toHaveBeenCalledWith(exercise);
    });

    it("disables Move up when moveUpDisabled is true", async () => {
      const { user } = renderPlanExerciseCard({ moveUpDisabled: true });
      await user.click(screen.getByRole("button", { name: "Exercise menu" }));
      expect(screen.getByText("Move up").closest("button")).toBeDisabled();
    });

    it("disables Move down when moveDownDisabled is true", async () => {
      const { user } = renderPlanExerciseCard({ moveDownDisabled: true });
      await user.click(screen.getByRole("button", { name: "Exercise menu" }));
      expect(screen.getByText("Move down").closest("button")).toBeDisabled();
    });

    it("does not disable Move up when moveUpDisabled is false", async () => {
      const { user } = renderPlanExerciseCard({ moveUpDisabled: false });
      await user.click(screen.getByRole("button", { name: "Exercise menu" }));
      expect(screen.getByText("Move up").closest("button")).not.toBeDisabled();
    });

    it("does not disable Move down when moveDownDisabled is false", async () => {
      const { user } = renderPlanExerciseCard({ moveDownDisabled: false });
      await user.click(screen.getByRole("button", { name: "Exercise menu" }));
      expect(
        screen.getByText("Move down").closest("button"),
      ).not.toBeDisabled();
    });
  });
});
