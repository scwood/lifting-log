import { describe, expect, it } from "vitest";

import { makeDay, makeExercise, makeWorkout } from "../test-utils/factories";
import { Direction } from "./arrayUtils";
import {
  completeWorkoutDayExercise,
  deleteWorkoutDay,
  deleteWorkoutDayExercise,
  deriveNextWorkoutDays,
  reorderWorkoutDay,
  reorderWorkoutDayExercise,
  sanitizeWorkoutNotes,
  setWorkoutDayExerciseWorkingSet,
  skipWorkoutDayExercise,
  undoWorkoutDayExercise,
  undoWorkoutDayExerciseCompletion,
  upsertWorkoutDay,
  upsertWorkoutDayExercise,
  upsertWorkoutExerciseDefinition,
} from "./workoutMutationHelpers";

describe("upsertWorkoutDay", () => {
  it("adds a day when no dayToReplaceId is provided", () => {
    const day1 = makeDay({ id: "day1", name: "Day 1" });
    const workout = makeWorkout({ days: [day1] });

    const updates = upsertWorkoutDay(
      workout,
      makeDay({ id: "day2", name: "Day 2" }),
    );

    expect(updates.days.map((day) => day.id)).toEqual(["day1", "day2"]);
  });

  it("replaces an existing day when dayToReplaceId is provided", () => {
    const day1 = makeDay({ id: "day1", name: "Day 1" });
    const workout = makeWorkout({ days: [day1] });

    const updates = upsertWorkoutDay(
      workout,
      makeDay({ id: "day1", name: "Updated" }),
      "day1",
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
  it("adds an exercise when exerciseToReplaceId is not provided", () => {
    const day = makeDay({
      id: "day1",
      exercises: [makeExercise({ id: "ex1", name: "Squat" })],
    });
    const workout = makeWorkout({ days: [day] });

    const updates = upsertWorkoutDayExercise(
      workout,
      "day1",
      makeExercise({ id: "ex2", name: "Bench" }),
    );

    expect(updates.days[0].exercises.map((exercise) => exercise.id)).toEqual([
      "ex1",
      "ex2",
    ]);
  });

  it("replaces an existing exercise when exerciseToReplaceId is provided", () => {
    const day = makeDay({
      id: "day1",
      exercises: [makeExercise({ id: "ex1", name: "Squat" })],
    });
    const workout = makeWorkout({ days: [day] });

    const updates = upsertWorkoutDayExercise(
      workout,
      "day1",
      makeExercise({ id: "ex1", name: "Front Squat" }),
      "ex1",
    );

    expect(updates.days[0].exercises[0].name).toBe("Front Squat");
  });
});

describe("upsertWorkoutExerciseDefinition", () => {
  it("adds or replaces an exercise definition based on exercise id", () => {
    const workout = makeWorkout();
    const exercise = makeExercise({
      id: "ex1",
      name: "Squat",
      sets: 3,
      reps: 5,
      weight: 135,
    });

    const updates = upsertWorkoutExerciseDefinition(workout, exercise);

    expect(updates.exerciseDefinitionsById.ex1).toEqual({
      id: "ex1",
      name: "Squat",
      type: exercise.type,
      minimumWeightIncrement: exercise.minimumWeightIncrement,
      warmUpSets: exercise.warmUpSets,
      trainingLoad: { sets: 3, reps: 5, weight: 135 },
    });
  });
});

describe("deleteWorkoutDayExercise", () => {
  it("deletes an exercise from the requested day", () => {
    const day = makeDay({
      id: "day1",
      exercises: [makeExercise({ id: "ex1" }), makeExercise({ id: "ex2" })],
    });
    const workout = makeWorkout({ days: [day] });

    const updates = deleteWorkoutDayExercise(workout, "day1", "ex1");

    expect(updates.days[0].exercises.map((exercise) => exercise.id)).toEqual([
      "ex2",
    ]);
  });
});

describe("reorderWorkoutDayExercise", () => {
  const dayA = makeDay({
    id: "dayA",
    exercises: [makeExercise({ id: "ex1" }), makeExercise({ id: "ex2" })],
  });
  const dayB = makeDay({
    id: "dayB",
    exercises: [makeExercise({ id: "ex3" }), makeExercise({ id: "ex4" })],
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
    const exercise = makeExercise({ id: "ex1", workingSets: {} });
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
  it("stores the final working set and next session plan", () => {
    const exercise = makeExercise({
      id: "ex1",
      sets: 2,
      reps: 5,
      weight: 135,
      workingSets: {},
    });
    const workout = makeWorkout({
      days: [makeDay({ id: "day1", exercises: [exercise] })],
    });

    const updates = completeWorkoutDayExercise(workout, {
      dayId: "day1",
      exerciseId: "ex1",
      setNumber: 1,
      workingSet: { isLogged: true, reps: 5, weight: 135 },
      nextSession: { reps: 6 },
    });

    expect(updates.days[0].exercises[0].workingSets).toEqual({
      1: { isLogged: true, reps: 5, weight: 135 },
    });
    expect(updates.days[0].exercises[0].nextSession).toEqual({
      reps: 6,
    });
  });
});

describe("skipWorkoutDayExercise", () => {
  it("logs all sets as skipped and copies current plan to nextSession", () => {
    const exercise = makeExercise({
      id: "ex1",
      sets: 2,
      reps: 5,
      weight: 135,
      workingSets: {},
    });
    const workout = makeWorkout({
      days: [makeDay({ id: "day1", exercises: [exercise] })],
    });

    const updates = skipWorkoutDayExercise(workout, "day1", "ex1");

    expect(updates.days[0].exercises[0].workingSets).toEqual({
      0: { isLogged: true, reps: 0, weight: 135 },
      1: { isLogged: true, reps: 0, weight: 135 },
    });
    expect(updates.days[0].exercises[0].nextSession).toEqual({
      weight: 135,
      reps: 5,
      sets: 2,
    });
  });
});

describe("undoWorkoutDayExercise", () => {
  it("unlogs the final working set", () => {
    const completedExercise = makeExercise({
      id: "ex1",
      sets: 2,
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
    const completedExercise = makeExercise({
      id: "ex1",
      sets: 2,
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
  it("applies nextSession and resets runtime fields", () => {
    const exercise = makeExercise({
      id: "ex1",
      reps: 5,
      weight: 135,
      workingSets: { 0: { isLogged: true, reps: 5, weight: 135 } },
      nextSession: { reps: 6, weight: 140 },
    });
    const workout = makeWorkout({
      days: [makeDay({ id: "day1", exercises: [exercise] })],
    });

    expect(deriveNextWorkoutDays(workout)).toEqual([
      makeDay({
        id: "day1",
        exercises: [
          makeExercise({
            id: "ex1",
            reps: 6,
            weight: 140,
            workingSets: {},
            nextSession: {},
          }),
        ],
      }),
    ]);
  });
});

describe("sanitizeWorkoutNotes", () => {
  it("returns trimmed notes when non-empty", () => {
    expect(sanitizeWorkoutNotes("  felt good  ")).toBe("felt good");
  });

  it("returns null when notes are whitespace only", () => {
    expect(sanitizeWorkoutNotes("   ")).toBeNull();
  });
});
