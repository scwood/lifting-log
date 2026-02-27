import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateWorkout } from "../api/workoutsApi";
import {
  makeDay,
  makeDayExercise,
  makeExerciseDefinition,
  makeWorkout,
} from "../test-utils/factories";
import { testTheme } from "../test-utils/testTheme";
import { CurrentUserProvider } from "./CurrentUserProvider";
import { CurrentWorkoutDay, CurrentWorkoutDayProps } from "./CurrentWorkoutDay";

vi.mock("../api/workoutsApi");

const mockUpdateWorkout = vi.mocked(updateWorkout);

function renderCurrentWorkoutDay(
  propsOverrides: Partial<CurrentWorkoutDayProps> = {},
) {
  const user = userEvent.setup();
  const incompleteExerciseDefinition = makeExerciseDefinition({
    id: "def1",
    name: "Squat",
    trainingLoad: { sets: 1, reps: 5, weight: 135 },
  });
  const completeExerciseDefinition = makeExerciseDefinition({
    id: "def2",
    name: "Bench Press",
    trainingLoad: { sets: 1, reps: 8, weight: 135 },
  });
  const incompleteExercise = makeDayExercise({
    id: "ex1",
    exerciseDefinitionId: incompleteExerciseDefinition.id,
    workingSets: {},
  });
  const completeExercise = makeDayExercise({
    id: "ex2",
    exerciseDefinitionId: completeExerciseDefinition.id,
    workingSets: { 0: { isLogged: true, reps: 8, weight: 135 } },
  });
  const day = makeDay({
    id: "day1",
    name: "Day 1",
    exercises: [incompleteExercise, completeExercise],
  });
  const workout = makeWorkout({
    id: "w1",
    days: [day, makeDay({ id: "day2", name: "Day 2" })],
    exerciseDefinitionsById: {
      [incompleteExerciseDefinition.id]: incompleteExerciseDefinition,
      [completeExerciseDefinition.id]: completeExerciseDefinition,
    },
  });
  const props: CurrentWorkoutDayProps = {
    workout,
    day,
    ...propsOverrides,
  };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <CurrentUserProvider userId="u1">
        <MantineProvider theme={testTheme}>
          <CurrentWorkoutDay {...props} />
        </MantineProvider>
      </CurrentUserProvider>
    </QueryClientProvider>,
  );

  return { user, ...props };
}

describe("CurrentWorkoutDay", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUpdateWorkout.mockResolvedValue(undefined);
  });

  it("renders the day title and only incomplete exercises", () => {
    renderCurrentWorkoutDay();

    expect(
      screen.getByRole("heading", { name: "Day: Day 1" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Squat:" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Bench Press:" }),
    ).not.toBeInTheDocument();
  });

  it("updates the exercise immediately when it is still incomplete", async () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      name: "Squat",
      trainingLoad: { sets: 3, reps: 5, weight: 135 },
    });
    const exercise = makeDayExercise({
      id: "ex1",
      exerciseDefinitionId: exerciseDefinition.id,
      workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
    });
    const day = makeDay({ id: "day1", exercises: [exercise] });
    const workout = makeWorkout({
      id: "w1",
      days: [day],
      exerciseDefinitionsById: {
        [exerciseDefinition.id]: exerciseDefinition,
      },
    });

    const { user } = renderCurrentWorkoutDay({ workout, day });
    const uncheckedSetCheckbox = screen
      .getAllByRole("checkbox")
      .find((checkbox) => !(checkbox as HTMLInputElement).checked);
    expect(uncheckedSetCheckbox).toBeDefined();

    await user.click(uncheckedSetCheckbox!);

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    const [workoutId, updates] = mockUpdateWorkout.mock.calls[0];
    expect(workoutId).toBe(workout.id);
    const updatedDay = updates.days?.find((d) => d.id === day.id);
    expect(updatedDay?.exercises[0].workingSets).toEqual({
      0: { isLogged: true, reps: 5, weight: 135 },
      1: { isLogged: true, reps: 5, weight: 135 },
    });
    expect(
      screen.queryByRole("dialog", { name: "Exercise complete" }),
    ).not.toBeInTheDocument();
  });

  it("opens completion modal on final set and saves next session plan", async () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      name: "Squat",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
      minimumWeightIncrement: 5,
    });
    const exercise = makeDayExercise({
      id: "ex1",
      exerciseDefinitionId: exerciseDefinition.id,
      workingSets: {},
    });
    const day = makeDay({ id: "day1", exercises: [exercise] });
    const workout = makeWorkout({
      id: "w1",
      days: [day],
      exerciseDefinitionsById: {
        [exerciseDefinition.id]: exerciseDefinition,
      },
    });

    const { user } = renderCurrentWorkoutDay({ workout, day });

    await user.click(screen.getByRole("checkbox"));
    expect(mockUpdateWorkout).not.toHaveBeenCalled();
    expect(
      await screen.findByRole("dialog", { name: "Exercise complete" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Add a rep" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    const [workoutId, updates] = mockUpdateWorkout.mock.calls[0];
    expect(workoutId).toBe(workout.id);
    const updatedExercise = updates.days?.[0].exercises[0];
    expect(updatedExercise?.workingSets).toEqual({
      0: { isLogged: true, reps: 5, weight: 135 },
    });
    expect(updatedExercise?.definitionTrainingLoadBeforeCompletion).toEqual({
      sets: 1,
      reps: 5,
      weight: 135,
    });
    expect(updates.exerciseDefinitionsById?.def1?.trainingLoad).toEqual({
      sets: 1,
      reps: 6,
      weight: 135,
    });
  });

  it("skips an exercise and logs all sets with zero reps", async () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      name: "Squat",
      trainingLoad: { sets: 2, reps: 5, weight: 135 },
    });
    const exercise = makeDayExercise({
      id: "ex1",
      exerciseDefinitionId: exerciseDefinition.id,
      workingSets: {},
    });
    const day = makeDay({ id: "day1", exercises: [exercise] });
    const workout = makeWorkout({
      id: "w1",
      days: [day],
      exerciseDefinitionsById: {
        [exerciseDefinition.id]: exerciseDefinition,
      },
    });

    const { user } = renderCurrentWorkoutDay({ workout, day });

    await user.click(screen.getByRole("button", { name: "Squat menu" }));
    await user.click(await screen.findByText("Skip exercise"));

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    const [workoutId, updates] = mockUpdateWorkout.mock.calls[0];
    expect(workoutId).toBe(workout.id);
    const updatedExercise = updates.days?.[0].exercises[0];
    expect(updatedExercise?.workingSets).toEqual({
      0: { isLogged: true, reps: 0, weight: 135 },
      1: { isLogged: true, reps: 0, weight: 135 },
    });
    expect(updatedExercise?.definitionTrainingLoadBeforeCompletion).toEqual({
      sets: 2,
      reps: 5,
      weight: 135,
    });
  });
});
