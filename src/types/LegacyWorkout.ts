import { ExerciseName } from "./ExerciseName";

export interface LegacyWorkout {
  id: string;
  userId: string;
  createdTimestamp: number;
  completedTimestamp: number | null;
  notes: string | null;
  workingWeight: {
    [key in ExerciseName]: number;
  };
  lastSetReps: {
    [key in ExerciseName]: number | null;
  };
}
