import { Exercise } from "./Exercise";

export interface Day {
  id: string;
  name: string;
  exercises: Exercise[];
}
