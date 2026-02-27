import { TrainingLoad } from "./TrainingLoad";
import { WorkingSet } from "./WorkingSet";

export interface DayExercise {
  id: string;
  exerciseDefinitionId: string;
  workingSets: Record<number, WorkingSet>;
  definitionTrainingLoadBeforeCompletion: TrainingLoad | null;
}
