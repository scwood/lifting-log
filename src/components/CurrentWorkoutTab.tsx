import {
  Flex,
  Title,
  Center,
  Loader,
  Button,
  Text,
  Textarea,
  Anchor,
  Divider,
} from "@mantine/core";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useCurrentWorkoutQuery } from "../hooks/useCurrentWorkoutQuery";
import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";
import { useCreateWorkoutMutation } from "../hooks/useCreateWorkoutMutation";
import {
  isAnyExerciseComplete,
  isEveryDayComplete,
  isExerciseComplete,
} from "../utils/workoutUtils";
import { CurrentWorkoutDay } from "./CurrentWorkoutDay";
import { CompletedExercise } from "./CompletedExercise";
import { Day } from "../types/Day";
import { Exercise } from "../types/Exercise";

export function CurrentWorkoutTab() {
  const { isLoading, isError, data: currentWorkout } = useCurrentWorkoutQuery();
  const { mutate: createWorkout } = useCreateWorkoutMutation();
  const { mutate: updateWorkout } = useUpdateWorkoutMutation();
  const [notes, setNotes] = useState(currentWorkout?.notes ?? "");

  // Sync notes from currentWorkout to input
  const [prevCurrentWorkout, setPrevCurrentWorkout] = useState(currentWorkout);
  if (currentWorkout !== prevCurrentWorkout) {
    setPrevCurrentWorkout(currentWorkout);
    setNotes(currentWorkout?.notes ?? "");
  }

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (isError) {
    return <Center>Failed to load workout</Center>;
  }

  if (!currentWorkout || currentWorkout.days.length === 0) {
    return (
      <Center>
        To get started,&nbsp;
        <Anchor to="/plan" component={Link}>
          create a workout plan
        </Anchor>
        .
      </Center>
    );
  }

  if (isEveryDayComplete(currentWorkout)) {
    return (
      <>
        <Title order={3} mb="md">
          Workout complete
        </Title>
        <p>
          Click the button below to create the next workout or click "undo" on
          an exercise to correct any mistakes.
        </p>
        <Button color="green" mt={4} mb="md" onClick={handleCreateNextWorkout}>
          Create next workout
        </Button>
        {renderNotes()}
        {renderCompletedExercises()}
      </>
    );
  }

  const incompleteDays = currentWorkout.days.filter((day) => {
    return day.exercises.some((exercise) => !isExerciseComplete(exercise));
  });

  return (
    <>
      <Flex align="center" justify="space-between">
        <Title order={3}>Current workout</Title>
      </Flex>
      <Text fz="sm" c="dimmed" mb="sm">
        Created on{" "}
        {new Date(currentWorkout.createdTimestamp).toLocaleString(undefined, {
          dateStyle: "long",
          timeStyle: "short",
        })}
        .
      </Text>
      {incompleteDays.map((day) => {
        return (
          <CurrentWorkoutDay key={day.id} day={day} workout={currentWorkout} />
        );
      })}
      {renderNotes()}
      {renderCompletedExercises()}
    </>
  );

  function renderNotes() {
    return (
      <Textarea
        label="Notes"
        placeholder="Feelings, etc."
        mb="lg"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        onBlur={handleNotesBlur}
      />
    );
  }

  function renderCompletedExercises() {
    if (!currentWorkout) {
      return null;
    }
    const daysWithCompletedExercises = currentWorkout.days.filter(
      isAnyExerciseComplete
    );
    if (daysWithCompletedExercises.length === 0) {
      return null;
    }
    return (
      <>
        <Title order={3} mb="md">
          Completed exercises
        </Title>
        <Flex direction="column" gap="md">
          {daysWithCompletedExercises.map((day) => {
            const completedExercises = day.exercises.filter(isExerciseComplete);
            return (
              <div key={day.id}>
                <div>
                  <Title order={3}>Day: {day.name}</Title>
                  <Divider mt={4} mb="md" />
                </div>
                <Flex direction="column" gap="md">
                  {completedExercises.map((exercise) => {
                    return (
                      <CompletedExercise
                        key={exercise.id}
                        exercise={exercise}
                        onUndo={(exercise) => handleUndo(day, exercise)}
                      />
                    );
                  })}
                </Flex>
              </div>
            );
          })}
        </Flex>
      </>
    );
  }

  function handleNotesBlur() {
    if (!currentWorkout) {
      return;
    }
    const trimmedNotes = notes.trim();
    const notesUpdate = notes.trim().length > 0 ? trimmedNotes : null;
    updateWorkout({
      workoutId: currentWorkout.id,
      updates: { notes: notesUpdate },
    });
  }

  function handleUndo(day: Day, exercise: Exercise) {
    if (!currentWorkout) {
      return;
    }
    updateWorkout({
      workoutId: currentWorkout.id,
      updates: {
        completedTimestamp: null,
        days: currentWorkout.days.map((d) => {
          return d.id === day.id
            ? {
                ...d,
                exercises: d.exercises.map((e) => {
                  if (e.id !== exercise.id) {
                    return e;
                  }
                  const workingSetsCopy = { ...e.workingSets };
                  const finalSet = workingSetsCopy[e.sets - 1];
                  if (finalSet) {
                    finalSet.isLogged = false;
                  }
                  return { ...e, workingSets: workingSetsCopy };
                }),
              }
            : d;
        }),
      },
    });
  }

  function handleCreateNextWorkout() {
    if (!currentWorkout) {
      return;
    }
    updateWorkout({
      workoutId: currentWorkout.id,
      updates: { completedTimestamp: Date.now() },
    });
    const newDays = currentWorkout.days.map((day) => {
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
    createWorkout({ days: newDays });
  }
}
