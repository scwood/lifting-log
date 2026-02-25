import { describe, expect, it } from "vitest";

import { getLoggedSetBreakdown, getVolumeLoad } from "./workoutFormattingUtils";

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

describe("getLoggedSetBreakdown", () => {
  it("formats reps and logged weights per set", () => {
    expect(
      getLoggedSetBreakdown(
        {
          0: { isLogged: true, reps: 5, weight: 135 },
          1: { isLogged: true, reps: 4, weight: 130 },
        },
        135,
      ),
    ).toBe("5x135,4x130");
  });

  it("falls back to default weight when set weight is missing", () => {
    expect(
      getLoggedSetBreakdown(
        {
          0: { isLogged: true, reps: 5, weight: null },
        },
        135,
      ),
    ).toBe("5x135");
  });
});
