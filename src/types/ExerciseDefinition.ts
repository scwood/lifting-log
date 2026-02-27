import { ExerciseType } from "./ExerciseType";
import { TrainingLoad } from "./TrainingLoad";
import { WarmUpSet } from "./WarmUpSet";

export interface ExerciseDefinition {
  id: string;
  name: string;
  type: ExerciseType;
  minimumWeightIncrement: number;
  warmUpSets: WarmUpSet[];
  trainingLoad: TrainingLoad;
}
