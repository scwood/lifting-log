import { Day } from "./Day";
import { ExerciseDefinition } from "./ExerciseDefinition";

export interface Workout {
  schemaVersion: 2;
  id: string;
  userId: string;
  createdTimestamp: number;
  completedTimestamp: number | null;
  notes: string | null;
  exerciseDefinitionsById: Record<string, ExerciseDefinition>;
  days: Day[];
}
