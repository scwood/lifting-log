import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { updateWorkout } from "../api/workoutsApi";
import { makeCurrentUserContext, makeWorkout } from "../test-utils/factories";
import { useCurrentUser } from "./useCurrentUser";
import { currentWorkoutQueryKey } from "./useCurrentWorkoutQuery";
import { useUpdateWorkoutMutation } from "./useUpdateWorkoutMutation";
import { workoutsQueryKey } from "./useWorkoutsQuery";

vi.mock("../api/workoutsApi");
vi.mock("./useCurrentUser");

const mockUpdateWorkout = vi.mocked(updateWorkout);
const mockUseCurrentUser = vi.mocked(useCurrentUser);

const userId = "u1";

mockUseCurrentUser.mockReturnValue(makeCurrentUserContext({ userId }));
mockUpdateWorkout.mockResolvedValue(undefined);

function renderMutation() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useUpdateWorkoutMutation(), { wrapper });
  return { result, queryClient };
}

describe("useUpdateWorkoutMutation", () => {
  describe("onMutate optimistic update", () => {
    it("applies updates to the cache when the workout ID matches", async () => {
      const { result, queryClient } = renderMutation();
      const workout = makeWorkout({ id: "w1", notes: null });
      queryClient.setQueryData(currentWorkoutQueryKey(userId), workout);

      await act(async () => {
        await result.current.mutateAsync({
          workoutId: "w1",
          updates: { notes: "test note" },
        });
      });

      expect(queryClient.getQueryData(currentWorkoutQueryKey(userId))).toEqual({
        ...workout,
        notes: "test note",
      });
    });

    it("does not update the cache when the workout ID does not match", async () => {
      const { result, queryClient } = renderMutation();
      const workout = makeWorkout({ id: "w1" });
      queryClient.setQueryData(currentWorkoutQueryKey(userId), workout);

      await act(async () => {
        await result.current.mutateAsync({
          workoutId: "w2",
          updates: { notes: "test note" },
        });
      });

      expect(queryClient.getQueryData(currentWorkoutQueryKey(userId))).toEqual(
        workout,
      );
    });

    it("leaves the cache empty when there is no cached workout", async () => {
      const { result, queryClient } = renderMutation();

      await act(async () => {
        await result.current.mutateAsync({
          workoutId: "w1",
          updates: { notes: "test note" },
        });
      });

      expect(
        queryClient.getQueryData(currentWorkoutQueryKey(userId)),
      ).toBeUndefined();
    });
  });

  describe("onSettled", () => {
    it("invalidates the currentWorkout and workouts query keys", async () => {
      const { result, queryClient } = renderMutation();
      const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

      await act(async () => {
        await result.current.mutateAsync({ workoutId: "w1", updates: {} });
      });

      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: currentWorkoutQueryKey(userId),
      });
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: workoutsQueryKey(userId),
      });
    });
  });
});
