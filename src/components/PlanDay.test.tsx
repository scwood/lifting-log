import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { v4 as uuidV4 } from "uuid";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateWorkout } from "../api/workoutsApi";
import {
  makeDay,
  makeDayExercise,
  makeExerciseDefinition,
  makeWorkout,
} from "../test-utils/factories";
import { testTheme } from "../test-utils/testTheme";
import { Direction } from "../utils/arrayUtils";
import {
  reorderWorkoutDayExercise,
  upsertWorkoutExerciseDefinition,
} from "../utils/workoutMutationHelpers";
import { CurrentUserProvider } from "./CurrentUserProvider";
import { PlanDay, PlanDayProps } from "./PlanDay";

vi.mock("../api/workoutsApi");
vi.mock("uuid", () => ({ v4: vi.fn() }));

const mockUpdateWorkout = vi.mocked(updateWorkout);
const mockUuidV4 = vi.mocked(uuidV4);
const createdDefinitionId = "created-definition-id";
const createdDayExerciseId = "created-day-exercise-id";

function renderPlanDay(propsOverrides: Partial<PlanDayProps> = {}) {
  const user = userEvent.setup();
  const exerciseDefinition1 = makeExerciseDefinition({
    id: "def1",
    name: "Squat",
  });
  const exerciseDefinition2 = makeExerciseDefinition({
    id: "def2",
    name: "Bench Press",
  });
  const exerciseDefinition3 = makeExerciseDefinition({
    id: "def3",
    name: "Deadlift",
  });
  const exercise1 = makeDayExercise({
    id: "ex1",
    exerciseDefinitionId: exerciseDefinition1.id,
  });
  const exercise2 = makeDayExercise({
    id: "ex2",
    exerciseDefinitionId: exerciseDefinition2.id,
  });
  const day = makeDay({
    id: "day1",
    name: "Day 1",
    exercises: [exercise1, exercise2],
  });
  const day2 = makeDay({
    id: "day2",
    name: "Day 2",
    exercises: [
      makeDayExercise({
        id: "ex3",
        exerciseDefinitionId: exerciseDefinition3.id,
      }),
    ],
  });
  const workout = makeWorkout({
    id: "w1",
    days: [day, day2],
    exerciseDefinitionsById: {
      [exerciseDefinition1.id]: exerciseDefinition1,
      [exerciseDefinition2.id]: exerciseDefinition2,
      [exerciseDefinition3.id]: exerciseDefinition3,
    },
  });
  const props: PlanDayProps = {
    day,
    workout,
    moveUpDisabled: false,
    moveDownDisabled: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    ...propsOverrides,
  };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <CurrentUserProvider userId="u1">
        <MantineProvider theme={testTheme}>
          <PlanDay {...props} />
        </MantineProvider>
      </CurrentUserProvider>
    </QueryClientProvider>,
  );

  return { user, ...props };
}

describe("PlanDay", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUpdateWorkout.mockResolvedValue(undefined);
    mockUuidV4.mockReturnValue("test-uuid");
  });

  it("renders day title and exercise cards", () => {
    renderPlanDay();
    expect(
      screen.getByRole("heading", { name: "Day: Day 1" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Squat")).toBeInTheDocument();
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add exercise" }),
    ).toBeInTheDocument();
  });

  it("shows a no-exercises callout when the day has no exercises", () => {
    const day = makeDay({ id: "day1", name: "Day 1", exercises: [] });
    const workout = makeWorkout({ id: "w1", days: [day] });

    renderPlanDay({ day, workout });

    expect(
      screen.getByText(
        "Your plan has no exercises for this day. Click the button below to add an exercise.",
      ),
    ).toBeInTheDocument();
  });

  it("calls day-level callbacks from the day menu", async () => {
    const { user, day, onMoveUp, onMoveDown, onEdit, onDelete } =
      renderPlanDay();

    await user.click(screen.getByRole("button", { name: `${day.name} menu` }));
    await user.click(screen.getByText("Move up"));

    await user.click(screen.getByRole("button", { name: `${day.name} menu` }));
    await user.click(screen.getByText("Move down"));

    await user.click(screen.getByRole("button", { name: `${day.name} menu` }));
    await user.click(screen.getByText("Edit"));

    await user.click(screen.getByRole("button", { name: `${day.name} menu` }));
    await user.click(screen.getByText("Delete"));

    expect(onMoveUp).toHaveBeenCalledWith(day);
    expect(onMoveDown).toHaveBeenCalledWith(day);
    expect(onEdit).toHaveBeenCalledWith(day);
    expect(onDelete).toHaveBeenCalledWith(day);
  });

  it("disables Move up for the first exercise in the first day", async () => {
    const { user } = renderPlanDay();
    await user.click(screen.getByRole("button", { name: "Squat menu" }));
    expect(screen.getByText("Move up").closest("button")).toBeDisabled();
  });

  it("adds an exercise and calls updateWorkout with updated days", async () => {
    const { user, workout } = renderPlanDay();
    mockUuidV4
      .mockReturnValueOnce(createdDefinitionId)
      .mockReturnValueOnce(createdDayExerciseId);

    await user.click(screen.getByRole("button", { name: "Add exercise" }));
    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByRole("textbox", { name: "Name" }),
      "Row",
    );
    await user.type(
      within(dialog).getByRole("textbox", { name: "Weight" }),
      "95",
    );
    await user.type(within(dialog).getByRole("textbox", { name: "Sets" }), "3");
    await user.type(within(dialog).getByRole("textbox", { name: "Reps" }), "8");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    const [workoutId, updates] = mockUpdateWorkout.mock.calls[0];
    expect(workoutId).toBe(workout.id);
    expect(updates.days).toHaveLength(workout.days.length);
    const updatedDay = updates.days?.find((d) => d.id === "day1");
    expect(updatedDay?.exercises).toHaveLength(3);
    const createdExercise =
      updatedDay?.exercises[updatedDay.exercises.length - 1];
    expect(createdExercise).toEqual({
      id: createdDayExerciseId,
      exerciseDefinitionId: createdDefinitionId,
      workingSets: {},
      definitionTrainingLoadBeforeCompletion: null,
    });
    const createdExerciseDefinition =
      updates.exerciseDefinitionsById?.[createdDefinitionId];
    expect(createdExerciseDefinition).toEqual(
      expect.objectContaining({
        id: createdDefinitionId,
        name: "Row",
        trainingLoad: {
          sets: 3,
          reps: 8,
          weight: 95,
        },
      }),
    );
    expect(updates.exerciseDefinitionsById).toEqual(
      expect.objectContaining(
        upsertWorkoutExerciseDefinition(workout, createdExerciseDefinition!)
          .exerciseDefinitionsById,
      ),
    );
  });

  it("edits an exercise and calls updateWorkout with replaced exercise", async () => {
    const { user, workout } = renderPlanDay();

    await user.click(screen.getByRole("button", { name: "Squat menu" }));
    await user.click(screen.getByText("Edit"));

    const dialog = screen.getByRole("dialog");
    const nameInput = within(dialog).getByRole("textbox", { name: "Name" });
    await user.clear(nameInput);
    await user.type(nameInput, "Front Squat");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    const [workoutId, updates] = mockUpdateWorkout.mock.calls[0];
    expect(workoutId).toBe(workout.id);
    const updatedDay = updates.days?.find((d) => d.id === "day1");
    expect(updatedDay?.exercises[0]).toEqual(
      expect.objectContaining({ id: "ex1", exerciseDefinitionId: "def1" }),
    );
    expect(updatedDay?.exercises[1]).toEqual(workout.days[0].exercises[1]);
    expect(updates.exerciseDefinitionsById?.def1).toEqual({
      ...workout.exerciseDefinitionsById.def1,
      id: "def1",
      name: "Front Squat",
    });
  });

  it("deletes an exercise after confirmation and calls updateWorkout", async () => {
    const { user, workout } = renderPlanDay();

    await user.click(screen.getByRole("button", { name: "Squat menu" }));
    await user.click(screen.getByText("Delete"));
    const dialog = screen.getByRole("dialog", { name: "Delete exercise" });
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    const [workoutId, updates] = mockUpdateWorkout.mock.calls[0];
    expect(workoutId).toBe(workout.id);
    const updatedDay = updates.days?.find((d) => d.id === "day1");
    expect(updatedDay?.exercises).toEqual([workout.days[0].exercises[1]]);
  });

  it("moves an exercise and sends moveExercise result to updateWorkout", async () => {
    const { user, workout, day } = renderPlanDay();
    const expectedUpdates = reorderWorkoutDayExercise(
      workout,
      day.id,
      "ex2",
      Direction.Up,
    );

    await user.click(screen.getByRole("button", { name: "Bench Press menu" }));
    await user.click(screen.getByText("Move up"));

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    expect(mockUpdateWorkout).toHaveBeenCalledWith(workout.id, expectedUpdates);
  });
});
