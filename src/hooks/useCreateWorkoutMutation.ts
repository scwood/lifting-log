import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createWorkout } from "../api/workoutsApi";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { Workout } from "../types/Workout";
import { currentWorkoutQueryKey } from "./useCurrentWorkoutQuery";

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
