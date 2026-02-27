import { DayExercise } from "./DayExercise";

export interface Day {
  id: string;
  name: string;
  exercises: DayExercise[];
}
