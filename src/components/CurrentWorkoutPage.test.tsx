import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createWorkout,
  getCurrentWorkout,
  updateWorkout,
} from "../api/workoutsApi";
import { makeDay, makeExercise, makeWorkout } from "../test-utils/factories";
import { testTheme } from "../test-utils/testTheme";
import { deferred } from "../test-utils/utils";
import { Workout } from "../types/Workout";
import { CurrentUserProvider } from "./CurrentUserProvider";
import { CurrentWorkoutPage } from "./CurrentWorkoutPage";

vi.mock("../api/workoutsApi");

const mockCreateWorkout = vi.mocked(createWorkout);
const mockGetCurrentWorkout = vi.mocked(getCurrentWorkout);
const mockUpdateWorkout = vi.mocked(updateWorkout);

function renderCurrentWorkoutPage() {
  const user = userEvent.setup();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      { path: "/", element: <CurrentWorkoutPage /> },
      { path: "/plan", element: <div>Plan page</div> },
    ],
    { initialEntries: ["/"] },
  );

  render(
    <QueryClientProvider client={queryClient}>
      <CurrentUserProvider userId="u1">
        <MantineProvider theme={testTheme}>
          <RouterProvider router={router} />
        </MantineProvider>
      </CurrentUserProvider>
    </QueryClientProvider>,
  );

  return { user, router };
}

describe("CurrentWorkoutPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCreateWorkout.mockResolvedValue(undefined);
    mockUpdateWorkout.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render the page title before the fetch completes", async () => {
    const workoutDeferred = deferred<Workout | null>();
    mockGetCurrentWorkout.mockReturnValue(workoutDeferred.promise);

    renderCurrentWorkoutPage();

    expect(
      screen.getByLabelText("Loading current workout..."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Current workout" }),
    ).not.toBeInTheDocument();

    workoutDeferred.resolve(
      makeWorkout({
        days: [
          makeDay({ exercises: [makeExercise({ sets: 1, workingSets: {} })] }),
        ],
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "Current workout" }),
    ).toBeInTheDocument();
  });

  it("renders an error message when loading the workout fails", async () => {
    mockGetCurrentWorkout.mockRejectedValue(new Error("fetch failed"));

    renderCurrentWorkoutPage();

    expect(
      await screen.findByText("Failed to load workout"),
    ).toBeInTheDocument();
  });

  it("shows a create button when there is no workout yet", async () => {
    mockGetCurrentWorkout.mockResolvedValue(null);

    renderCurrentWorkoutPage();

    expect(
      await screen.findByRole("button", { name: "Create workout plan" }),
    ).toBeInTheDocument();
  });

  it("creates a workout and navigates to /plan from home", async () => {
    mockGetCurrentWorkout.mockResolvedValue(null);

    const { user, router } = renderCurrentWorkoutPage();

    await user.click(
      await screen.findByRole("button", { name: "Create workout plan" }),
    );

    await waitFor(() => expect(mockCreateWorkout).toHaveBeenCalledTimes(1));
    expect(mockCreateWorkout).toHaveBeenCalledWith({ userId: "u1" });
    await waitFor(() => expect(router.state.location.pathname).toBe("/plan"));
  });

  it("shows a link to /plan when workout has no days", async () => {
    mockGetCurrentWorkout.mockResolvedValue(makeWorkout({ days: [] }));

    renderCurrentWorkoutPage();

    expect(
      await screen.findByText(/Your workout plan is incomplete./),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to your plan to finish setup." }),
    ).toBeInTheDocument();
  });

  it("shows a link to /plan when workout has days but no exercises", async () => {
    mockGetCurrentWorkout.mockResolvedValue(
      makeWorkout({
        days: [makeDay({ id: "day1", exercises: [] }), makeDay({ id: "day2" })],
      }),
    );

    renderCurrentWorkoutPage();

    expect(
      await screen.findByText(/Your workout plan is incomplete./),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to your plan to finish setup." }),
    ).toBeInTheDocument();
  });

  it("saves trimmed notes when notes input loses focus", async () => {
    mockGetCurrentWorkout.mockResolvedValue(
      makeWorkout({
        id: "w1",
        notes: "existing",
        days: [
          makeDay({ exercises: [makeExercise({ sets: 1, workingSets: {} })] }),
        ],
      }),
    );

    const { user } = renderCurrentWorkoutPage();

    const notesInput = await screen.findByRole("textbox", { name: "Notes" });
    await user.clear(notesInput);
    await user.type(notesInput, "  Felt strong today  ");
    await user.tab();

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    const [workoutId, updates] = mockUpdateWorkout.mock.calls[0];
    expect(workoutId).toBe("w1");
    expect(updates).toEqual({ notes: "Felt strong today" });
  });

  it("saves null notes when notes are only whitespace", async () => {
    mockGetCurrentWorkout.mockResolvedValue(
      makeWorkout({
        id: "w1",
        notes: "existing",
        days: [
          makeDay({ exercises: [makeExercise({ sets: 1, workingSets: {} })] }),
        ],
      }),
    );

    const { user } = renderCurrentWorkoutPage();

    const notesInput = await screen.findByRole("textbox", { name: "Notes" });
    await user.clear(notesInput);
    await user.type(notesInput, "   ");
    await user.tab();

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    const [workoutId, updates] = mockUpdateWorkout.mock.calls[0];
    expect(workoutId).toBe("w1");
    expect(updates).toEqual({ notes: null });
  });

  it("undoes a completed exercise and unlogs the final working set", async () => {
    const completedExercise = makeExercise({
      id: "ex-complete",
      name: "Bench Press",
      sets: 2,
      workingSets: {
        0: { isLogged: true, reps: 5, weight: 135 },
        1: { isLogged: true, reps: 5, weight: 135 },
      },
    });
    const incompleteExercise = makeExercise({
      id: "ex-incomplete",
      name: "Squat",
      sets: 2,
      workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
    });
    const workout = makeWorkout({
      id: "w1",
      days: [
        makeDay({
          id: "day1",
          exercises: [completedExercise, incompleteExercise],
        }),
      ],
    });
    mockGetCurrentWorkout.mockResolvedValue(workout);

    const { user } = renderCurrentWorkoutPage();

    await user.click(await screen.findByRole("button", { name: "Undo" }));

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    const [workoutId, updates] = mockUpdateWorkout.mock.calls[0];
    expect(workoutId).toBe("w1");
    expect(updates.completedTimestamp).toBeNull();
    expect(updates.days?.[0].exercises[0].workingSets).toEqual({
      0: { isLogged: true, reps: 5, weight: 135 },
      1: { isLogged: false, reps: 5, weight: 135 },
    });
  });

  it("completes the workout and creates the next workout from nextSession values", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1234567890);
    const completedExercise = makeExercise({
      id: "ex1",
      sets: 3,
      reps: 5,
      weight: 135,
      workingSets: {
        0: { isLogged: true, reps: 5, weight: 135 },
        1: { isLogged: true, reps: 5, weight: 135 },
        2: { isLogged: true, reps: 5, weight: 135 },
      },
      nextSession: { reps: 6, weight: 140 },
    });
    const workout = makeWorkout({
      id: "w1",
      days: [makeDay({ id: "day1", exercises: [completedExercise] })],
    });
    mockGetCurrentWorkout.mockResolvedValue(workout);

    const { user } = renderCurrentWorkoutPage();

    await user.click(
      await screen.findByRole("button", { name: "Create next workout" }),
    );

    await waitFor(() => expect(mockUpdateWorkout).toHaveBeenCalledTimes(1));
    expect(mockUpdateWorkout).toHaveBeenCalledWith("w1", {
      completedTimestamp: 1234567890,
    });
    expect(mockCreateWorkout).toHaveBeenCalledWith({
      userId: "u1",
      days: [
        makeDay({
          id: "day1",
          exercises: [
            makeExercise({
              id: "ex1",
              reps: 6,
              weight: 140,
              workingSets: {},
              nextSession: {},
            }),
          ],
        }),
      ],
    });
  });
});
