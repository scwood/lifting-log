import { describe, expect, it } from "vitest";

import { makeDay, makeExercise, makeWorkout } from "../test-utils/factories";
import { ExerciseType } from "../types/ExerciseType";
import { WarmUpType } from "../types/WarmUpType";
import {
  selectCompletedDayExercises,
  selectDayExercises,
  selectDayHasCompletedExercises,
  selectDayIsComplete,
  selectExerciseIsComplete,
  selectExerciseUsesPlates,
  selectIncompleteDayExercises,
  selectIncompleteWorkoutDays,
  selectWarmUpSetWeight,
  selectWorkoutDays,
  selectWorkoutDaysWithCompletedExercises,
  selectWorkoutHasNoDays,
  selectWorkoutHasNoExercises,
  selectWorkoutIsComplete,
} from "./workoutSelectors";

describe("selectWorkoutDays", () => {
  it("returns workout days", () => {
    const day = makeDay({ id: "day1" });
    const workout = makeWorkout({ days: [day] });

    expect(selectWorkoutDays(workout)).toEqual([day]);
  });
});

describe("selectDayExercises", () => {
  it("returns day exercises", () => {
    const exercise = makeExercise({ id: "ex1" });
    const day = makeDay({ exercises: [exercise] });

    expect(selectDayExercises(day)).toEqual([exercise]);
  });
});

describe("selectExerciseIsComplete", () => {
  it("returns true when all working sets are logged", () => {
    const exercise = makeExercise({
      sets: 1,
      workingSets: { 0: { isLogged: true, reps: 5 } },
    });

    expect(selectExerciseIsComplete(exercise)).toBe(true);
  });

  it("returns false when not all working sets are logged", () => {
    const exercise = makeExercise({
      sets: 2,
      workingSets: { 0: { isLogged: true, reps: 5 } },
    });

    expect(selectExerciseIsComplete(exercise)).toBe(false);
  });
});

describe("selectDayHasCompletedExercises", () => {
  it("returns true when at least one exercise is complete", () => {
    const day = makeDay({
      exercises: [
        makeExercise({
          id: "ex1",
          sets: 1,
          workingSets: { 0: { isLogged: true, reps: 5 } },
        }),
        makeExercise({ id: "ex2", sets: 1, workingSets: {} }),
      ],
    });

    expect(selectDayHasCompletedExercises(day)).toBe(true);
  });

  it("returns false when no exercise is complete", () => {
    const day = makeDay({
      exercises: [makeExercise({ id: "ex1", sets: 1, workingSets: {} })],
    });

    expect(selectDayHasCompletedExercises(day)).toBe(false);
  });
});

describe("selectDayIsComplete", () => {
  it("returns true when every exercise is complete", () => {
    const day = makeDay({
      exercises: [
        makeExercise({
          id: "ex1",
          sets: 1,
          workingSets: { 0: { isLogged: true, reps: 5 } },
        }),
      ],
    });

    expect(selectDayIsComplete(day)).toBe(true);
  });

  it("returns false when any exercise is incomplete", () => {
    const day = makeDay({
      exercises: [makeExercise({ id: "ex1", sets: 1, workingSets: {} })],
    });

    expect(selectDayIsComplete(day)).toBe(false);
  });
});

describe("selectWorkoutIsComplete", () => {
  it("returns true when every day is complete", () => {
    const completeDay = makeDay({
      exercises: [
        makeExercise({
          sets: 1,
          workingSets: { 0: { isLogged: true, reps: 5 } },
        }),
      ],
    });
    const workout = makeWorkout({ days: [completeDay] });

    expect(selectWorkoutIsComplete(workout)).toBe(true);
  });

  it("returns false when any day is incomplete", () => {
    const incompleteDay = makeDay({
      exercises: [makeExercise({ sets: 1, workingSets: {} })],
    });
    const workout = makeWorkout({ days: [incompleteDay] });

    expect(selectWorkoutIsComplete(workout)).toBe(false);
  });
});

describe("selectWorkoutHasNoDays", () => {
  it("returns true when workout has no days", () => {
    expect(selectWorkoutHasNoDays(makeWorkout({ days: [] }))).toBe(true);
  });

  it("returns false when workout has days", () => {
    expect(selectWorkoutHasNoDays(makeWorkout({ days: [makeDay()] }))).toBe(
      false,
    );
  });
});

describe("selectWorkoutHasNoExercises", () => {
  it("returns true when all days have no exercises", () => {
    const workout = makeWorkout({
      days: [makeDay({ exercises: [] }), makeDay({ exercises: [] })],
    });

    expect(selectWorkoutHasNoExercises(workout)).toBe(true);
  });

  it("returns false when any day has an exercise", () => {
    const workout = makeWorkout({
      days: [makeDay({ exercises: [makeExercise()] })],
    });

    expect(selectWorkoutHasNoExercises(workout)).toBe(false);
  });
});

describe("selectIncompleteDayExercises", () => {
  it("returns only incomplete exercises", () => {
    const completeExercise = makeExercise({
      id: "complete",
      sets: 1,
      workingSets: { 0: { isLogged: true, reps: 5 } },
    });
    const incompleteExercise = makeExercise({
      id: "incomplete",
      sets: 2,
      workingSets: { 0: { isLogged: true, reps: 5 } },
    });
    const day = makeDay({ exercises: [completeExercise, incompleteExercise] });

    expect(selectIncompleteDayExercises(day)).toEqual([incompleteExercise]);
  });
});

describe("selectCompletedDayExercises", () => {
  it("returns only completed exercises", () => {
    const completeExercise = makeExercise({
      id: "complete",
      sets: 1,
      workingSets: { 0: { isLogged: true, reps: 5 } },
    });
    const incompleteExercise = makeExercise({
      id: "incomplete",
      sets: 2,
      workingSets: { 0: { isLogged: true, reps: 5 } },
    });
    const day = makeDay({ exercises: [completeExercise, incompleteExercise] });

    expect(selectCompletedDayExercises(day)).toEqual([completeExercise]);
  });
});

describe("selectIncompleteWorkoutDays", () => {
  it("returns days with any incomplete exercises", () => {
    const mixedDay = makeDay({
      id: "day1",
      exercises: [
        makeExercise({
          id: "ex1",
          sets: 1,
          workingSets: { 0: { isLogged: true, reps: 5 } },
        }),
        makeExercise({
          id: "ex2",
          sets: 2,
          workingSets: { 0: { isLogged: true, reps: 5 } },
        }),
      ],
    });
    const untouchedDay = makeDay({
      id: "day2",
      exercises: [makeExercise({ id: "ex3", sets: 1, workingSets: {} })],
    });
    const workout = makeWorkout({ days: [mixedDay, untouchedDay] });

    expect(selectIncompleteWorkoutDays(workout)).toEqual([
      mixedDay,
      untouchedDay,
    ]);
  });
});

describe("selectWorkoutDaysWithCompletedExercises", () => {
  it("returns days with at least one completed exercise", () => {
    const mixedDay = makeDay({
      id: "day1",
      exercises: [
        makeExercise({
          id: "ex1",
          sets: 1,
          workingSets: { 0: { isLogged: true, reps: 5 } },
        }),
        makeExercise({ id: "ex2", sets: 1, workingSets: {} }),
      ],
    });
    const untouchedDay = makeDay({
      id: "day2",
      exercises: [makeExercise({ id: "ex3", sets: 1, workingSets: {} })],
    });
    const workout = makeWorkout({ days: [mixedDay, untouchedDay] });

    expect(selectWorkoutDaysWithCompletedExercises(workout)).toEqual([
      mixedDay,
    ]);
  });
});

describe("selectExerciseUsesPlates", () => {
  it("returns true for DoublePlate exercises", () => {
    expect(
      selectExerciseUsesPlates(
        makeExercise({ type: ExerciseType.DoublePlate }),
      ),
    ).toBe(true);
  });

  it("returns true for SinglePlate exercises", () => {
    expect(
      selectExerciseUsesPlates(
        makeExercise({ type: ExerciseType.SinglePlate }),
      ),
    ).toBe(true);
  });

  it("returns false for Other exercises", () => {
    expect(
      selectExerciseUsesPlates(makeExercise({ type: ExerciseType.Other })),
    ).toBe(false);
  });
});

describe("selectWarmUpSetWeight", () => {
  it("returns direct weight for warm-up type Weight", () => {
    const exercise = makeExercise({ weight: 200 });
    const warmUpSet = {
      id: "w1",
      type: WarmUpType.Weight,
      reps: 5,
      value: 30,
    };

    expect(selectWarmUpSetWeight(exercise, warmUpSet)).toBe(30);
  });

  it("calculates percentage-based warm-up for DoublePlate", () => {
    const exercise = makeExercise({
      weight: 200,
      type: ExerciseType.DoublePlate,
      minimumWeightIncrement: 5,
    });
    const warmUpSet = {
      id: "w2",
      type: WarmUpType.Percentage,
      reps: 5,
      value: 50,
    };

    expect(selectWarmUpSetWeight(exercise, warmUpSet)).toBe(100);
  });

  it("clamps DoublePlate warm-up to bar weight minimum", () => {
    const exercise = makeExercise({
      weight: 45,
      type: ExerciseType.DoublePlate,
      minimumWeightIncrement: 5,
    });
    const warmUpSet = {
      id: "w3",
      type: WarmUpType.Percentage,
      reps: 5,
      value: 50,
    };

    expect(selectWarmUpSetWeight(exercise, warmUpSet)).toBe(45);
  });

  it("clamps non-plate warm-up to minimumWeightIncrement", () => {
    const exercise = makeExercise({
      weight: 10,
      type: ExerciseType.Other,
      minimumWeightIncrement: 10,
    });
    const warmUpSet = {
      id: "w4",
      type: WarmUpType.Percentage,
      reps: 5,
      value: 10,
    };

    expect(selectWarmUpSetWeight(exercise, warmUpSet)).toBe(10);
  });
});
