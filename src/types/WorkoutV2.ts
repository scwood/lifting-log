import { DayV2 } from "./DayV2";
import { ExerciseDefinition } from "./ExerciseDefinition";

export interface WorkoutV2 {
  schemaVersion: 2;
  id: string;
  userId: string;
  createdTimestamp: number;
  completedTimestamp: number | null;
  notes: string | null;
  exercisesById: Record<string, ExerciseDefinition>;
  days: DayV2[];
}
