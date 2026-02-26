import { DayExercise } from "./DayExercise";

export interface DayV2 {
  id: string;
  name: string;
  exercises: DayExercise[];
}
