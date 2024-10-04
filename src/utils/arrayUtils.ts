export function arraySwap<T>(array: T[], index1: number, index2: number): T[] {
  const newArray = [...array];
  const temp = newArray[index1];
  newArray[index1] = newArray[index2];
  newArray[index2] = temp;
  return newArray;
}

export function moveItem<T>(
  array: T[],
  itemLocator: (item: T) => boolean,
  direction: "up" | "down"
): T[] {
  const fromIndex = array.findIndex(itemLocator);
  const directionLimit = direction === "up" ? 0 : array.length - 1;
  if (fromIndex === -1 || fromIndex === directionLimit) {
    return array;
  }
  const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
  return arraySwap(array, fromIndex, toIndex);
}
