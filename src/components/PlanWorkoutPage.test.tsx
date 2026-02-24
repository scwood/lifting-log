import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createWorkout,
  getCurrentWorkout,
  updateWorkout,
} from "../api/workoutsApi";
import { makeDay, makeWorkout } from "../test-utils/factories";
import { testTheme } from "../test-utils/testTheme";
import { deferred } from "../test-utils/utils";
import { Workout } from "../types/Workout";
import { Direction, moveItem } from "../utils/arrayUtils";
import { CurrentUserProvider } from "./CurrentUserProvider";
import { PlanWorkoutPage } from "./PlanWorkoutPage";

const testUuid = "test-day-id";

vi.mock("../api/workoutsApi");
vi.mock("uuid", () => ({ v4: () => testUuid }));

const mockGetCurrentWorkout = vi.mocked(getCurrentWorkout);
const mockCreateWorkout = vi.mocked(createWorkout);
const mockUpdateWorkout = vi.mocked(updateWorkout);

function renderPlanWorkoutPage() {
  const user = userEvent.setup();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <CurrentUserProvider userId="u1">
        <MantineProvider theme={testTheme}>
          <PlanWorkoutPage />
        </MantineProvider>
      </CurrentUserProvider>
    </QueryClientProvider>,
  );

  return { user };
}

describe("PlanWorkoutPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockCreateWorkout.mockResolvedValue(undefined);
    mockUpdateWorkout.mockResolvedValue(undefined);
  });

  it("does not render the workout title before the fetch completes", async () => {
    const currentWorkoutDeferred = deferred<Workout | null>();
    mockGetCurrentWorkout.mockReturnValue(currentWorkoutDeferred.promise);

    renderPlanWorkoutPage();

    expect(screen.getByLabelText("Loading workout")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Workout plan" }),
    ).not.toBeInTheDocument();

    currentWorkoutDeferred.resolve(makeWorkout({ days: [] }));

    expect(
      await screen.findByRole("heading", { name: "Workout plan" }),
    ).toBeInTheDocument();
  });

  it("renders an error message when the fetch fails", async () => {
    mockGetCurrentWorkout.mockRejectedValue(new Error("fetch failed"));

    renderPlanWorkoutPage();

    expect(
      await screen.findByText("Failed to load workout plan"),
    ).toBeInTheDocument();
  });

  it("creates a workout when none exists", async () => {
    mockGetCurrentWorkout.mockResolvedValue(null);

    const { user } = renderPlanWorkoutPage();

    await user.click(
      await screen.findByRole("button", { name: "Create workout plan" }),
    );

    await waitFor(() => expect(mockCreateWorkout).toHaveBeenCalledTimes(1));
    expect(mockCreateWorkout).toHaveBeenCalledWith({ userId: "u1" });
  });

  it("adds a day and sends the updated days to updateWorkout", async () => {
    const day1 = makeDay({ id: "day1", name: "Day 1" });
    const workout = makeWorkout({ id: "w1", days: [day1] });
    mockGetCurrentWorkout.mockResolvedValue(workout);

    const { user } = renderPlanWorkoutPage();

    await user.click(await screen.findByRole("button", { name: "Add day" }));

    const dialog = screen.getByRole("dialog", { name: "Create day" });
    await user.type(
      within(dialog).getByRole("textbox", { name: "Name" }),
      "Day 2",
    );
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    const [workoutId, updates] = mockUpdateWorkout.mock.calls[0];
    expect(workoutId).toBe(workout.id);
    expect(updates.days).toEqual([
      day1,
      makeDay({ id: testUuid, name: "Day 2" }),
    ]);
  });

  it("edits a day and sends the replaced day to updateWorkout", async () => {
    const day1 = makeDay({ id: "day1", name: "Day 1" });
    const day2 = makeDay({ id: "day2", name: "Day 2" });
    const workout = makeWorkout({ id: "w1", days: [day1, day2] });
    mockGetCurrentWorkout.mockResolvedValue(workout);

    const { user } = renderPlanWorkoutPage();

    await user.click(await screen.findByRole("button", { name: "Day 1 menu" }));
    await user.click(screen.getByText("Edit"));

    const dialog = screen.getByRole("dialog", { name: "Edit day" });
    const nameInput = within(dialog).getByRole("textbox", { name: "Name" });
    await user.clear(nameInput);
    await user.type(nameInput, "Day 1 Updated");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    const [workoutId, updates] = mockUpdateWorkout.mock.calls[0];
    expect(workoutId).toBe(workout.id);
    expect(updates.days).toEqual([
      makeDay({ id: "day1", name: "Day 1 Updated" }),
      day2,
    ]);
  });

  it("deletes a day after confirmation", async () => {
    const day1 = makeDay({ id: "day1", name: "Day 1" });
    const day2 = makeDay({ id: "day2", name: "Day 2" });
    const workout = makeWorkout({ id: "w1", days: [day1, day2] });
    mockGetCurrentWorkout.mockResolvedValue(workout);

    const { user } = renderPlanWorkoutPage();

    await user.click(await screen.findByRole("button", { name: "Day 1 menu" }));
    await user.click(screen.getByText("Delete"));
    await user.click(
      within(screen.getByRole("dialog", { name: "Delete day" })).getByRole(
        "button",
        { name: "Delete" },
      ),
    );

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    const [workoutId, updates] = mockUpdateWorkout.mock.calls[0];
    expect(workoutId).toBe(workout.id);
    expect(updates.days).toEqual([day2]);
  });

  it("moves a day and sends reordered days to updateWorkout", async () => {
    const day1 = makeDay({ id: "day1", name: "Day 1" });
    const day2 = makeDay({ id: "day2", name: "Day 2" });
    const day3 = makeDay({ id: "day3", name: "Day 3" });
    const workout = makeWorkout({ id: "w1", days: [day1, day2, day3] });
    mockGetCurrentWorkout.mockResolvedValue(workout);

    const { user } = renderPlanWorkoutPage();

    await user.click(await screen.findByRole("button", { name: "Day 2 menu" }));
    await user.click(screen.getByText("Move up"));

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    const [workoutId, updates] = mockUpdateWorkout.mock.calls[0];
    expect(workoutId).toBe(workout.id);
    expect(updates.days).toEqual(moveItem(workout.days, 1, Direction.Up));
  });
});
