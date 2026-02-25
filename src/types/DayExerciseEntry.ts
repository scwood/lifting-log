import { WorkingSetV2 } from "./WorkingSetV2";

export interface DayExerciseEntry {
  id: string;
  exerciseId: string;
  workingSets: Record<number, WorkingSetV2>;
}
