export function arraySwap<T>(array: T[], index1: number, index2: number): T[] {
  const newArray = [...array];
  const temp = newArray[index1];
  newArray[index1] = newArray[index2];
  newArray[index2] = temp;
  return newArray;
}
