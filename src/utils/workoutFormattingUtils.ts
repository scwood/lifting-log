export function getVolumeLoad(values: {
  sets: number;
  reps: number;
  weight: number;
}): string {
  return `${values.sets}x${values.reps}x${values.weight}`;
}
