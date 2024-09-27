import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useCurrentUser } from "../hooks/useCurrentUser";
import { updateWorkout } from "../api/workoutsApi";
import { currentWorkoutQueryKey } from "./useCurrentWorkoutQuery";
import { LegacyWorkout } from "../types/LegacyWorkout";
import { workoutsQueryKey } from "./useWorkoutsQuery";
import { Workout } from "../types/Workout";

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
      const currentWorkout = queryClient.getQueryData<LegacyWorkout>(
        currentWorkoutQueryKey(userId)
      );
      if (currentWorkout && currentWorkout.id === workoutId) {
        queryClient.setQueryData(currentWorkoutQueryKey(userId), {
          ...currentWorkout,
          ...updates,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: currentWorkoutQueryKey(userId),
      });
      queryClient.invalidateQueries({
        queryKey: workoutsQueryKey(userId),
      });
    },
  });
}
