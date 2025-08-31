import { useQuery } from "@tanstack/react-query";

import { getCurrentWorkout } from "../api/workoutsApi";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function currentWorkoutQueryKey(userId: string) {
  return ["currentWorkout", userId];
}

export function useCurrentWorkoutQuery() {
  const { userId } = useCurrentUser();

  return useQuery({
    queryKey: currentWorkoutQueryKey(userId),
    queryFn: () => getCurrentWorkout(userId),
  });
}
