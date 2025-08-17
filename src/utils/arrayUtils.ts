export function arraySwap<T>(array: T[], index1: number, index2: number): T[] {
  const newArray = [...array];
  const temp = newArray[index1];
  newArray[index1] = newArray[index2];
  newArray[index2] = temp;
  return newArray;
}

export enum Direction {
  Up = "up",
  Down = "down",
}

export function moveItem<T>(
  array: T[],
  index: number,
  direction: Direction,
): T[] {
  const directionLimit = direction === Direction.Up ? 0 : array.length - 1;
  if (index < 0 || index > array.length - 1 || index === directionLimit) {
    return array;
  }
  const newIndex = direction === Direction.Up ? index - 1 : index + 1;
  return arraySwap(array, index, newIndex);
}
