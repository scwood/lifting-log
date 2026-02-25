import {
  Anchor,
  Button,
  Center,
  Divider,
  Flex,
  Loader,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { useCreateWorkoutMutation } from "../hooks/useCreateWorkoutMutation";
import { useCurrentWorkoutQuery } from "../hooks/useCurrentWorkoutQuery";
import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";
import { Day } from "../types/Day";
import { Exercise } from "../types/Exercise";
import {
  deriveNextWorkoutDays,
  sanitizeWorkoutNotes,
  undoWorkoutDayEntryCompletion,
} from "../utils/workoutMutationHelpers";
import {
  selectCompletedDayExercises,
  selectIncompleteWorkoutDays,
  selectWorkoutDaysWithCompletedExercises,
  selectWorkoutHasNoDays,
  selectWorkoutHasNoExercises,
  selectWorkoutIsComplete,
} from "../utils/workoutSelectors";
import { CompletedExercise } from "./CompletedExercise";
import { CreateWorkoutEmptyState } from "./CreateWorkoutEmptyState";
import { CurrentWorkoutDay } from "./CurrentWorkoutDay";

export function CurrentWorkoutPage() {
  const { isLoading, isError, data: currentWorkout } = useCurrentWorkoutQuery();
  const navigate = useNavigate();
  const {
    mutate: createWorkout,
    mutateAsync: createWorkoutAsync,
    isPending: isPendingCreateWorkout,
  } = useCreateWorkoutMutation();
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
        <Loader aria-label="Loading current workout..." />
      </Center>
    );
  }

  if (isError) {
    return <Center>Failed to load workout</Center>;
  }

  if (!currentWorkout) {
    return (
      <CreateWorkoutEmptyState
        isPending={isPendingCreateWorkout}
        onCreate={handleCreateWorkoutFromHome}
      />
    );
  }

  const hasNoDays = selectWorkoutHasNoDays(currentWorkout);
  const hasNoExercises = selectWorkoutHasNoExercises(currentWorkout);

  if (hasNoDays || hasNoExercises) {
    return (
      <>
        Your workout plan is incomplete.&nbsp;
        <Anchor to="/plan" component={Link}>
          Go to your plan to finish setup.
        </Anchor>
      </>
    );
  }

  if (selectWorkoutIsComplete(currentWorkout)) {
    return (
      <>
        <Title order={3} mb="md">
          Workout complete
        </Title>
        <p>
          Click the button below to create the next workout or click
          &quot;undo&quot; on an exercise to correct any mistakes.
        </p>
        <Button color="green" mt={4} mb="md" onClick={handleCreateNextWorkout}>
          Create next workout
        </Button>
        {renderNotes()}
        {renderCompletedExercises()}
      </>
    );
  }

  const incompleteDays = selectIncompleteWorkoutDays(currentWorkout);

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
    const daysWithCompletedExercises =
      selectWorkoutDaysWithCompletedExercises(currentWorkout);
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
            const completedExercises = selectCompletedDayExercises(day);
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
    updateWorkout({
      workoutId: currentWorkout.id,
      updates: { notes: sanitizeWorkoutNotes(notes) },
    });
  }

  function handleUndo(day: Day, exercise: Exercise) {
    if (!currentWorkout) {
      return;
    }
    updateWorkout({
      workoutId: currentWorkout.id,
      updates: undoWorkoutDayEntryCompletion(currentWorkout, day.id, exercise.id),
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
    const newDays = deriveNextWorkoutDays(currentWorkout);
    createWorkout({ days: newDays });
  }

  async function handleCreateWorkoutFromHome() {
    await createWorkoutAsync({});
    navigate("/plan");
  }
}
