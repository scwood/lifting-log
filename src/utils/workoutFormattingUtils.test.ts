import { describe, expect, it } from "vitest";

import { getVolumeLoad } from "./workoutFormattingUtils";

describe("getVolumeLoad", () => {
  it("formats sets x reps x weight as a string", () => {
    expect(getVolumeLoad({ sets: 3, reps: 5, weight: 135 })).toBe("3x5x135");
  });

  it("works with fractional weight values", () => {
    expect(getVolumeLoad({ sets: 4, reps: 8, weight: 112.5 })).toBe(
      "4x8x112.5",
    );
  });
});
