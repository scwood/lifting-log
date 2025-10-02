import { produce } from "immer";

import { Day } from "../types/Day";
import { Exercise } from "../types/Exercise";
import { ExerciseType } from "../types/ExerciseType";
import { WarmUpSet } from "../types/WarmUpSet";
import { WarmUpType } from "../types/WarmUpType";
import { Workout } from "../types/Workout";
import { Direction, moveItem } from "./arrayUtils";

const weightOfBar = 45;
const plates = [45, 25, 10, 5, 2.5, 1.25];

export function calculatePlates(
  weight: number,
  exerciseType: ExerciseType,
): string {
  let remainingWeight = weight;
  if (exerciseType === ExerciseType.DoublePlate) {
    const weightMinusBar = weight - weightOfBar;
    const weightOfOneSide = weightMinusBar / 2;
    remainingWeight = weightOfOneSide;
  }
  const result = [];
  for (let i = 0; i < plates.length; i++) {
    const plate = plates[i];
    const remainder = remainingWeight % plate;
    const numberOfPlates = (remainingWeight - remainder) / plate;
    for (let j = 0; j < numberOfPlates; j++) {
      result.push(plate);
    }
    if (numberOfPlates > 0) {
      remainingWeight = remainder;
    }
  }
  return result.join(", ");
}

export function isExerciseComplete(exercise: Exercise): boolean {
  const workingSets = Object.values(exercise.workingSets);
  return (
    workingSets.length === exercise.sets &&
    workingSets.every((workingSet) => workingSet.isLogged)
  );
}

export function isAnyExerciseComplete(day: Day): boolean {
  return day.exercises.some(isExerciseComplete);
}

export function isEveryExerciseComplete(day: Day): boolean {
  return day.exercises.every(isExerciseComplete);
}

export function isEveryDayComplete(workout: Workout): boolean {
  return workout.days.every(isEveryExerciseComplete);
}

export function isPlateExercise(exercise: Exercise): boolean {
  return (
    exercise.type === ExerciseType.DoublePlate ||
    exercise.type === ExerciseType.SinglePlate
  );
}

export function getWarmUpWeight(exercise: Exercise, warmUpSet: WarmUpSet) {
  if (warmUpSet.type === WarmUpType.Weight) {
    return warmUpSet.value;
  }
  let minimumWeight = exercise.minimumWeightIncrement;
  if (exercise.type === ExerciseType.DoublePlate) {
    minimumWeight = weightOfBar;
  }
  const percentage = warmUpSet.value / 100;
  return Math.max(
    minimumWeight,
    round(exercise.weight * percentage, exercise.minimumWeightIncrement),
  );
}

function round(n: number, increment: number): number {
  return Math.round(n / increment) * increment;
}

export function getVolumeLoad(values: {
  sets: number;
  reps: number;
  weight: number;
}): string {
  return `${values.sets}x${values.reps}x${values.weight}`;
}

export function moveExercise(
  workout: Workout,
  dayId: string,
  exerciseId: string,
  direction: Direction,
): Workout {
  const originalDayIndex = workout.days.findIndex((d) => d.id === dayId);
  const originalDay = workout.days[originalDayIndex];

  // Bail if day doesn't exist
  if (!originalDay) {
    return workout;
  }

  const originalExerciseIndex = originalDay.exercises.findIndex(
    (e) => e.id === exerciseId,
  );
  const originalExercise = originalDay.exercises[originalExerciseIndex];

  // Bail if exercise doesn't exist in the day
  if (!originalExercise) {
    return workout;
  }

  // Bail if requested direction is impossible
  if (
    (direction === Direction.Up &&
      originalExerciseIndex === 0 &&
      originalDayIndex === 0) ||
    (direction === Direction.Down &&
      originalExerciseIndex === originalDay.exercises.length - 1 &&
      originalDayIndex === workout.days.length - 1)
  ) {
    return workout;
  }

  const isDayMove =
    (direction === Direction.Up && originalExerciseIndex === 0) ||
    (direction === Direction.Down &&
      originalExerciseIndex === originalDay.exercises.length - 1);

  return produce(workout, (draft) => {
    if (!isDayMove) {
      draft.days[originalDayIndex].exercises = moveItem(
        draft.days[originalDayIndex].exercises,
        originalExerciseIndex,
        direction,
      );
    } else {
      draft.days[originalDayIndex].exercises.splice(originalExerciseIndex, 1);
      if (direction === Direction.Up) {
        draft.days[originalDayIndex - 1].exercises.push(originalExercise);
      } else {
        draft.days[originalDayIndex + 1].exercises.unshift(originalExercise);
      }
    }
  });
}
