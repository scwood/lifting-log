import { Day } from "../types/Day";
import { DayExercise } from "../types/DayExercise";
import { ExerciseDefinition } from "../types/ExerciseDefinition";
import { ExerciseType } from "../types/ExerciseType";
import { TrainingLoad } from "../types/TrainingLoad";
import { WarmUpSet } from "../types/WarmUpSet";
import { WarmUpType } from "../types/WarmUpType";
import { Workout } from "../types/Workout";
import { weightOfBar } from "./weightUtils";

export function selectWorkoutDays(workout: Workout): Day[] {
  return workout.days;
}

export function selectDayExercises(day: Day): DayExercise[] {
  return day.exercises;
}

export function selectExerciseDefinition(
  workout: Workout,
  exercise: DayExercise,
): ExerciseDefinition | undefined {
  return workout.exerciseDefinitionsById[exercise.exerciseDefinitionId];
}

export function selectExerciseTrainingLoad(
  exerciseDefinition: ExerciseDefinition,
): TrainingLoad {
  return exerciseDefinition.trainingLoad;
}

export function selectExerciseIsComplete(
  workout: Workout,
  exercise: DayExercise,
): boolean {
  const exerciseDefinition = selectExerciseDefinition(workout, exercise);
  if (!exerciseDefinition) {
    return false;
  }
  const workingSets = Object.values(exercise.workingSets);
  return (
    workingSets.length === exerciseDefinition.trainingLoad.sets &&
    workingSets.every((workingSet) => workingSet.isLogged)
  );
}

export function selectDayHasCompletedExercises(
  workout: Workout,
  day: Day,
): boolean {
  return selectDayExercises(day).some((exercise) => {
    return selectExerciseIsComplete(workout, exercise);
  });
}

export function selectDayIsComplete(workout: Workout, day: Day): boolean {
  return selectDayExercises(day).every((exercise) => {
    return selectExerciseIsComplete(workout, exercise);
  });
}

export function selectWorkoutIsComplete(workout: Workout): boolean {
  return selectWorkoutDays(workout).every((day) => {
    return selectDayIsComplete(workout, day);
  });
}

export function selectWorkoutHasNoDays(workout: Workout): boolean {
  return selectWorkoutDays(workout).length === 0;
}

export function selectWorkoutHasNoExercises(workout: Workout): boolean {
  return selectWorkoutDays(workout).every((day) => {
    return selectDayExercises(day).length === 0;
  });
}

export function selectIncompleteDayExercises(
  workout: Workout,
  day: Day,
): DayExercise[] {
  return selectDayExercises(day).filter((exercise) => {
    return !selectExerciseIsComplete(workout, exercise);
  });
}

export function selectCompletedDayExercises(
  workout: Workout,
  day: Day,
): DayExercise[] {
  return selectDayExercises(day).filter((exercise) => {
    return selectExerciseIsComplete(workout, exercise);
  });
}

export function selectIncompleteWorkoutDays(workout: Workout): Day[] {
  return selectWorkoutDays(workout).filter((day) => {
    return selectIncompleteDayExercises(workout, day).length > 0;
  });
}

export function selectWorkoutDaysWithCompletedExercises(
  workout: Workout,
): Day[] {
  return selectWorkoutDays(workout).filter((day) => {
    return selectDayHasCompletedExercises(workout, day);
  });
}

export function selectExerciseUsesPlates(
  exerciseDefinition: ExerciseDefinition,
): boolean {
  return (
    exerciseDefinition.type === ExerciseType.DoublePlate ||
    exerciseDefinition.type === ExerciseType.SinglePlate
  );
}

export function selectWarmUpSetWeight(
  exerciseDefinition: ExerciseDefinition,
  warmUpSet: WarmUpSet,
): number {
  if (warmUpSet.type === WarmUpType.Weight) {
    return warmUpSet.value;
  }

  const minimumWeight =
    exerciseDefinition.type === ExerciseType.DoublePlate
      ? weightOfBar
      : exerciseDefinition.minimumWeightIncrement;
  const percentage = warmUpSet.value / 100;

  return Math.max(
    minimumWeight,
    roundToIncrement(
      exerciseDefinition.trainingLoad.weight * percentage,
      exerciseDefinition.minimumWeightIncrement,
    ),
  );
}

function roundToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}
