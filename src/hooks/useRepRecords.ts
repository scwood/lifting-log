import { useMemo } from "react";

import { ExerciseName, allExercises } from "../types/ExerciseName";
import { Workout } from "../types/Workout";
import { useWorkoutsQuery } from "./useWorkoutsQuery";

export type RepRecords = {
  [key in ExerciseName]: Record<number, number>;
};

export function useRepRecords() {
  const { data: workouts = [], isLoading, isError } = useWorkoutsQuery();
  const repRecords = useMemo(() => parseRepRecords(workouts), [workouts]);

  return { isLoading, isError, repRecords };
}

function parseRepRecords(workouts: Workout[]): RepRecords {
  return workouts.reduce<RepRecords>(
    (result, workout) => {
      for (const exercise of allExercises) {
        const workingWeight = workout.workingWeight[exercise];
        const lastSetReps = workout.lastSetReps[exercise] || 0;
        const previousRecord = result[exercise][workingWeight] || 0;
        result[exercise][workingWeight] = Math.max(lastSetReps, previousRecord);
      }
      return result;
    },
    {
      benchPress: {},
      overheadPress: {},
      squat: {},
      deadLift: {},
    }
  );
}
