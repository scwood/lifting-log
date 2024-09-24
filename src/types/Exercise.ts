import { ExerciseType } from "./ExerciseType";
import { WarmUpSet } from "./WarmUpSet";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  type: ExerciseType;
  warmUpSets: WarmUpSet[];
}
