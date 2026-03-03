import { TrainingLoad } from "../types/TrainingLoad";
import { WorkingSet } from "../types/WorkingSet";

export function formatTrainingLoad({
  sets,
  reps,
  weight,
}: TrainingLoad): string {
  return `${sets}x${reps}x${weight}`;
}

export function formatTrainingLoadVerbose({
  sets,
  reps,
  weight,
}: TrainingLoad): string {
  return `${sets} sets of ${reps} at ${weight} lbs`;
}

export function formatLoggedSetBreakdown(
  workingSets: Record<number, WorkingSet>,
  fallbackWeight: number,
): string {
  return Object.values(workingSets)
    .map((workingSet) => {
      return `${workingSet.reps}x${workingSet.weight ?? fallbackWeight}`;
    })
    .join(", ");
}
