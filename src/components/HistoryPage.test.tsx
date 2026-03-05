import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getWorkouts } from "../api/workoutsApi";
import { makeWorkout } from "../test-utils/factories";
import { deferred } from "../test-utils/utils";
import { Workout } from "../types/Workout";
import { CurrentUserProvider } from "./CurrentUserProvider";
import { HistoryPage } from "./HistoryPage";

vi.mock("../api/workoutsApi");

const mockGetWorkouts = vi.mocked(getWorkouts);

function renderHistoryPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <CurrentUserProvider userId="test-user-123">
        <MantineProvider>
          <HistoryPage />
        </MantineProvider>
      </CurrentUserProvider>
    </QueryClientProvider>,
  );
}

describe("HistoryPage", () => {
  describe("when loading", () => {
    it("does not render the History title before the fetch completes", async () => {
      const workoutsDeferred = deferred<Workout[]>();
      mockGetWorkouts.mockReturnValue(workoutsDeferred.promise);
      renderHistoryPage();

      expect(screen.getByLabelText("Loading history...")).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "History" }),
      ).not.toBeInTheDocument();
      workoutsDeferred.resolve([]);
      expect(
        await screen.findByRole("heading", { name: "History" }),
      ).toBeInTheDocument();
    });
  });

  describe("when an error occurs", () => {
    it("renders an error message", async () => {
      mockGetWorkouts.mockRejectedValue(new Error("fetch failed"));
      renderHistoryPage();
      expect(
        await screen.findByText("Failed to load workout history"),
      ).toBeInTheDocument();
    });
  });

  describe("when workouts load successfully", () => {
    it("renders the History title", async () => {
      mockGetWorkouts.mockResolvedValue([]);
      renderHistoryPage();
      expect(
        await screen.findByRole("heading", { name: "History" }),
      ).toBeInTheDocument();
    });

    it("renders 'No completed workouts yet' when there are no completed workouts", async () => {
      mockGetWorkouts.mockResolvedValue([]);
      renderHistoryPage();
      expect(
        await screen.findByText("No completed workouts yet"),
      ).toBeInTheDocument();
    });

    it("does not render 'No completed workouts yet' when there are completed workouts", async () => {
      const workout = makeWorkout({ completedTimestamp: 1700000000000 });
      mockGetWorkouts.mockResolvedValue([workout]);
      renderHistoryPage();
      await screen.findByText(/Completed on/, { selector: "p" });
      expect(
        screen.queryByText("No completed workouts yet"),
      ).not.toBeInTheDocument();
    });

    it("renders a card for each completed workout", async () => {
      const workout1 = makeWorkout({
        id: "w1",
        completedTimestamp: 1700000000000,
      });
      const workout2 = makeWorkout({
        id: "w2",
        completedTimestamp: 1700000001000,
      });
      mockGetWorkouts.mockResolvedValue([workout1, workout2]);
      renderHistoryPage();
      expect(
        await screen.findAllByText(/Completed on/, { selector: "p" }),
      ).toHaveLength(2);
    });

    it("does not render a card for workouts without a completedTimestamp", async () => {
      const completedWorkout = makeWorkout({
        id: "w1",
        completedTimestamp: 1700000000000,
      });
      const incompleteWorkout = makeWorkout({
        id: "w2",
        completedTimestamp: null,
      });
      mockGetWorkouts.mockResolvedValue([completedWorkout, incompleteWorkout]);
      renderHistoryPage();
      expect(
        await screen.findAllByText(/Completed on/, { selector: "p" }),
      ).toHaveLength(1);
    });
  });
});
