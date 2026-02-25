import { ExerciseType } from "../types/ExerciseType";

export const weightOfBar = 45;

const plates = [45, 25, 10, 5, 2.5, 1.25];

export function calculatePlates(
  weight: number,
  exerciseType: ExerciseType,
): string {
  let remainingWeight = weight;
  if (exerciseType === ExerciseType.DoublePlate) {
    const weightMinusBar = weight - weightOfBar;
    const weightOfOneSide = weightMinusBar / 2;
    remainingWeight = weightOfOneSide;
  }
  const result = [];
  for (let i = 0; i < plates.length; i++) {
    const plate = plates[i];
    const remainder = remainingWeight % plate;
    const numberOfPlates = (remainingWeight - remainder) / plate;
    for (let j = 0; j < numberOfPlates; j++) {
      result.push(plate);
    }
    if (numberOfPlates > 0) {
      remainingWeight = remainder;
    }
  }
  return result.join(", ");
}
