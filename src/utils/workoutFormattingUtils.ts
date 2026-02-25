import { WorkingSet } from "../types/WorkingSet";

export function getVolumeLoad(values: {
  sets: number;
  reps: number;
  weight: number;
}): string {
  return `${values.sets}x${values.reps}x${values.weight}`;
}

export function getLoggedSetBreakdown(
  workingSets: Record<number, WorkingSet>,
  defaultWeight: number,
): string {
  return Object.values(workingSets)
    .map((workingSet) => {
      return `${workingSet.reps ?? "-"}x${workingSet.weight ?? defaultWeight}`;
    })
    .join(",");
}
