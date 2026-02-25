import { ExerciseType } from "./ExerciseType";
import { WarmUpSet } from "./WarmUpSet";

export interface ExerciseDefinition {
  id: string;
  name: string;
  type: ExerciseType;
  minimumWeightIncrement: number;
  warmUpSets: WarmUpSet[];
  currentPlan: {
    sets: number;
    reps: number;
    weight: number;
  };
}
