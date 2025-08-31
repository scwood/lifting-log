import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateWorkout } from "../api/workoutsApi";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { Workout } from "../types/Workout";
import { currentWorkoutQueryKey } from "./useCurrentWorkoutQuery";
import { workoutsQueryKey } from "./useWorkoutsQuery";

export function useUpdateWorkoutMutation() {
  const { userId } = useCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutId,
      updates,
    }: {
      workoutId: string;
      updates: Partial<Workout>;
    }) => {
      return updateWorkout(workoutId, updates);
    },
    onMutate: ({ workoutId, updates }) => {
      const currentWorkout = queryClient.getQueryData<Workout>(
        currentWorkoutQueryKey(userId),
      );
      if (currentWorkout && currentWorkout.id === workoutId) {
        queryClient.setQueryData(currentWorkoutQueryKey(userId), {
          ...currentWorkout,
          ...updates,
        });
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: currentWorkoutQueryKey(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: workoutsQueryKey(userId),
        }),
      ]);
    },
  });
}
