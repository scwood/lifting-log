import { describe, expect, it } from "vitest";

import {
  makeDay,
  makeDayExercise,
  makeExerciseDefinition,
  makeWarmUpSet,
  makeWorkout,
} from "../test-utils/factories";
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
    const exercise = makeDayExercise({ id: "ex1" });
    const day = makeDay({ exercises: [exercise] });

    expect(selectDayExercises(day)).toEqual([exercise]);
  });
});

describe("selectExerciseIsComplete", () => {
  it("returns true when all working sets are logged", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });
    const exercise = makeDayExercise({
      exerciseDefinitionId: exerciseDefinition.id,
      workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: {
        [exerciseDefinition.id]: exerciseDefinition,
      },
    });

    expect(selectExerciseIsComplete(workout, exercise)).toBe(true);
  });

  it("returns false when not all working sets are logged", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 2, reps: 5, weight: 135 },
    });
    const exercise = makeDayExercise({
      exerciseDefinitionId: exerciseDefinition.id,
      workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: {
        [exerciseDefinition.id]: exerciseDefinition,
      },
    });

    expect(selectExerciseIsComplete(workout, exercise)).toBe(false);
  });
});

describe("selectDayHasCompletedExercises", () => {
  it("returns true when at least one exercise is complete", () => {
    const completeDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });
    const incompleteDefinition = makeExerciseDefinition({
      id: "def2",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });
    const day = makeDay({
      exercises: [
        makeDayExercise({
          id: "ex1",
          exerciseDefinitionId: completeDefinition.id,
          workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
        }),
        makeDayExercise({
          id: "ex2",
          exerciseDefinitionId: incompleteDefinition.id,
          workingSets: {},
        }),
      ],
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: {
        [completeDefinition.id]: completeDefinition,
        [incompleteDefinition.id]: incompleteDefinition,
      },
    });

    expect(selectDayHasCompletedExercises(workout, day)).toBe(true);
  });

  it("returns false when no exercise is complete", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });
    const day = makeDay({
      exercises: [
        makeDayExercise({
          id: "ex1",
          exerciseDefinitionId: exerciseDefinition.id,
          workingSets: {},
        }),
      ],
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: {
        [exerciseDefinition.id]: exerciseDefinition,
      },
    });

    expect(selectDayHasCompletedExercises(workout, day)).toBe(false);
  });
});

describe("selectDayIsComplete", () => {
  it("returns true when every exercise is complete", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });
    const day = makeDay({
      exercises: [
        makeDayExercise({
          id: "ex1",
          exerciseDefinitionId: exerciseDefinition.id,
          workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
        }),
      ],
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: {
        [exerciseDefinition.id]: exerciseDefinition,
      },
    });

    expect(selectDayIsComplete(workout, day)).toBe(true);
  });

  it("returns false when any exercise is incomplete", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });
    const day = makeDay({
      exercises: [
        makeDayExercise({
          id: "ex1",
          exerciseDefinitionId: exerciseDefinition.id,
          workingSets: {},
        }),
      ],
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: {
        [exerciseDefinition.id]: exerciseDefinition,
      },
    });

    expect(selectDayIsComplete(workout, day)).toBe(false);
  });
});

describe("selectWorkoutIsComplete", () => {
  it("returns true when every day is complete", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });
    const completeDay = makeDay({
      exercises: [
        makeDayExercise({
          exerciseDefinitionId: exerciseDefinition.id,
          workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
        }),
      ],
    });
    const workout = makeWorkout({
      days: [completeDay],
      exerciseDefinitionsById: { [exerciseDefinition.id]: exerciseDefinition },
    });

    expect(selectWorkoutIsComplete(workout)).toBe(true);
  });

  it("returns false when any day is incomplete", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });
    const incompleteDay = makeDay({
      exercises: [
        makeDayExercise({
          exerciseDefinitionId: exerciseDefinition.id,
          workingSets: {},
        }),
      ],
    });
    const workout = makeWorkout({
      days: [incompleteDay],
      exerciseDefinitionsById: { [exerciseDefinition.id]: exerciseDefinition },
    });

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
      days: [makeDay({ exercises: [makeDayExercise()] })],
    });

    expect(selectWorkoutHasNoExercises(workout)).toBe(false);
  });
});

describe("selectIncompleteDayExercises", () => {
  it("returns only incomplete exercises", () => {
    const completeDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });
    const incompleteDefinition = makeExerciseDefinition({
      id: "def2",
      trainingLoad: { sets: 2, reps: 5, weight: 135 },
    });
    const completeExercise = makeDayExercise({
      id: "complete",
      exerciseDefinitionId: completeDefinition.id,
      workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
    });
    const incompleteExercise = makeDayExercise({
      id: "incomplete",
      exerciseDefinitionId: incompleteDefinition.id,
      workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
    });
    const day = makeDay({ exercises: [completeExercise, incompleteExercise] });
    const workout = makeWorkout({
      exerciseDefinitionsById: {
        [completeDefinition.id]: completeDefinition,
        [incompleteDefinition.id]: incompleteDefinition,
      },
    });

    expect(selectIncompleteDayExercises(workout, day)).toEqual([
      incompleteExercise,
    ]);
  });
});

describe("selectCompletedDayExercises", () => {
  it("returns only completed exercises", () => {
    const completeDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });
    const incompleteDefinition = makeExerciseDefinition({
      id: "def2",
      trainingLoad: { sets: 2, reps: 5, weight: 135 },
    });
    const completeExercise = makeDayExercise({
      id: "complete",
      exerciseDefinitionId: completeDefinition.id,
      workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
    });
    const incompleteExercise = makeDayExercise({
      id: "incomplete",
      exerciseDefinitionId: incompleteDefinition.id,
      workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
    });
    const day = makeDay({ exercises: [completeExercise, incompleteExercise] });
    const workout = makeWorkout({
      exerciseDefinitionsById: {
        [completeDefinition.id]: completeDefinition,
        [incompleteDefinition.id]: incompleteDefinition,
      },
    });

    expect(selectCompletedDayExercises(workout, day)).toEqual([
      completeExercise,
    ]);
  });
});

describe("selectIncompleteWorkoutDays", () => {
  it("returns days with any incomplete exercises", () => {
    const completeDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });
    const incompleteDefinition = makeExerciseDefinition({
      id: "def2",
      trainingLoad: { sets: 2, reps: 5, weight: 135 },
    });
    const untouchedDefinition = makeExerciseDefinition({
      id: "def3",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });

    const mixedDay = makeDay({
      id: "day1",
      exercises: [
        makeDayExercise({
          id: "ex1",
          exerciseDefinitionId: completeDefinition.id,
          workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
        }),
        makeDayExercise({
          id: "ex2",
          exerciseDefinitionId: incompleteDefinition.id,
          workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
        }),
      ],
    });
    const untouchedDay = makeDay({
      id: "day2",
      exercises: [
        makeDayExercise({
          id: "ex3",
          exerciseDefinitionId: untouchedDefinition.id,
          workingSets: {},
        }),
      ],
    });
    const workout = makeWorkout({
      days: [mixedDay, untouchedDay],
      exerciseDefinitionsById: {
        [completeDefinition.id]: completeDefinition,
        [incompleteDefinition.id]: incompleteDefinition,
        [untouchedDefinition.id]: untouchedDefinition,
      },
    });

    expect(selectIncompleteWorkoutDays(workout)).toEqual([
      mixedDay,
      untouchedDay,
    ]);
  });
});

describe("selectWorkoutDaysWithCompletedExercises", () => {
  it("returns days with at least one completed exercise", () => {
    const completeDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });
    const incompleteDefinition = makeExerciseDefinition({
      id: "def2",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });
    const untouchedDefinition = makeExerciseDefinition({
      id: "def3",
      trainingLoad: { sets: 1, reps: 5, weight: 135 },
    });

    const mixedDay = makeDay({
      id: "day1",
      exercises: [
        makeDayExercise({
          id: "ex1",
          exerciseDefinitionId: completeDefinition.id,
          workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
        }),
        makeDayExercise({
          id: "ex2",
          exerciseDefinitionId: incompleteDefinition.id,
          workingSets: {},
        }),
      ],
    });
    const untouchedDay = makeDay({
      id: "day2",
      exercises: [
        makeDayExercise({
          id: "ex3",
          exerciseDefinitionId: untouchedDefinition.id,
          workingSets: {},
        }),
      ],
    });
    const workout = makeWorkout({
      days: [mixedDay, untouchedDay],
      exerciseDefinitionsById: {
        [completeDefinition.id]: completeDefinition,
        [incompleteDefinition.id]: incompleteDefinition,
        [untouchedDefinition.id]: untouchedDefinition,
      },
    });

    expect(selectWorkoutDaysWithCompletedExercises(workout)).toEqual([
      mixedDay,
    ]);
  });
});

describe("selectExerciseUsesPlates", () => {
  it("returns true for DoublePlate exercises", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      type: ExerciseType.DoublePlate,
    });
    const exercise = makeDayExercise({
      exerciseDefinitionId: exerciseDefinition.id,
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: { [exerciseDefinition.id]: exerciseDefinition },
    });

    expect(selectExerciseUsesPlates(workout, exercise)).toBe(true);
  });

  it("returns true for SinglePlate exercises", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      type: ExerciseType.SinglePlate,
    });
    const exercise = makeDayExercise({
      exerciseDefinitionId: exerciseDefinition.id,
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: { [exerciseDefinition.id]: exerciseDefinition },
    });

    expect(selectExerciseUsesPlates(workout, exercise)).toBe(true);
  });

  it("returns false for Other exercises", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      type: ExerciseType.Other,
    });
    const exercise = makeDayExercise({
      exerciseDefinitionId: exerciseDefinition.id,
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: { [exerciseDefinition.id]: exerciseDefinition },
    });

    expect(selectExerciseUsesPlates(workout, exercise)).toBe(false);
  });
});

describe("selectWarmUpSetWeight", () => {
  it("returns direct weight for warm-up type Weight", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 3, reps: 5, weight: 200 },
    });
    const exercise = makeDayExercise({
      exerciseDefinitionId: exerciseDefinition.id,
    });
    const warmUpSet = makeWarmUpSet({
      id: "w1",
      type: WarmUpType.Weight,
      value: 30,
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: { [exerciseDefinition.id]: exerciseDefinition },
    });

    expect(selectWarmUpSetWeight(workout, exercise, warmUpSet)).toBe(30);
  });

  it("calculates percentage-based warm-up for DoublePlate", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      type: ExerciseType.DoublePlate,
      minimumWeightIncrement: 5,
      trainingLoad: { sets: 3, reps: 5, weight: 200 },
    });
    const exercise = makeDayExercise({
      exerciseDefinitionId: exerciseDefinition.id,
    });
    const warmUpSet = makeWarmUpSet({
      id: "w2",
      type: WarmUpType.Percentage,
      value: 50,
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: { [exerciseDefinition.id]: exerciseDefinition },
    });

    expect(selectWarmUpSetWeight(workout, exercise, warmUpSet)).toBe(100);
  });

  it("clamps DoublePlate warm-up to bar weight minimum", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      type: ExerciseType.DoublePlate,
      minimumWeightIncrement: 5,
      trainingLoad: { sets: 3, reps: 5, weight: 45 },
    });
    const exercise = makeDayExercise({
      exerciseDefinitionId: exerciseDefinition.id,
    });
    const warmUpSet = makeWarmUpSet({
      id: "w3",
      type: WarmUpType.Percentage,
      value: 50,
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: { [exerciseDefinition.id]: exerciseDefinition },
    });

    expect(selectWarmUpSetWeight(workout, exercise, warmUpSet)).toBe(45);
  });

  it("clamps non-plate warm-up to minimumWeightIncrement", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      type: ExerciseType.Other,
      minimumWeightIncrement: 10,
      trainingLoad: { sets: 3, reps: 5, weight: 10 },
    });
    const exercise = makeDayExercise({
      exerciseDefinitionId: exerciseDefinition.id,
    });
    const warmUpSet = makeWarmUpSet({
      id: "w4",
      type: WarmUpType.Percentage,
      value: 10,
    });
    const workout = makeWorkout({
      exerciseDefinitionsById: { [exerciseDefinition.id]: exerciseDefinition },
    });

    expect(selectWarmUpSetWeight(workout, exercise, warmUpSet)).toBe(10);
  });
});
