export const allExercises = [
  "benchPress",
  "deadLift",
  "overheadPress",
  "squat",
] as const;

export const exerciseDisplayNames: { [key in ExerciseName]: string } = {
  benchPress: "Bench press",
  deadLift: "Dead lift",
  overheadPress: "Overhead press",
  squat: "Squat",
};

export type ExerciseName = (typeof allExercises)[number];
