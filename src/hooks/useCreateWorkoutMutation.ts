import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useCurrentUser } from "../hooks/useCurrentUser";
import { createWorkout } from "../api/workoutsApi";
import { currentWorkoutQueryKey } from "./useCurrentWorkoutQuery";
import { LegacyWorkout } from "../types/LegacyWorkout";

export function useCreateWorkoutMutation() {
  const { userId } = useCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workingWeight,
      ...optionalFields
    }: {
      workingWeight: LegacyWorkout["workingWeight"];
    } & Partial<LegacyWorkout>) => {
      return createWorkout({ userId, workingWeight, ...optionalFields });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: currentWorkoutQueryKey(userId),
      });
    },
  });
}
