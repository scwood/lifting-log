import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateWorkout } from "../api/workoutsApi";
import { makeDay, makeExercise, makeWorkout } from "../test-utils/factories";
import { testTheme } from "../test-utils/testTheme";
import { Direction } from "../utils/arrayUtils";
import { moveExercise } from "../utils/workoutUtils";
import { CurrentUserProvider } from "./CurrentUserProvider";
import { PlanDay, PlanDayProps } from "./PlanDay";

vi.mock("../api/workoutsApi");

const mockUpdateWorkout = vi.mocked(updateWorkout);

function renderPlanDay(propsOverrides: Partial<PlanDayProps> = {}) {
  const user = userEvent.setup();
  const exercise1 = makeExercise({ id: "ex1", name: "Squat" });
  const exercise2 = makeExercise({ id: "ex2", name: "Bench Press" });
  const day = makeDay({
    id: "day1",
    name: "Day 1",
    exercises: [exercise1, exercise2],
  });
  const day2 = makeDay({
    id: "day2",
    name: "Day 2",
    exercises: [makeExercise({ id: "ex3", name: "Deadlift" })],
  });
  const workout = makeWorkout({ id: "w1", days: [day, day2] });
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
    mockUpdateWorkout.mockReset();
    mockUpdateWorkout.mockResolvedValue(undefined);
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
    expect(createdExercise).toEqual(
      expect.objectContaining({
        name: "Row",
        weight: 95,
        sets: 3,
        reps: 8,
      }),
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
      expect.objectContaining({ id: "ex1", name: "Front Squat" }),
    );
    expect(updatedDay?.exercises[1]).toEqual(workout.days[0].exercises[1]);
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
    const expectedUpdates = moveExercise(workout, day.id, "ex2", Direction.Up);

    await user.click(screen.getByRole("button", { name: "Bench Press menu" }));
    await user.click(screen.getByText("Move up"));

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    expect(mockUpdateWorkout).toHaveBeenCalledWith(workout.id, expectedUpdates);
  });
});
