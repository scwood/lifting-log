import { DayExerciseEntry } from "./DayExerciseEntry";

export interface DayV2 {
  id: string;
  name: string;
  entries: DayExerciseEntry[];
}
