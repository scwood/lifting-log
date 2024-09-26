import { ExerciseType } from "./ExerciseType";
import { NextSessionPlan } from "./NextSessionPlan";
import { WarmUpSet } from "./WarmUpSet";
import { WorkingSet } from "./WorkingSet";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  type: ExerciseType;
  minimumWeightIncrement: number;
  warmUpSets: WarmUpSet[];
  workingSets: Record<number, WorkingSet>;
  nextSession: NextSessionPlan;
}
