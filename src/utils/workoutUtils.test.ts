import { describe, expect, it } from "vitest";

import { Day } from "../types/Day";
import { Exercise } from "../types/Exercise";
import { ExerciseType } from "../types/ExerciseType";
import { WarmUpType } from "../types/WarmUpType";
import { Workout } from "../types/Workout";
import { Direction } from "./arrayUtils";
import {
  calculatePlates,
  getVolumeLoad,
  getWarmUpWeight,
  isAnyExerciseComplete,
  isEveryDayComplete,
  isEveryExerciseComplete,
  isExerciseComplete,
  isPlateExercise,
  moveExercise,
} from "./workoutUtils";

// ---------------------------------------------------------------------------
// Fixture factories
// ---------------------------------------------------------------------------

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: "ex1",
    name: "Squat",
    sets: 3,
    reps: 5,
    weight: 135,
    type: ExerciseType.DoublePlate,
    minimumWeightIncrement: 5,
    warmUpSets: [],
    workingSets: {},
    nextSession: {},
    ...overrides,
  };
}

function makeDay(overrides: Partial<Day> = {}): Day {
  return {
    id: "day1",
    name: "Day 1",
    exercises: [],
    ...overrides,
  };
}

function makeWorkout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: "w1",
    userId: "u1",
    createdTimestamp: 0,
    completedTimestamp: null,
    notes: null,
    days: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// calculatePlates
// ---------------------------------------------------------------------------

describe("calculatePlates", () => {
  describe("DoublePlate (barbell — subtracts bar and splits by two)", () => {
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

// ---------------------------------------------------------------------------
// isExerciseComplete
// ---------------------------------------------------------------------------

describe("isExerciseComplete", () => {
  it("returns true when all working sets are logged and count matches sets", () => {
    const exercise = makeExercise({
      sets: 2,
      workingSets: {
        0: { reps: 5, isLogged: true },
        1: { reps: 5, isLogged: true },
      },
    });
    expect(isExerciseComplete(exercise)).toBe(true);
  });

  it("returns false when no working sets have been recorded yet", () => {
    const exercise = makeExercise({ sets: 3, workingSets: {} });
    expect(isExerciseComplete(exercise)).toBe(false);
  });

  it("returns false when the recorded count is less than sets", () => {
    const exercise = makeExercise({
      sets: 3,
      workingSets: { 0: { reps: 5, isLogged: true } },
    });
    expect(isExerciseComplete(exercise)).toBe(false);
  });

  it("returns false when the count matches but one set is not logged", () => {
    const exercise = makeExercise({
      sets: 2,
      workingSets: {
        0: { reps: 5, isLogged: true },
        1: { reps: null, isLogged: false },
      },
    });
    expect(isExerciseComplete(exercise)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isAnyExerciseComplete
// ---------------------------------------------------------------------------

describe("isAnyExerciseComplete", () => {
  const completeExercise = makeExercise({
    id: "complete",
    sets: 1,
    workingSets: { 0: { reps: 5, isLogged: true } },
  });
  const incompleteExercise = makeExercise({
    id: "incomplete",
    workingSets: {},
  });

  it("returns true when at least one exercise is complete", () => {
    const day = makeDay({ exercises: [incompleteExercise, completeExercise] });
    expect(isAnyExerciseComplete(day)).toBe(true);
  });

  it("returns false when no exercises are complete", () => {
    const day = makeDay({ exercises: [incompleteExercise] });
    expect(isAnyExerciseComplete(day)).toBe(false);
  });

  it("returns false for a day with no exercises", () => {
    expect(isAnyExerciseComplete(makeDay())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isEveryExerciseComplete
// ---------------------------------------------------------------------------

describe("isEveryExerciseComplete", () => {
  const completeExercise = (id: string) =>
    makeExercise({
      id,
      sets: 1,
      workingSets: { 0: { reps: 5, isLogged: true } },
    });
  const incompleteExercise = makeExercise({
    id: "incomplete",
    workingSets: {},
  });

  it("returns true when all exercises are complete", () => {
    const day = makeDay({
      exercises: [completeExercise("a"), completeExercise("b")],
    });
    expect(isEveryExerciseComplete(day)).toBe(true);
  });

  it("returns false when any exercise is not complete", () => {
    const day = makeDay({
      exercises: [completeExercise("a"), incompleteExercise],
    });
    expect(isEveryExerciseComplete(day)).toBe(false);
  });

  it("returns true for a day with no exercises (vacuously true)", () => {
    expect(isEveryExerciseComplete(makeDay())).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isEveryDayComplete
// ---------------------------------------------------------------------------

describe("isEveryDayComplete", () => {
  const completeDay = makeDay({
    id: "complete",
    exercises: [
      makeExercise({
        id: "ex",
        sets: 1,
        workingSets: { 0: { reps: 5, isLogged: true } },
      }),
    ],
  });
  const incompleteDay = makeDay({
    id: "incomplete",
    exercises: [makeExercise({ id: "ex2", workingSets: {} })],
  });

  it("returns true when every day is complete", () => {
    const workout = makeWorkout({ days: [completeDay] });
    expect(isEveryDayComplete(workout)).toBe(true);
  });

  it("returns false when any day is not complete", () => {
    const workout = makeWorkout({ days: [completeDay, incompleteDay] });
    expect(isEveryDayComplete(workout)).toBe(false);
  });

  it("returns true for a workout with no days (vacuously true)", () => {
    expect(isEveryDayComplete(makeWorkout())).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isPlateExercise
// ---------------------------------------------------------------------------

describe("isPlateExercise", () => {
  it("returns true for DoublePlate exercises", () => {
    expect(
      isPlateExercise(makeExercise({ type: ExerciseType.DoublePlate })),
    ).toBe(true);
  });

  it("returns true for SinglePlate exercises", () => {
    expect(
      isPlateExercise(makeExercise({ type: ExerciseType.SinglePlate })),
    ).toBe(true);
  });

  it("returns false for Other exercises", () => {
    expect(isPlateExercise(makeExercise({ type: ExerciseType.Other }))).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// getWarmUpWeight
// ---------------------------------------------------------------------------

describe("getWarmUpWeight", () => {
  describe("WarmUpType.Weight", () => {
    it("returns the warm-up set value directly", () => {
      const exercise = makeExercise({ weight: 200 });
      const warmUpSet = {
        id: "w1",
        type: WarmUpType.Weight,
        reps: 5,
        value: 30,
      };
      expect(getWarmUpWeight(exercise, warmUpSet)).toBe(30);
    });
  });

  describe("WarmUpType.Percentage — DoublePlate (minimum is bar weight, 45 lbs)", () => {
    it("calculates percentage of the working weight", () => {
      const exercise = makeExercise({
        weight: 200,
        type: ExerciseType.DoublePlate,
        minimumWeightIncrement: 5,
      });
      const warmUpSet = {
        id: "w1",
        type: WarmUpType.Percentage,
        reps: 5,
        value: 50,
      };
      // round(200 * 0.50, 5) = 100; max(45, 100) = 100
      expect(getWarmUpWeight(exercise, warmUpSet)).toBe(100);
    });

    it("clamps to bar weight when the calculated value falls below 45 lbs", () => {
      const exercise = makeExercise({
        weight: 45,
        type: ExerciseType.DoublePlate,
        minimumWeightIncrement: 5,
      });
      const warmUpSet = {
        id: "w1",
        type: WarmUpType.Percentage,
        reps: 5,
        value: 50,
      };
      // round(45 * 0.50, 5) = round(22.5, 5) = 25; max(45, 25) = 45
      expect(getWarmUpWeight(exercise, warmUpSet)).toBe(45);
    });
  });

  describe("WarmUpType.Percentage — Other (minimum is minimumWeightIncrement)", () => {
    it("calculates percentage of the working weight", () => {
      const exercise = makeExercise({
        weight: 100,
        type: ExerciseType.Other,
        minimumWeightIncrement: 2.5,
      });
      const warmUpSet = {
        id: "w1",
        type: WarmUpType.Percentage,
        reps: 5,
        value: 50,
      };
      // round(100 * 0.50, 2.5) = 50; max(2.5, 50) = 50
      expect(getWarmUpWeight(exercise, warmUpSet)).toBe(50);
    });

    it("clamps to minimumWeightIncrement when the calculated value is too low", () => {
      const exercise = makeExercise({
        weight: 10,
        type: ExerciseType.Other,
        minimumWeightIncrement: 10,
      });
      const warmUpSet = {
        id: "w1",
        type: WarmUpType.Percentage,
        reps: 5,
        value: 10,
      };
      // round(10 * 0.10, 10) = round(1, 10) = 0; max(10, 0) = 10
      expect(getWarmUpWeight(exercise, warmUpSet)).toBe(10);
    });
  });
});

// ---------------------------------------------------------------------------
// getVolumeLoad
// ---------------------------------------------------------------------------

describe("getVolumeLoad", () => {
  it("formats sets × reps × weight as a string", () => {
    expect(getVolumeLoad({ sets: 3, reps: 5, weight: 135 })).toBe("3x5x135");
  });

  it("works with fractional weight values", () => {
    expect(getVolumeLoad({ sets: 4, reps: 8, weight: 112.5 })).toBe(
      "4x8x112.5",
    );
  });
});

// ---------------------------------------------------------------------------
// moveExercise
// ---------------------------------------------------------------------------

describe("moveExercise", () => {
  // Build a two-day workout with two exercises per day for most tests.
  //   Day A: [ex1, ex2]
  //   Day B: [ex3, ex4]
  const ex1 = makeExercise({ id: "ex1" });
  const ex2 = makeExercise({ id: "ex2" });
  const ex3 = makeExercise({ id: "ex3" });
  const ex4 = makeExercise({ id: "ex4" });
  const dayA = makeDay({ id: "dayA", exercises: [ex1, ex2] });
  const dayB = makeDay({ id: "dayB", exercises: [ex3, ex4] });
  const workout = makeWorkout({ days: [dayA, dayB] });

  describe("guard conditions — returns the original workout reference", () => {
    it("returns the workout unchanged when the day id is not found", () => {
      expect(moveExercise(workout, "missing", "ex1", Direction.Up)).toBe(
        workout,
      );
    });

    it("returns the workout unchanged when the exercise id is not found in the day", () => {
      expect(moveExercise(workout, "dayA", "missing", Direction.Up)).toBe(
        workout,
      );
    });

    it("cannot move the very first exercise further up", () => {
      expect(moveExercise(workout, "dayA", "ex1", Direction.Up)).toBe(workout);
    });

    it("cannot move the very last exercise further down", () => {
      expect(moveExercise(workout, "dayB", "ex4", Direction.Down)).toBe(
        workout,
      );
    });
  });

  describe("moving within the same day", () => {
    it("moves an exercise up within its day", () => {
      // ex2 (index 1) → Up → swaps with ex1 (index 0)
      const result = moveExercise(workout, "dayA", "ex2", Direction.Up);
      expect(result.days[0].exercises.map((e) => e.id)).toEqual(["ex2", "ex1"]);
      // other day is unchanged
      expect(result.days[1].exercises.map((e) => e.id)).toEqual(["ex3", "ex4"]);
    });

    it("moves an exercise down within its day", () => {
      // ex1 (index 0) → Down → swaps with ex2 (index 1)
      const result = moveExercise(workout, "dayA", "ex1", Direction.Down);
      expect(result.days[0].exercises.map((e) => e.id)).toEqual(["ex2", "ex1"]);
    });

    it("returns a new workout reference on a valid move", () => {
      const result = moveExercise(workout, "dayA", "ex2", Direction.Up);
      expect(result).not.toBe(workout);
    });
  });

  describe("moving across days", () => {
    it("moves the first exercise of a day up to the end of the previous day", () => {
      // ex3 is first in dayB (index 0) → Up → appended to dayA
      const result = moveExercise(workout, "dayB", "ex3", Direction.Up);
      expect(result.days[0].exercises.map((e) => e.id)).toEqual([
        "ex1",
        "ex2",
        "ex3",
      ]);
      expect(result.days[1].exercises.map((e) => e.id)).toEqual(["ex4"]);
    });

    it("moves the last exercise of a day down to the front of the next day", () => {
      // ex2 is last in dayA (index 1) → Down → prepended to dayB
      const result = moveExercise(workout, "dayA", "ex2", Direction.Down);
      expect(result.days[0].exercises.map((e) => e.id)).toEqual(["ex1"]);
      expect(result.days[1].exercises.map((e) => e.id)).toEqual([
        "ex2",
        "ex3",
        "ex4",
      ]);
    });
  });
});
