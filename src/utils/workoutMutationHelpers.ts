import { produce } from "immer";

import { Day } from "../types/Day";
import { DayExercise } from "../types/DayExercise";
import { ExerciseDefinition } from "../types/ExerciseDefinition";
import { WorkingSet } from "../types/WorkingSet";
import { Workout } from "../types/Workout";
import { Direction, moveItem } from "./arrayUtils";
import { selectExerciseDefinition } from "./workoutSelectors";

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

export function upsertWorkoutDayExercise(
  workout: Workout,
  dayId: string,
  exercise: DayExercise,
  exerciseToReplaceId?: string,
): Pick<Workout, "days"> {
  return {
    days: workout.days.map((day) => {
      if (day.id !== dayId) {
        return day;
      }

      if (!exerciseToReplaceId) {
        return { ...day, exercises: [...day.exercises, exercise] };
      }

      return {
        ...day,
        exercises: day.exercises.map((existingExercise) => {
          return existingExercise.id === exerciseToReplaceId
            ? exercise
            : existingExercise;
        }),
      };
    }),
  };
}

export function upsertWorkoutExerciseDefinition(
  workout: Workout,
  exerciseDefinition: ExerciseDefinition,
): Pick<Workout, "exerciseDefinitionsById"> {
  return {
    exerciseDefinitionsById: {
      ...workout.exerciseDefinitionsById,
      [exerciseDefinition.id]: exerciseDefinition,
    },
  };
}

export function deleteWorkoutDayExercise(
  workout: Workout,
  dayId: string,
  exerciseId: string,
): Pick<Workout, "days"> {
  return {
    days: workout.days.map((day) => {
      if (day.id !== dayId) {
        return day;
      }
      return {
        ...day,
        exercises: day.exercises.filter(
          (exercise) => exercise.id !== exerciseId,
        ),
      };
    }),
  };
}

export function reorderWorkoutDayExercise(
  workout: Workout,
  dayId: string,
  exerciseId: string,
  direction: Direction,
): Pick<Workout, "days"> {
  const originalDayIndex = workout.days.findIndex((day) => day.id === dayId);
  const originalDay = workout.days[originalDayIndex];

  if (!originalDay) {
    return { days: workout.days };
  }

  const originalExerciseIndex = originalDay.exercises.findIndex(
    (exercise) => exercise.id === exerciseId,
  );
  const originalExercise = originalDay.exercises[originalExerciseIndex];

  if (!originalExercise) {
    return { days: workout.days };
  }

  const cannotMoveUpFromTop =
    direction === Direction.Up &&
    originalDayIndex === 0 &&
    originalExerciseIndex === 0;
  const cannotMoveDownFromBottom =
    direction === Direction.Down &&
    originalDayIndex === workout.days.length - 1 &&
    originalExerciseIndex === originalDay.exercises.length - 1;
  if (cannotMoveUpFromTop || cannotMoveDownFromBottom) {
    return { days: workout.days };
  }

  const isCrossDayMove =
    (direction === Direction.Up && originalExerciseIndex === 0) ||
    (direction === Direction.Down &&
      originalExerciseIndex === originalDay.exercises.length - 1);

  const days = produce(workout.days, (draftDays) => {
    if (!isCrossDayMove) {
      draftDays[originalDayIndex].exercises = moveItem(
        draftDays[originalDayIndex].exercises,
        originalExerciseIndex,
        direction,
      );
      return;
    }

    const [exerciseToMove] = draftDays[originalDayIndex].exercises.splice(
      originalExerciseIndex,
      1,
    );
    if (!exerciseToMove) {
      return;
    }

    if (direction === Direction.Up) {
      draftDays[originalDayIndex - 1].exercises.push(exerciseToMove);
      return;
    }

    draftDays[originalDayIndex + 1].exercises.unshift(exerciseToMove);
  });

  return {
    days,
  };
}

export function setWorkoutDayExerciseWorkingSet(
  workout: Workout,
  dayId: string,
  exerciseId: string,
  setNumber: number,
  workingSet: WorkingSet,
): Pick<Workout, "days"> {
  return updateWorkoutDayExercise(workout, dayId, exerciseId, (exercise) => {
    return {
      ...exercise,
      workingSets: {
        ...exercise.workingSets,
        [setNumber]: workingSet,
      },
    };
  });
}

export function completeWorkoutDayExercise(
  workout: Workout,
): Pick<Workout, "days"> {
  // TODO
  return { days: workout.days };
}

export function skipWorkoutDayExercise(
  workout: Workout,
  dayId: string,
  exerciseId: string,
): Pick<Workout, "days"> {
  return updateWorkoutDayExercise(workout, dayId, exerciseId, (exercise) => {
    const exerciseDefinition = selectExerciseDefinition(workout, exercise);
    if (!exerciseDefinition) {
      return exercise;
    }
    const workingSets: DayExercise["workingSets"] = {};
    for (let i = 0; i < exerciseDefinition.trainingLoad.sets; i++) {
      workingSets[i] = {
        isLogged: true,
        reps: 0,
        weight: exerciseDefinition.trainingLoad.weight,
      };
    }
    return {
      ...exercise,
      workingSets,
      definitionTrainingLoadBeforeCompletion: {
        ...exerciseDefinition.trainingLoad,
      },
    };
  });
}

export function undoWorkoutDayExercise(
  workout: Workout,
  dayId: string,
  exerciseId: string,
): Pick<Workout, "days"> {
  return updateWorkoutDayExercise(workout, dayId, exerciseId, (exercise) => {
    const workingSets = { ...exercise.workingSets };
    const finalSetIndex = Object.keys(workingSets).length - 1;
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

export function undoWorkoutDayExerciseCompletion(
  workout: Workout,
  dayId: string,
  exerciseId: string,
): Pick<Workout, "completedTimestamp" | "days"> {
  return {
    completedTimestamp: null,
    ...undoWorkoutDayExercise(workout, dayId, exerciseId),
  };
}

export function deriveNextWorkoutDays(workout: Workout): Day[] {
  return workout.days.map((day) => {
    return {
      ...day,
      exercises: day.exercises.map((exercise) => {
        return {
          ...exercise,
          workingSets: {},
          definitionTrainingLoadBeforeCompletion: undefined,
        };
      }),
    };
  });
}

export function sanitizeWorkoutNotes(notes: string): string | null {
  const trimmedNotes = notes.trim();
  return trimmedNotes.length > 0 ? trimmedNotes : null;
}

function updateWorkoutDayExercise(
  workout: Workout,
  dayId: string,
  exerciseId: string,
  mutateExercise: (exercise: DayExercise) => DayExercise,
): Pick<Workout, "days"> {
  return {
    days: workout.days.map((day) => {
      if (day.id !== dayId) {
        return day;
      }

      return {
        ...day,
        exercises: day.exercises.map((exercise) => {
          return exercise.id === exerciseId
            ? mutateExercise(exercise)
            : exercise;
        }),
      };
    }),
  };
}
