import { TrainingLoad } from "../types/TrainingLoad";
import { WorkingSet } from "../types/WorkingSet";

export function getTrainingLoadString(trainingLoad: TrainingLoad): string {
  return `${trainingLoad.sets}x${trainingLoad.reps}x${trainingLoad.weight}`;
}

export function getLoggedSetBreakdown(
  workingSets: Record<number, WorkingSet>,
): string {
  return Object.values(workingSets)
    .map((workingSet) => {
      return `${workingSet.reps}x${workingSet.weight}`;
    })
    .join(", ");
}
