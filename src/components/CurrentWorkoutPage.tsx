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
import { DayExercise } from "../types/DayExercise";
import {
  completeWorkout,
  deriveNextWorkout,
  setExerciseDefinitionTrainingLoad,
  undoWorkoutDayExerciseCompletion,
  updateWorkoutNotes,
} from "../utils/workoutMutationHelpers";
import {
  selectCompletedDayExercises,
  selectExerciseDefinition,
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
  const { isLoading, isError, data: workout } = useCurrentWorkoutQuery();
  const navigate = useNavigate();
  const { mutateAsync: createWorkout, isPending: isPendingCreateWorkout } =
    useCreateWorkoutMutation();
  const { mutateAsync: updateWorkout } = useUpdateWorkoutMutation();
  const [notes, setNotes] = useState(workout?.notes ?? "");

  // Sync notes from currentWorkout to input
  const [prevCurrentWorkout, setPrevCurrentWorkout] = useState(workout);
  if (workout !== prevCurrentWorkout) {
    setPrevCurrentWorkout(workout);
    setNotes(workout?.notes ?? "");
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

  if (!workout) {
    return (
      <CreateWorkoutEmptyState
        isPending={isPendingCreateWorkout}
        onCreate={handleCreateWorkoutFromHome}
      />
    );
  }

  const hasNoDays = selectWorkoutHasNoDays(workout);
  const hasNoExercises = selectWorkoutHasNoExercises(workout);

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

  if (selectWorkoutIsComplete(workout)) {
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

  const incompleteDays = selectIncompleteWorkoutDays(workout);

  return (
    <>
      <Flex align="center" justify="space-between">
        <Title order={3}>Current workout</Title>
      </Flex>
      <Text fz="sm" c="dimmed" mb="sm">
        Created on{" "}
        {new Date(workout.createdTimestamp).toLocaleString(undefined, {
          dateStyle: "long",
          timeStyle: "short",
        })}
        .
      </Text>
      {incompleteDays.map((day) => {
        return <CurrentWorkoutDay key={day.id} day={day} workout={workout} />;
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
    if (!workout) {
      return null;
    }
    const daysWithCompletedExercises =
      selectWorkoutDaysWithCompletedExercises(workout);
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
            const completedExercises = selectCompletedDayExercises(
              workout,
              day,
            );
            return (
              <div key={day.id}>
                <div>
                  <Title order={3}>Day: {day.name}</Title>
                  <Divider mt={4} mb="md" />
                </div>
                <Flex direction="column" gap="md">
                  {completedExercises.map((exercise) => {
                    const exerciseDefinition = selectExerciseDefinition(
                      workout,
                      exercise,
                    );
                    if (!exerciseDefinition) {
                      return null;
                    }
                    return (
                      <CompletedExercise
                        key={exercise.id}
                        exercise={exercise}
                        exerciseDefinition={exerciseDefinition}
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
    if (!workout) {
      return;
    }
    updateWorkout({
      workoutId: workout.id,
      updates: updateWorkoutNotes(notes),
    });
  }

  function handleUndo(day: Day, exercise: DayExercise) {
    if (!workout) {
      return;
    }
    const exerciseDefinition = selectExerciseDefinition(workout, exercise);
    if (!exerciseDefinition) {
      return;
    }
    updateWorkout({
      workoutId: workout.id,
      updates: {
        ...undoWorkoutDayExerciseCompletion(workout, day.id, exercise.id),
        ...setExerciseDefinitionTrainingLoad(
          workout,
          exerciseDefinition,
          exercise.definitionTrainingLoadBeforeCompletion ?? {},
        ),
      },
    });
  }

  async function handleCreateNextWorkout() {
    if (!workout) {
      return;
    }
    await updateWorkout({
      workoutId: workout.id,
      updates: completeWorkout(),
    });
    await createWorkout(deriveNextWorkout(workout));
  }

  async function handleCreateWorkoutFromHome() {
    await createWorkout({});
    navigate("/plan");
  }
}
