import { produce } from "immer";

import { Day } from "../types/Day";
import { Exercise } from "../types/Exercise";
import { NextSessionPlan } from "../types/NextSessionPlan";
import { WorkingSet } from "../types/WorkingSet";
import { Workout } from "../types/Workout";
import { Direction, moveItem } from "./arrayUtils";

export function upsertWorkoutDay(
  workout: Workout,
  day: Day,
  dayToReplaceId?: string,
): Pick<Workout, "days"> {
  if (!dayToReplaceId) {
    return { days: [...workout.days, day] };
  }

  return {
    days: workout.days.map((existingDay) => {
      return existingDay.id === dayToReplaceId ? day : existingDay;
    }),
  };
}

export function deleteWorkoutDay(
  workout: Workout,
  dayId: string,
): Pick<Workout, "days"> {
  return {
    days: workout.days.filter((day) => day.id !== dayId),
  };
}

export function reorderWorkoutDay(
  workout: Workout,
  dayIndex: number,
  direction: Direction,
): Pick<Workout, "days"> {
  return {
    days: moveItem(workout.days, dayIndex, direction),
  };
}

export function upsertWorkoutDayEntry(
  workout: Workout,
  dayId: string,
  exercise: Exercise,
  entryToReplaceId?: string,
): Pick<Workout, "days"> {
  return {
    days: workout.days.map((day) => {
      if (day.id !== dayId) {
        return day;
      }

      if (!entryToReplaceId) {
        return { ...day, exercises: [...day.exercises, exercise] };
      }

      return {
        ...day,
        exercises: day.exercises.map((existingExercise) => {
          return existingExercise.id === entryToReplaceId
            ? exercise
            : existingExercise;
        }),
      };
    }),
  };
}

export function deleteWorkoutDayEntry(
  workout: Workout,
  dayId: string,
  entryId: string,
): Pick<Workout, "days"> {
  return {
    days: workout.days.map((day) => {
      if (day.id !== dayId) {
        return day;
      }
      return {
        ...day,
        exercises: day.exercises.filter((exercise) => exercise.id !== entryId),
      };
    }),
  };
}

export function reorderWorkoutDayEntry(
  workout: Workout,
  dayId: string,
  entryId: string,
  direction: Direction,
): Pick<Workout, "days"> {
  const originalDayIndex = workout.days.findIndex((day) => day.id === dayId);
  const originalDay = workout.days[originalDayIndex];

  if (!originalDay) {
    return { days: workout.days };
  }

  const originalEntryIndex = originalDay.exercises.findIndex(
    (exercise) => exercise.id === entryId,
  );
  const originalEntry = originalDay.exercises[originalEntryIndex];

  if (!originalEntry) {
    return { days: workout.days };
  }

  const cannotMoveUpFromTop =
    direction === Direction.Up &&
    originalDayIndex === 0 &&
    originalEntryIndex === 0;
  const cannotMoveDownFromBottom =
    direction === Direction.Down &&
    originalDayIndex === workout.days.length - 1 &&
    originalEntryIndex === originalDay.exercises.length - 1;
  if (cannotMoveUpFromTop || cannotMoveDownFromBottom) {
    return { days: workout.days };
  }

  const isCrossDayMove =
    (direction === Direction.Up && originalEntryIndex === 0) ||
    (direction === Direction.Down &&
      originalEntryIndex === originalDay.exercises.length - 1);

  const days = produce(workout.days, (draftDays) => {
    if (!isCrossDayMove) {
      draftDays[originalDayIndex].exercises = moveItem(
        draftDays[originalDayIndex].exercises,
        originalEntryIndex,
        direction,
      );
      return;
    }

    const [entry] = draftDays[originalDayIndex].exercises.splice(
      originalEntryIndex,
      1,
    );
    if (!entry) {
      return;
    }

    if (direction === Direction.Up) {
      draftDays[originalDayIndex - 1].exercises.push(entry);
      return;
    }

    draftDays[originalDayIndex + 1].exercises.unshift(entry);
  });

  return {
    days,
  };
}

export function setWorkoutDayEntryWorkingSet(
  workout: Workout,
  dayId: string,
  entryId: string,
  setNumber: number,
  workingSet: WorkingSet,
): Pick<Workout, "days"> {
  return updateWorkoutDayEntry(workout, dayId, entryId, (exercise) => {
    return {
      ...exercise,
      workingSets: {
        ...exercise.workingSets,
        [setNumber]: workingSet,
      },
    };
  });
}

export function completeWorkoutDayEntry(
  workout: Workout,
  options: {
    dayId: string;
    entryId: string;
    setNumber: number;
    workingSet: WorkingSet;
    nextSession: NextSessionPlan;
  },
): Pick<Workout, "days"> {
  const { dayId, entryId, setNumber, workingSet, nextSession } = options;

  return updateWorkoutDayEntry(workout, dayId, entryId, (exercise) => {
    return {
      ...exercise,
      workingSets: {
        ...exercise.workingSets,
        [setNumber]: workingSet,
      },
      nextSession,
    };
  });
}

export function skipWorkoutDayEntry(
  workout: Workout,
  dayId: string,
  entryId: string,
): Pick<Workout, "days"> {
  return updateWorkoutDayEntry(workout, dayId, entryId, (exercise) => {
    const workingSets: Exercise["workingSets"] = {};
    for (let i = 0; i < exercise.sets; i++) {
      workingSets[i] = { isLogged: true, reps: 0 };
    }

    return {
      ...exercise,
      workingSets,
      nextSession: {
        weight: exercise.weight,
        reps: exercise.reps,
        sets: exercise.sets,
      },
    };
  });
}

export function undoWorkoutDayEntry(
  workout: Workout,
  dayId: string,
  entryId: string,
): Pick<Workout, "days"> {
  return updateWorkoutDayEntry(workout, dayId, entryId, (exercise) => {
    const workingSets = { ...exercise.workingSets };
    const finalSetIndex = exercise.sets - 1;
    const finalSet = workingSets[finalSetIndex];

    if (!finalSet) {
      return exercise;
    }

    return {
      ...exercise,
      workingSets: {
        ...workingSets,
        [finalSetIndex]: { ...finalSet, isLogged: false },
      },
    };
  });
}

export function buildUndoWorkoutUpdates(
  workout: Workout,
  dayId: string,
  entryId: string,
): Pick<Workout, "completedTimestamp" | "days"> {
  return {
    completedTimestamp: null,
    ...undoWorkoutDayEntry(workout, dayId, entryId),
  };
}

export function buildNextWorkoutDays(workout: Workout): Day[] {
  return workout.days.map((day) => {
    return {
      ...day,
      exercises: day.exercises.map((exercise) => {
        return {
          ...exercise,
          ...exercise.nextSession,
          workingSets: {},
          nextSession: {},
        };
      }),
    };
  });
}

export function sanitizeWorkoutNotes(
  notes: string,
): Pick<Workout, "notes">["notes"] {
  const trimmedNotes = notes.trim();
  return trimmedNotes.length > 0 ? trimmedNotes : null;
}

function updateWorkoutDayEntry(
  workout: Workout,
  dayId: string,
  entryId: string,
  mutateExercise: (exercise: Exercise) => Exercise,
): Pick<Workout, "days"> {
  return {
    days: workout.days.map((day) => {
      if (day.id !== dayId) {
        return day;
      }

      return {
        ...day,
        exercises: day.exercises.map((exercise) => {
          return exercise.id === entryId ? mutateExercise(exercise) : exercise;
        }),
      };
    }),
  };
}
