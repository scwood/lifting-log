import { describe, expect, it } from "vitest";

import { Direction, arraySwap, moveItem } from "./arrayUtils";

describe("arraySwap", () => {
  it("swaps the elements at the two given indices", () => {
    expect(arraySwap([1, 2, 3], 0, 2)).toEqual([3, 2, 1]);
  });

  it("swaps adjacent elements", () => {
    expect(arraySwap(["a", "b", "c"], 1, 2)).toEqual(["a", "c", "b"]);
  });

  it("returns a new array and does not mutate the original", () => {
    const original = [1, 2, 3];
    const result = arraySwap(original, 0, 1);
    expect(result).not.toBe(original);
    expect(original).toEqual([1, 2, 3]);
  });

  it("swapping the same index twice returns an equivalent array", () => {
    expect(arraySwap([1, 2, 3], 1, 1)).toEqual([1, 2, 3]);
  });
});

describe("moveItem", () => {
  describe("Direction.Up", () => {
    it("moves an item toward the front of the array", () => {
      expect(moveItem(["a", "b", "c"], 1, Direction.Up)).toEqual([
        "b",
        "a",
        "c",
      ]);
    });

    it("moves the last item up", () => {
      expect(moveItem(["a", "b", "c"], 2, Direction.Up)).toEqual([
        "a",
        "c",
        "b",
      ]);
    });

    it("returns the original array when the item is already at index 0", () => {
      const arr = ["a", "b", "c"];
      expect(moveItem(arr, 0, Direction.Up)).toBe(arr);
    });
  });

  describe("Direction.Down", () => {
    it("moves an item toward the end of the array", () => {
      expect(moveItem(["a", "b", "c"], 1, Direction.Down)).toEqual([
        "a",
        "c",
        "b",
      ]);
    });

    it("moves the first item down", () => {
      expect(moveItem(["a", "b", "c"], 0, Direction.Down)).toEqual([
        "b",
        "a",
        "c",
      ]);
    });

    it("returns the original array when the item is already at the last index", () => {
      const arr = ["a", "b", "c"];
      expect(moveItem(arr, 2, Direction.Down)).toBe(arr);
    });
  });

  describe("out-of-bounds indices", () => {
    it("returns the original array for a negative index", () => {
      const arr = ["a", "b", "c"];
      expect(moveItem(arr, -1, Direction.Up)).toBe(arr);
    });

    it("returns the original array for an index beyond the last element", () => {
      const arr = ["a", "b", "c"];
      expect(moveItem(arr, 3, Direction.Down)).toBe(arr);
    });
  });

  it("returns a new array reference on a valid move", () => {
    const arr = ["a", "b", "c"];
    const result = moveItem(arr, 1, Direction.Up);
    expect(result).not.toBe(arr);
  });

  it("handles a single-element array without moving", () => {
    const arr = ["only"];
    expect(moveItem(arr, 0, Direction.Up)).toBe(arr);
    expect(moveItem(arr, 0, Direction.Down)).toBe(arr);
  });
});
