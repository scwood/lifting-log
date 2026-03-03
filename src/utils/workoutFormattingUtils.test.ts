import { describe, expect, it } from "vitest";

import {
  formatLoggedSetBreakdown,
  formatTrainingLoad,
  formatTrainingLoadVerbose,
} from "./workoutFormattingUtils";

describe("formatTrainingLoad", () => {
  it("formats sets x reps x weight as a string", () => {
    expect(formatTrainingLoad({ sets: 3, reps: 5, weight: 135 })).toBe(
      "3x5x135",
    );
  });

  it("works with fractional weight values", () => {
    expect(formatTrainingLoad({ sets: 4, reps: 8, weight: 112.5 })).toBe(
      "4x8x112.5",
    );
  });
});

describe("formatTrainingLoadVerbose", () => {
  it("formats weight, reps, and sets as a sentence", () => {
    expect(formatTrainingLoadVerbose({ weight: 150, reps: 5, sets: 3 })).toBe(
      "3 sets of 5 at 150 lbs",
    );
  });

  it("works with fractional weight values", () => {
    expect(formatTrainingLoadVerbose({ weight: 112.5, reps: 8, sets: 4 })).toBe(
      "4 sets of 8 at 112.5 lbs",
    );
  });
});

describe("formatLoggedSetBreakdown", () => {
  it("formats reps and logged weights per set with comma-space separation", () => {
    expect(
      formatLoggedSetBreakdown(
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
      formatLoggedSetBreakdown(
        {
          0: { isLogged: true, reps: 5, weight: null },
        },
        150,
      ),
    ).toBe("5x150");
  });
});
