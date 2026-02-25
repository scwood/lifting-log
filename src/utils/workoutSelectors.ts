import { Day } from "../types/Day";
import { Exercise } from "../types/Exercise";
import { ExerciseType } from "../types/ExerciseType";
import { WarmUpSet } from "../types/WarmUpSet";
import { WarmUpType } from "../types/WarmUpType";
import { Workout } from "../types/Workout";
import { weightOfBar } from "./weightUtils";

export function selectWorkoutDays(workout: Workout): Day[] {
  return workout.days;
}

export function selectDayExercises(day: Day): Exercise[] {
  return day.exercises;
}

export function selectExerciseIsComplete(exercise: Exercise): boolean {
  const workingSets = Object.values(exercise.workingSets);
  return (
    workingSets.length === exercise.sets &&
    workingSets.every((workingSet) => workingSet.isLogged)
  );
}

export function selectDayHasCompletedExercises(day: Day): boolean {
  return selectDayExercises(day).some(selectExerciseIsComplete);
}

export function selectDayIsComplete(day: Day): boolean {
  return selectDayExercises(day).every(selectExerciseIsComplete);
}

export function selectWorkoutIsComplete(workout: Workout): boolean {
  return selectWorkoutDays(workout).every(selectDayIsComplete);
}

export function selectWorkoutHasNoDays(workout: Workout): boolean {
  return selectWorkoutDays(workout).length === 0;
}

export function selectWorkoutHasNoExercises(workout: Workout): boolean {
  return selectWorkoutDays(workout).every((day) => {
    return selectDayExercises(day).length === 0;
  });
}

export function selectIncompleteDayExercises(day: Day): Exercise[] {
  return selectDayExercises(day).filter(
    (exercise) => !selectExerciseIsComplete(exercise),
  );
}

export function selectCompletedDayExercises(day: Day): Exercise[] {
  return selectDayExercises(day).filter(selectExerciseIsComplete);
}

export function selectIncompleteWorkoutDays(workout: Workout): Day[] {
  return selectWorkoutDays(workout).filter((day) => {
    return selectIncompleteDayExercises(day).length > 0;
  });
}

export function selectWorkoutDaysWithCompletedExercises(
  workout: Workout,
): Day[] {
  return selectWorkoutDays(workout).filter(selectDayHasCompletedExercises);
}

export function selectExerciseUsesPlates(exercise: Exercise): boolean {
  return (
    exercise.type === ExerciseType.DoublePlate ||
    exercise.type === ExerciseType.SinglePlate
  );
}

export function selectWarmUpSetWeight(
  exercise: Exercise,
  warmUpSet: WarmUpSet,
): number {
  if (warmUpSet.type === WarmUpType.Weight) {
    return warmUpSet.value;
  }

  const minimumWeight =
    exercise.type === ExerciseType.DoublePlate
      ? weightOfBar
      : exercise.minimumWeightIncrement;
  const percentage = warmUpSet.value / 100;

  return Math.max(
    minimumWeight,
    roundToIncrement(
      exercise.weight * percentage,
      exercise.minimumWeightIncrement,
    ),
  );
}

function roundToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}
