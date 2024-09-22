import { ExerciseType } from "./ExerciseType";
import { WarmupSet } from "./WarmupSet";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  type: ExerciseType;
  warmupSets: WarmupSet[];
}
