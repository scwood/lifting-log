import { vi } from "vitest";

import { AuthContext } from "../contexts/authContext";
import { CurrentUserContext } from "../contexts/currentUserContext";
import { Day } from "../types/Day";
import { DayExercise } from "../types/DayExercise";
import { ExerciseDefinition } from "../types/ExerciseDefinition";
import { ExerciseType } from "../types/ExerciseType";
import { WarmUpSet } from "../types/WarmUpSet";
import { WarmUpType } from "../types/WarmUpType";
import { Workout } from "../types/Workout";

export function makeAuthContext(
  overrides: Partial<AuthContext> = {},
): AuthContext {
  return {
    userId: null,
    displayName: null,
    isLoading: false,
    error: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    ...overrides,
  };
}

export function makeCurrentUserContext(
  overrides: Partial<CurrentUserContext> = {},
): CurrentUserContext {
  return { userId: "u1", ...overrides };
}

export function makeDayExercise(
  overrides: Partial<DayExercise> = {},
): DayExercise {
  return {
    id: "ex1",
    exerciseDefinitionId: "def1",
    workingSets: {},
    definitionTrainingLoadBeforeCompletion: null,
    ...overrides,
  };
}

export function makeExerciseDefinition(
  overrides: Partial<ExerciseDefinition> = {},
): ExerciseDefinition {
  return {
    id: "def1",
    name: "Squat",
    type: ExerciseType.DoublePlate,
    minimumWeightIncrement: 5,
    warmUpSets: [],
    trainingLoad: {
      sets: 3,
      reps: 5,
      weight: 135,
    },
    ...overrides,
  };
}

export function makeWarmUpSet(overrides: Partial<WarmUpSet> = {}): WarmUpSet {
  return {
    id: "ws1",
    type: WarmUpType.Percentage,
    reps: 5,
    value: 60,
    ...overrides,
  };
}

export function makeDay(overrides: Partial<Day> = {}): Day {
  return {
    id: "day1",
    name: "Day 1",
    exercises: [],
    ...overrides,
  };
}

export function makeWorkout(overrides: Partial<Workout> = {}): Workout {
  return {
    schemaVersion: 2,
    id: "w1",
    userId: "u1",
    createdTimestamp: 0,
    completedTimestamp: null,
    notes: null,
    days: [],
    exerciseDefinitionsById: {},
    ...overrides,
  };
}
