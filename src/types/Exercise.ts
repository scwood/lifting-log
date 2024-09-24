import { ExerciseType } from "./ExerciseType";
import { WarmUpSet } from "./WarmUpSet";
import { WorkingSet } from "./WorkingSet";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  type: ExerciseType;
  warmUpSets: WarmUpSet[];
  workingSets: Record<number, WorkingSet>;
}
