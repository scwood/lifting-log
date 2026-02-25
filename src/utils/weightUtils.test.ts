import { describe, expect, it } from "vitest";

import { ExerciseType } from "../types/ExerciseType";
import { calculatePlates, weightOfBar } from "./weightUtils";

describe("weightOfBar", () => {
  it("is 45", () => {
    expect(weightOfBar).toBe(45);
  });
});

describe("calculatePlates", () => {
  describe("DoublePlate (barbell subtracts bar and splits by two)", () => {
    it("returns empty string for bar weight only (45 lbs)", () => {
      expect(calculatePlates(45, ExerciseType.DoublePlate)).toBe("");
    });

    it("returns a single 45 plate per side for 135 lbs", () => {
      expect(calculatePlates(135, ExerciseType.DoublePlate)).toBe("45");
    });

    it("returns two 45 plates per side for 225 lbs", () => {
      expect(calculatePlates(225, ExerciseType.DoublePlate)).toBe("45, 45");
    });

    it("combines different plates for 185 lbs", () => {
      expect(calculatePlates(185, ExerciseType.DoublePlate)).toBe("45, 25");
    });

    it("combines multiple plate sizes for 155 lbs", () => {
      expect(calculatePlates(155, ExerciseType.DoublePlate)).toBe("45, 10");
    });
  });

  describe("SinglePlate (uses the full weight directly)", () => {
    it("returns a single 45 plate for 45 lbs", () => {
      expect(calculatePlates(45, ExerciseType.SinglePlate)).toBe("45");
    });

    it("combines plates for 70 lbs", () => {
      expect(calculatePlates(70, ExerciseType.SinglePlate)).toBe("45, 25");
    });
  });

  describe("Other (uses the full weight directly)", () => {
    it("returns a single 10 plate for 10 lbs", () => {
      expect(calculatePlates(10, ExerciseType.Other)).toBe("10");
    });

    it("combines small plates for 7.5 lbs", () => {
      expect(calculatePlates(7.5, ExerciseType.Other)).toBe("5, 2.5");
    });
  });
});
