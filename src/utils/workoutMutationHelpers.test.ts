import { describe, expect, it } from "vitest";

import { makeDay, makeExercise, makeWorkout } from "../test-utils/factories";
import { Direction } from "./arrayUtils";
import {
  completeWorkoutDayEntry,
  deleteWorkoutDay,
  deleteWorkoutDayEntry,
  deriveNextWorkoutDays,
  reorderWorkoutDay,
  reorderWorkoutDayEntry,
  sanitizeWorkoutNotes,
  setWorkoutDayEntryWorkingSet,
  skipWorkoutDayEntry,
  undoWorkoutDayEntry,
  undoWorkoutDayEntryCompletion,
  upsertWorkoutDay,
  upsertWorkoutDayEntry,
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

describe("upsertWorkoutDayEntry", () => {
  it("adds an entry when entryToReplaceId is not provided", () => {
    const day = makeDay({
      id: "day1",
      exercises: [makeExercise({ id: "ex1", name: "Squat" })],
    });
    const workout = makeWorkout({ days: [day] });

    const updates = upsertWorkoutDayEntry(
      workout,
      "day1",
      makeExercise({ id: "ex2", name: "Bench" }),
    );

    expect(updates.days[0].exercises.map((exercise) => exercise.id)).toEqual([
      "ex1",
      "ex2",
    ]);
  });

  it("replaces an existing entry when entryToReplaceId is provided", () => {
    const day = makeDay({
      id: "day1",
      exercises: [makeExercise({ id: "ex1", name: "Squat" })],
    });
    const workout = makeWorkout({ days: [day] });

    const updates = upsertWorkoutDayEntry(
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

describe("deleteWorkoutDayEntry", () => {
  it("deletes an entry from the requested day", () => {
    const day = makeDay({
      id: "day1",
      exercises: [makeExercise({ id: "ex1" }), makeExercise({ id: "ex2" })],
    });
    const workout = makeWorkout({ days: [day] });

    const updates = deleteWorkoutDayEntry(workout, "day1", "ex1");

    expect(updates.days[0].exercises.map((exercise) => exercise.id)).toEqual([
      "ex2",
    ]);
  });
});

describe("reorderWorkoutDayEntry", () => {
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
    const updates = reorderWorkoutDayEntry(
      workout,
      "missing",
      "ex1",
      Direction.Up,
    );
    expect(updates.days).toBe(workout.days);
  });

  it("returns original days when entry id is not found", () => {
    const updates = reorderWorkoutDayEntry(
      workout,
      "dayA",
      "missing",
      Direction.Up,
    );
    expect(updates.days).toBe(workout.days);
  });

  it("returns original days when moving top-most entry up", () => {
    const updates = reorderWorkoutDayEntry(
      workout,
      "dayA",
      "ex1",
      Direction.Up,
    );
    expect(updates.days).toBe(workout.days);
  });

  it("returns original days when moving bottom-most entry down", () => {
    const updates = reorderWorkoutDayEntry(
      workout,
      "dayB",
      "ex4",
      Direction.Down,
    );
    expect(updates.days).toBe(workout.days);
  });

  it("moves an entry up within the same day", () => {
    const updates = reorderWorkoutDayEntry(
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

  it("moves an entry down within the same day", () => {
    const updates = reorderWorkoutDayEntry(
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

  it("moves the first entry of a day up to the previous day", () => {
    const updates = reorderWorkoutDayEntry(
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

  it("moves the last entry of a day down to the next day", () => {
    const updates = reorderWorkoutDayEntry(
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

describe("setWorkoutDayEntryWorkingSet", () => {
  it("sets a specific working set on an entry", () => {
    const exercise = makeExercise({ id: "ex1", workingSets: {} });
    const workout = makeWorkout({
      days: [makeDay({ id: "day1", exercises: [exercise] })],
    });

    const updates = setWorkoutDayEntryWorkingSet(workout, "day1", "ex1", 0, {
      isLogged: true,
      reps: 5,
      weight: 140,
    });

    expect(updates.days[0].exercises[0].workingSets).toEqual({
      0: { isLogged: true, reps: 5, weight: 140 },
    });
  });
});

describe("completeWorkoutDayEntry", () => {
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

    const updates = completeWorkoutDayEntry(workout, {
      dayId: "day1",
      entryId: "ex1",
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

describe("skipWorkoutDayEntry", () => {
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

    const updates = skipWorkoutDayEntry(workout, "day1", "ex1");

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

describe("undoWorkoutDayEntry", () => {
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

    const updates = undoWorkoutDayEntry(workout, "day1", "ex1");

    expect(updates.days[0].exercises[0].workingSets).toEqual({
      0: { isLogged: true, reps: 5, weight: 135 },
      1: { isLogged: false, reps: 5, weight: 135 },
    });
  });
});

describe("undoWorkoutDayEntryCompletion", () => {
  it("includes completedTimestamp reset and undo entry changes", () => {
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

    const updates = undoWorkoutDayEntryCompletion(workout, "day1", "ex1");

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
