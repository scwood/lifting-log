import { describe, expect, it } from "vitest";

import {
  getLoggedSetBreakdown,
  getTrainingLoadString,
} from "./workoutFormattingUtils";

describe("getVolumeLoad", () => {
  it("formats sets x reps x weight as a string", () => {
    expect(getTrainingLoadString({ sets: 3, reps: 5, weight: 135 })).toBe(
      "3x5x135",
    );
  });

  it("works with fractional weight values", () => {
    expect(getTrainingLoadString({ sets: 4, reps: 8, weight: 112.5 })).toBe(
      "4x8x112.5",
    );
  });
});

describe("getLoggedSetBreakdown", () => {
  it("formats reps and logged weights per set with comma-space separation", () => {
    expect(
      getLoggedSetBreakdown(
        {
          0: { isLogged: true, reps: 5, weight: 135 },
          1: { isLogged: true, reps: 4, weight: 130 },
        },
        125,
      ),
    ).toBe("5x135, 4x130");
  });

  it("uses fallback value when weight is missing from logged set", () => {
    expect(
      getLoggedSetBreakdown(
        {
          0: { isLogged: true, reps: 5, weight: null },
        },
        150,
      ),
    ).toBe("5x150");
  });
});
