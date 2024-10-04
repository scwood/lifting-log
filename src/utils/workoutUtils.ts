import { Day } from "../types/Day";
import { Exercise } from "../types/Exercise";
import { ExerciseType } from "../types/ExerciseType";
import { WarmUpSet } from "../types/WarmUpSet";
import { WarmUpType } from "../types/WarmUpType";
import { Workout } from "../types/Workout";

const weightOfBar = 45;
const plates = [45, 25, 10, 5, 2.5, 1.25];

export function calculatePlates(
  weight: number,
  exerciseType: ExerciseType
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

export function calculateDeload(weight: number): number {
  const unrounded = weight * 0.9;
  return unrounded - (unrounded % 5);
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
    round(exercise.weight * percentage, exercise.minimumWeightIncrement)
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
