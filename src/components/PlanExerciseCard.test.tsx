import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  makeDayExercise,
  makeExerciseDefinition,
  makeWarmUpSet,
  makeWorkout,
} from "../test-utils/factories";
import { PlanExerciseCard, PlanExerciseCardProps } from "./PlanExerciseCard";

function renderPlanExerciseCard(
  propsOverrides: Partial<PlanExerciseCardProps> = {},
) {
  const user = userEvent.setup();
  const exercise = makeDayExercise({ id: "ex1", exerciseDefinitionId: "def1" });
  const exerciseDefinition = makeExerciseDefinition({
    id: exercise.exerciseDefinitionId,
    name: "Squat",
  });
  const workout = makeWorkout({
    exerciseDefinitionsById: {
      [exerciseDefinition.id]: exerciseDefinition,
    },
  });
  const props: PlanExerciseCardProps = {
    workout,
    exercise,
    moveUpDisabled: false,
    moveDownDisabled: false,
    onEdit: vi.fn(),
    onRemoveFromDay: vi.fn(),
    onDelete: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    ...propsOverrides,
  };
  render(
    <MantineProvider env="test">
      <PlanExerciseCard {...props} />
    </MantineProvider>,
  );
  return { user, exerciseDefinition, ...props };
}

describe("PlanExerciseCard", () => {
  it("renders the exercise name", () => {
    const name = "Deadlift";
    const exercise = makeDayExercise({
      id: "ex1",
      exerciseDefinitionId: "def1",
    });
    const exerciseDefinition = makeExerciseDefinition({
      id: exercise.exerciseDefinitionId,
      name,
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: {
        [exerciseDefinition.id]: exerciseDefinition,
      },
    });
    renderPlanExerciseCard({ exercise, workout });
    expect(screen.getByText(name)).toBeInTheDocument();
  });

  it("renders the volume load and warm-up set count", () => {
    const exercise = makeDayExercise({
      id: "ex1",
      exerciseDefinitionId: "def1",
    });
    const exerciseDefinition = makeExerciseDefinition({
      id: exercise.exerciseDefinitionId,
      trainingLoad: {
        sets: 3,
        reps: 5,
        weight: 225,
      },
      warmUpSets: [makeWarmUpSet()],
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: {
        [exerciseDefinition.id]: exerciseDefinition,
      },
    });
    renderPlanExerciseCard({ exercise, workout });
    expect(
      screen.getByText("3x5x225 with 1 warm-up sets."),
    ).toBeInTheDocument();
  });

  it("renders 0 warm-up sets when there are none", () => {
    const exercise = makeDayExercise({
      id: "ex1",
      exerciseDefinitionId: "def1",
    });
    const exerciseDefinition = makeExerciseDefinition({
      id: exercise.exerciseDefinitionId,
      warmUpSets: [],
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: {
        [exerciseDefinition.id]: exerciseDefinition,
      },
    });
    renderPlanExerciseCard({ exercise, workout });
    expect(screen.getByText(/with 0 warm-up sets/)).toBeInTheDocument();
  });

  describe("menu", () => {
    it("calls onEdit with the exercise when Edit is clicked", async () => {
      const { user, exercise, exerciseDefinition, onEdit } =
        renderPlanExerciseCard();
      await user.click(
        screen.getByRole("button", { name: `${exerciseDefinition.name} menu` }),
      );
      await user.click(screen.getByText("Edit"));
      expect(onEdit).toHaveBeenCalledWith(exercise);
    });

    it("calls onRemoveFromDay with the exercise when Remove from day is clicked", async () => {
      const { user, exercise, exerciseDefinition, onRemoveFromDay } =
        renderPlanExerciseCard();
      await user.click(
        screen.getByRole("button", { name: `${exerciseDefinition.name} menu` }),
      );
      await user.click(screen.getByText("Remove from day"));
      expect(onRemoveFromDay).toHaveBeenCalledWith(exercise);
    });

    it("calls onDelete with the exercise when Delete is clicked", async () => {
      const { user, exercise, exerciseDefinition, onDelete } =
        renderPlanExerciseCard();
      await user.click(
        screen.getByRole("button", { name: `${exerciseDefinition.name} menu` }),
      );
      await user.click(screen.getByText("Delete"));
      expect(onDelete).toHaveBeenCalledWith(exercise);
    });

    it("calls onMoveUp with the exercise when Move up is clicked", async () => {
      const { user, exercise, exerciseDefinition, onMoveUp } =
        renderPlanExerciseCard({
          moveUpDisabled: false,
        });
      await user.click(
        screen.getByRole("button", { name: `${exerciseDefinition.name} menu` }),
      );
      await user.click(screen.getByText("Move up"));
      expect(onMoveUp).toHaveBeenCalledWith(exercise);
    });

    it("calls onMoveDown with the exercise when Move down is clicked", async () => {
      const { user, exercise, exerciseDefinition, onMoveDown } =
        renderPlanExerciseCard({
          moveDownDisabled: false,
        });

      await user.click(
        screen.getByRole("button", { name: `${exerciseDefinition.name} menu` }),
      );
      await user.click(screen.getByText("Move down"));
      expect(onMoveDown).toHaveBeenCalledWith(exercise);
    });

    it("disables Move up when moveUpDisabled is true", async () => {
      const { user, exerciseDefinition } = renderPlanExerciseCard({
        moveUpDisabled: true,
      });
      await user.click(
        screen.getByRole("button", { name: `${exerciseDefinition.name} menu` }),
      );
      expect(screen.getByText("Move up").closest("button")).toBeDisabled();
    });

    it("disables Move down when moveDownDisabled is true", async () => {
      const { user, exerciseDefinition } = renderPlanExerciseCard({
        moveDownDisabled: true,
      });
      await user.click(
        screen.getByRole("button", { name: `${exerciseDefinition.name} menu` }),
      );
      expect(screen.getByText("Move down").closest("button")).toBeDisabled();
    });

    it("does not disable Move up when moveUpDisabled is false", async () => {
      const { user, exerciseDefinition } = renderPlanExerciseCard({
        moveUpDisabled: false,
      });
      await user.click(
        screen.getByRole("button", { name: `${exerciseDefinition.name} menu` }),
      );
      expect(screen.getByText("Move up").closest("button")).not.toBeDisabled();
    });

    it("does not disable Move down when moveDownDisabled is false", async () => {
      const { user, exerciseDefinition } = renderPlanExerciseCard({
        moveDownDisabled: false,
      });
      await user.click(
        screen.getByRole("button", { name: `${exerciseDefinition.name} menu` }),
      );
      expect(
        screen.getByText("Move down").closest("button"),
      ).not.toBeDisabled();
    });
  });
});
