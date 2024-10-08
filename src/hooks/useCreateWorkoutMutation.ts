import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useCurrentUser } from "../hooks/useCurrentUser";
import { createWorkout } from "../api/workoutsApi";
import { currentWorkoutQueryKey } from "./useCurrentWorkoutQuery";
import { Workout } from "../types/Workout";

export function useCreateWorkoutMutation() {
  const { userId } = useCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ...optionalFields }: Partial<Workout>) => {
      return createWorkout({ userId, ...optionalFields });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: currentWorkoutQueryKey(userId),
      });
    },
  });
}
