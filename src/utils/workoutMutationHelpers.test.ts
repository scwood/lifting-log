import { describe, expect, it } from "vitest";

import {
  makeDay,
  makeDayExercise,
  makeExerciseDefinition,
  makeWorkout,
} from "../test-utils/factories";
import { Direction } from "./arrayUtils";
import {
  completeWorkout,
  completeWorkoutDayExercise,
  deleteWorkoutDay,
  deleteWorkoutDayExercise,
  deleteWorkoutExerciseDefinition,
  deriveNextWorkout,
  deriveNextWorkoutDays,
  reorderWorkoutDay,
  reorderWorkoutDayExercise,
  setWorkoutDayExerciseWorkingSet,
  skipWorkoutDayExercise,
  undoWorkoutDayExercise,
  undoWorkoutDayExerciseCompletion,
  updateWorkoutNotes,
  upsertWorkoutDay,
  upsertWorkoutDayExercise,
  upsertWorkoutExerciseDefinition,
} from "./workoutMutationHelpers";

describe("upsertWorkoutDay", () => {
  it("adds a day when the id does not exist", () => {
    const day1 = makeDay({ id: "day1", name: "Day 1" });
    const workout = makeWorkout({ days: [day1] });

    const updates = upsertWorkoutDay(
      workout,
      makeDay({ id: "day2", name: "Day 2" }),
    );

    expect(updates.days.map((day) => day.id)).toEqual(["day1", "day2"]);
  });

  it("replaces an existing day when the id already exists", () => {
    const day1 = makeDay({ id: "day1", name: "Day 1" });
    const workout = makeWorkout({ days: [day1] });

    const updates = upsertWorkoutDay(
      workout,
      makeDay({ id: "day1", name: "Updated" }),
    );

    expect(updates.days[0].name).toBe("Updated");
  });
});

describe("deleteWorkoutDay", () => {
  it("removes the requested day", () => {
    const day1 = makeDay({ id: "day1" });
    const day2 = makeDay({ id: "day2" });
    const workout = makeWorkout({ days: [day1, day2] });

    expect(deleteWorkoutDay(workout, "day1").days).toEqual([day2]);
  });
});

describe("reorderWorkoutDay", () => {
  it("reorders days with moveItem", () => {
    const day1 = makeDay({ id: "day1" });
    const day2 = makeDay({ id: "day2" });
    const workout = makeWorkout({ days: [day1, day2] });

    expect(reorderWorkoutDay(workout, 1, Direction.Up).days).toEqual([
      day2,
      day1,
    ]);
  });
});

describe("upsertWorkoutDayExercise", () => {
  it("adds an exercise when the id does not exist", () => {
    const day = makeDay({
      id: "day1",
      exercises: [makeDayExercise({ id: "ex1", exerciseDefinitionId: "def1" })],
    });
    const workout = makeWorkout({ days: [day] });

    const updates = upsertWorkoutDayExercise(
      workout,
      "day1",
      makeDayExercise({ id: "ex2", exerciseDefinitionId: "def2" }),
    );

    expect(updates.days[0].exercises.map((exercise) => exercise.id)).toEqual([
      "ex1",
      "ex2",
    ]);
  });

  it("replaces an existing exercise when the id already exists", () => {
    const day = makeDay({
      id: "day1",
      exercises: [makeDayExercise({ id: "ex1", exerciseDefinitionId: "def1" })],
    });
    const workout = makeWorkout({ days: [day] });

    const updates = upsertWorkoutDayExercise(
      workout,
      "day1",
      makeDayExercise({ id: "ex1", exerciseDefinitionId: "def2" }),
    );

    expect(updates.days[0].exercises[0].exerciseDefinitionId).toBe("def2");
  });
});

describe("upsertWorkoutExerciseDefinition", () => {
  it("adds or replaces an exercise definition based on exercise id", () => {
    const workout = makeWorkout();
    const exerciseDefinition = makeExerciseDefinition({
      id: "ex1",
      name: "Squat",
      trainingLoad: { sets: 3, reps: 5, weight: 135 },
    });

    const updates = upsertWorkoutExerciseDefinition(
      workout,
      exerciseDefinition,
    );

    expect(updates.exerciseDefinitionsById.ex1).toEqual(exerciseDefinition);
  });
});

describe("deleteWorkoutDayExercise", () => {
  it("deletes an exercise from the requested day", () => {
    const day = makeDay({
      id: "day1",
      exercises: [
        makeDayExercise({ id: "ex1" }),
        makeDayExercise({ id: "ex2" }),
      ],
    });
    const workout = makeWorkout({ days: [day] });

    const updates = deleteWorkoutDayExercise(workout, "day1", "ex1");

    expect(updates.days[0].exercises.map((exercise) => exercise.id)).toEqual([
      "ex2",
    ]);
  });
});

describe("deleteWorkoutExerciseDefinition", () => {
  it("removes the definition and all linked day exercises across all days", () => {
    const def1 = makeExerciseDefinition({ id: "def1" });
    const def2 = makeExerciseDefinition({ id: "def2" });
    const workout = makeWorkout({
      exerciseDefinitionsById: { def1: def1, def2: def2 },
      days: [
        makeDay({
          id: "day1",
          exercises: [
            makeDayExercise({ id: "ex1", exerciseDefinitionId: "def1" }),
            makeDayExercise({ id: "ex2", exerciseDefinitionId: "def2" }),
          ],
        }),
        makeDay({
          id: "day2",
          exercises: [
            makeDayExercise({ id: "ex3", exerciseDefinitionId: "def1" }),
          ],
        }),
      ],
    });

    const updates = deleteWorkoutExerciseDefinition(workout, "def1");

    expect(updates.exerciseDefinitionsById).toEqual({ def2: def2 });
    expect(updates.days[0].exercises.map((e) => e.id)).toEqual(["ex2"]);
    expect(updates.days[1].exercises).toEqual([]);
  });

  it("leaves days unchanged when no exercises reference the definition", () => {
    const def1 = makeExerciseDefinition({ id: "def1" });
    const workout = makeWorkout({
      exerciseDefinitionsById: { def1: def1 },
      days: [makeDay({ id: "day1", exercises: [] })],
    });

    const updates = deleteWorkoutExerciseDefinition(workout, "def1");

    expect(updates.exerciseDefinitionsById).toEqual({});
    expect(updates.days[0].exercises).toEqual([]);
  });
});

describe("reorderWorkoutDayExercise", () => {
  const dayA = makeDay({
    id: "dayA",
    exercises: [makeDayExercise({ id: "ex1" }), makeDayExercise({ id: "ex2" })],
  });
  const dayB = makeDay({
    id: "dayB",
    exercises: [makeDayExercise({ id: "ex3" }), makeDayExercise({ id: "ex4" })],
  });
  const workout = makeWorkout({ days: [dayA, dayB] });

  it("returns original days when day id is not found", () => {
    const updates = reorderWorkoutDayExercise(
      workout,
      "missing",
      "ex1",
      Direction.Up,
    );
    expect(updates.days).toBe(workout.days);
  });

  it("returns original days when exercise id is not found", () => {
    const updates = reorderWorkoutDayExercise(
      workout,
      "dayA",
      "missing",
      Direction.Up,
    );
    expect(updates.days).toBe(workout.days);
  });

  it("returns original days when moving top-most exercise up", () => {
    const updates = reorderWorkoutDayExercise(
      workout,
      "dayA",
      "ex1",
      Direction.Up,
    );
    expect(updates.days).toBe(workout.days);
  });

  it("returns original days when moving bottom-most exercise down", () => {
    const updates = reorderWorkoutDayExercise(
      workout,
      "dayB",
      "ex4",
      Direction.Down,
    );
    expect(updates.days).toBe(workout.days);
  });

  it("moves an exercise up within the same day", () => {
    const updates = reorderWorkoutDayExercise(
      workout,
      "dayA",
      "ex2",
      Direction.Up,
    );

    expect(updates.days[0].exercises.map((exercise) => exercise.id)).toEqual([
      "ex2",
      "ex1",
    ]);
  });

  it("moves an exercise down within the same day", () => {
    const updates = reorderWorkoutDayExercise(
      workout,
      "dayA",
      "ex1",
      Direction.Down,
    );

    expect(updates.days[0].exercises.map((exercise) => exercise.id)).toEqual([
      "ex2",
      "ex1",
    ]);
  });

  it("moves the first exercise of a day up to the previous day", () => {
    const updates = reorderWorkoutDayExercise(
      workout,
      "dayB",
      "ex3",
      Direction.Up,
    );

    expect(updates.days[0].exercises.map((exercise) => exercise.id)).toEqual([
      "ex1",
      "ex2",
      "ex3",
    ]);
    expect(updates.days[1].exercises.map((exercise) => exercise.id)).toEqual([
      "ex4",
    ]);
  });

  it("moves the last exercise of a day down to the next day", () => {
    const updates = reorderWorkoutDayExercise(
      workout,
      "dayA",
      "ex2",
      Direction.Down,
    );

    expect(updates.days[0].exercises.map((exercise) => exercise.id)).toEqual([
      "ex1",
    ]);
    expect(updates.days[1].exercises.map((exercise) => exercise.id)).toEqual([
      "ex2",
      "ex3",
      "ex4",
    ]);
  });
});

describe("setWorkoutDayExerciseWorkingSet", () => {
  it("sets a specific working set on an exercise", () => {
    const exercise = makeDayExercise({ id: "ex1", workingSets: {} });
    const workout = makeWorkout({
      days: [makeDay({ id: "day1", exercises: [exercise] })],
    });

    const updates = setWorkoutDayExerciseWorkingSet(workout, "day1", "ex1", 0, {
      isLogged: true,
      reps: 5,
      weight: 140,
    });

    expect(updates.days[0].exercises[0].workingSets).toEqual({
      0: { isLogged: true, reps: 5, weight: 140 },
    });
  });
});

describe("completeWorkoutDayExercise", () => {
  it("stores the final working set and definition training load snapshot", () => {
    const targetExercise = makeDayExercise({
      id: "ex1",
      workingSets: {
        0: { isLogged: true, reps: 5, weight: 130 },
      },
    });
    const untouchedExercise = makeDayExercise({
      id: "ex2",
      workingSets: {
        0: { isLogged: false, reps: 5, weight: 95 },
      },
    });
    const workout = makeWorkout({
      days: [
        makeDay({ id: "day1", exercises: [targetExercise, untouchedExercise] }),
      ],
    });
    const finalWorkingSet = { isLogged: true, reps: 6, weight: 140 };
    const definitionTrainingLoadBeforeCompletion = {
      sets: 3,
      reps: 5,
      weight: 135,
    };

    const updates = completeWorkoutDayExercise(
      workout,
      "day1",
      "ex1",
      1,
      finalWorkingSet,
      definitionTrainingLoadBeforeCompletion,
    );

    expect(updates.days[0].exercises[0]).toEqual({
      ...targetExercise,
      definitionTrainingLoadBeforeCompletion,
      workingSets: {
        ...targetExercise.workingSets,
        1: finalWorkingSet,
      },
    });
    expect(updates.days[0].exercises[1]).toEqual(untouchedExercise);
    expect(workout.days[0].exercises[0].workingSets[1]).toBeUndefined();
    expect(
      workout.days[0].exercises[0].definitionTrainingLoadBeforeCompletion,
    ).toBeNull();
  });
});

describe("skipWorkoutDayExercise", () => {
  it("logs all sets as skipped and snapshots the definition training load", () => {
    const exerciseDefinition = makeExerciseDefinition({
      id: "def1",
      trainingLoad: { sets: 2, reps: 5, weight: 135 },
    });
    const exercise = makeDayExercise({
      id: "ex1",
      exerciseDefinitionId: exerciseDefinition.id,
      workingSets: {},
    });
    const workout = makeWorkout({
      days: [makeDay({ id: "day1", exercises: [exercise] })],
      exerciseDefinitionsById: { [exerciseDefinition.id]: exerciseDefinition },
    });

    const updates = skipWorkoutDayExercise(workout, "day1", "ex1");

    expect(updates.days[0].exercises[0].workingSets).toEqual({
      0: { isLogged: true, reps: 0, weight: 135 },
      1: { isLogged: true, reps: 0, weight: 135 },
    });
    expect(
      updates.days[0].exercises[0].definitionTrainingLoadBeforeCompletion,
    ).toEqual({
      sets: 2,
      reps: 5,
      weight: 135,
    });
  });
});

describe("undoWorkoutDayExercise", () => {
  it("unlogs the final working set", () => {
    const completedExercise = makeDayExercise({
      id: "ex1",
      workingSets: {
        0: { isLogged: true, reps: 5, weight: 135 },
        1: { isLogged: true, reps: 5, weight: 135 },
      },
    });
    const workout = makeWorkout({
      days: [makeDay({ id: "day1", exercises: [completedExercise] })],
    });

    const updates = undoWorkoutDayExercise(workout, "day1", "ex1");

    expect(updates.days[0].exercises[0].workingSets).toEqual({
      0: { isLogged: true, reps: 5, weight: 135 },
      1: { isLogged: false, reps: 5, weight: 135 },
    });
  });
});

describe("undoWorkoutDayExerciseCompletion", () => {
  it("includes completedTimestamp reset and undo exercise changes", () => {
    const completedExercise = makeDayExercise({
      id: "ex1",
      workingSets: {
        0: { isLogged: true, reps: 5, weight: 135 },
        1: { isLogged: true, reps: 5, weight: 135 },
      },
    });
    const workout = makeWorkout({
      days: [makeDay({ id: "day1", exercises: [completedExercise] })],
    });

    const updates = undoWorkoutDayExerciseCompletion(workout, "day1", "ex1");

    expect(updates.completedTimestamp).toBeNull();
    expect(updates.days[0].exercises[0].workingSets).toEqual({
      0: { isLogged: true, reps: 5, weight: 135 },
      1: { isLogged: false, reps: 5, weight: 135 },
    });
  });
});

describe("deriveNextWorkoutDays", () => {
  it("resets runtime fields", () => {
    const exercise = makeDayExercise({
      id: "ex1",
      exerciseDefinitionId: "def1",
      workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
      definitionTrainingLoadBeforeCompletion: {
        sets: 3,
        reps: 5,
        weight: 135,
      },
    });
    const workout = makeWorkout({
      days: [makeDay({ id: "day1", exercises: [exercise] })],
    });

    expect(deriveNextWorkoutDays(workout)).toEqual([
      makeDay({
        id: "day1",
        exercises: [
          makeDayExercise({
            id: "ex1",
            exerciseDefinitionId: "def1",
            workingSets: {},
            definitionTrainingLoadBeforeCompletion: null,
          }),
        ],
      }),
    ]);
  });
});

describe("completeWorkout", () => {
  it("returns a completedTimestamp", () => {
    const before = Date.now();
    const result = completeWorkout();
    const after = Date.now();

    expect(result.completedTimestamp).toBeGreaterThanOrEqual(before);
    expect(result.completedTimestamp).toBeLessThanOrEqual(after);
  });
});

describe("deriveNextWorkout", () => {
  it("returns exerciseDefinitionsById and reset days", () => {
    const exercise = makeDayExercise({
      id: "ex1",
      exerciseDefinitionId: "def1",
      workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
      definitionTrainingLoadBeforeCompletion: {
        sets: 3,
        reps: 5,
        weight: 135,
      },
    });
    const exerciseDefinition = makeExerciseDefinition({ id: "def1" });
    const workout = makeWorkout({
      exerciseDefinitionsById: { def1: exerciseDefinition },
      days: [makeDay({ id: "day1", exercises: [exercise] })],
    });

    const result = deriveNextWorkout(workout);

    expect(result.exerciseDefinitionsById).toEqual({
      def1: exerciseDefinition,
    });
    expect(result.days).toEqual([
      makeDay({
        id: "day1",
        exercises: [
          makeDayExercise({
            id: "ex1",
            exerciseDefinitionId: "def1",
            workingSets: {},
            definitionTrainingLoadBeforeCompletion: null,
          }),
        ],
      }),
    ]);
  });
});

describe("updateWorkoutNotes", () => {
  it("returns trimmed notes when non-empty", () => {
    expect(updateWorkoutNotes("  felt good  ")).toEqual({
      notes: "felt good",
    });
  });

  it("returns null notes when whitespace only", () => {
    expect(updateWorkoutNotes("   ")).toEqual({ notes: null });
  });
});
