import {
  Flex,
  Title,
  Center,
  Loader,
  Button,
  Text,
  Textarea,
  Accordion,
} from "@mantine/core";
import { useState } from "react";

import { useCurrentWorkoutQuery } from "../hooks/useCurrentWorkoutQuery";
import { ExerciseName, allExercises } from "../types/ExerciseName";
import { useCreateWorkoutMutation } from "../hooks/useCreateWorkoutMutation";
import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";
import { calculateDeload } from "../utils/weightUtils";
import { CurrentWorkoutDay } from "./CurrentWorkoutDay";

export function CurrentWorkout() {
  const { isLoading, isError, data: currentWorkout } = useCurrentWorkoutQuery();
  const { mutate: createWorkout } = useCreateWorkoutMutation();
  const { mutate: updateWorkout } = useUpdateWorkoutMutation();

  const [isEditWorkoutModalOpen, setIsEditWorkoutModalOpen] = useState(false);
  const [notes, setNotes] = useState(currentWorkout?.notes ?? "");

  console.log(currentWorkout);

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

  if (isError || !currentWorkout) {
    return <Center>Failed to get current workout</Center>;
  }

  // TODO: handle no days or exercises created

  if (currentWorkout.completedTimestamp) {
    return (
      <>
        <Title order={3} mb="md">
          Workout complete
        </Title>
        <p>
          Click the button below to create the next workout or click "undo" on
          an exercise to correct any mistakes.
        </p>
        <Button color="green" mb="sm" onClick={handleCreateNextWorkout}>
          Create next workout
        </Button>
        {renderNotes()}
        {renderCompletedWorkouts()}
      </>
    );
  }

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
        .<br />
      </Text>
      <Accordion
        multiple
        styles={{
          control: { padding: 0 },
          content: { padding: 0 },
        }}
      >
        {currentWorkout.days.map((day) => {
          return <CurrentWorkoutDay key={day.id} day={day} />;
        })}
      </Accordion>
      {renderNotes()}
      {renderCompletedWorkouts()}
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

  function renderCompletedWorkouts() {
    // if (!currentWorkout) {
    //   return null;
    // }
    // return (
    //   <>
    //     {isAnyExerciseComplete() && (
    //       <Title order={3} mb="md">
    //         Completed exercises
    //       </Title>
    //     )}
    //     <Flex direction="column" gap="lg">
    //       {allExercises.map((exercise) => {
    //         return (
    //           currentWorkout.lastSetReps[exercise] !== null && (
    //             <CompletedExercise
    //               key={exercise}
    //               exercise={exercise}
    //               workout={currentWorkout}
    //               onUndo={handleUndo}
    //             />
    //           )
    //         );
    //       })}
    //     </Flex>
    //   </>
    // );
  }

  function handleCompleteExercise(exercise: ExerciseName, lastSetReps: number) {
    if (!currentWorkout) {
      return;
    }
    const updates: LegacyWorkout = {
      ...currentWorkout,
      lastSetReps: { ...currentWorkout.lastSetReps, [exercise]: lastSetReps },
    };
    const allCompleted = allExercises.every((exercise) => {
      return updates.lastSetReps[exercise] !== null;
    });
    if (allCompleted) {
      updates.completedTimestamp = Date.now();
    }
    updateWorkout({ workout: { ...updates } });
  }

  function handleNotesBlur() {
    if (!currentWorkout) {
      return;
    }
    const trimmedNotes = notes.trim();
    const notesUpdate = notes.trim().length > 0 ? trimmedNotes : null;
    updateWorkout({ workout: { ...currentWorkout, notes: notesUpdate } });
  }

  function handleUndo(exercise: ExerciseName) {
    if (!currentWorkout) {
      return;
    }
    updateWorkout({
      workout: {
        ...currentWorkout,
        completedTimestamp: null,
        lastSetReps: { ...currentWorkout.lastSetReps, [exercise]: null },
      },
    });
  }

  function handleCreateNextWorkout() {
    if (!currentWorkout || !repRecords) {
      return;
    }
    const newWorkingWeight = { ...currentWorkout.workingWeight };
    for (const exercise of allExercises) {
      const prevWorkingWeight = currentWorkout.workingWeight[exercise];
      const prevLastSetReps = currentWorkout.lastSetReps[exercise] || 0;

      if (prevLastSetReps >= 10) {
        if (exercise === "benchPress" || exercise === "overheadPress") {
          newWorkingWeight[exercise] += 5;
        } else {
          newWorkingWeight[exercise] += 10;
        }
      } else if (prevLastSetReps >= 5) {
        if (exercise === "benchPress" || exercise === "overheadPress") {
          newWorkingWeight[exercise] += 2.5;
        } else {
          newWorkingWeight[exercise] += 5;
        }
      } else {
        newWorkingWeight[exercise] = calculateDeload(prevWorkingWeight);
      }
    }
    createWorkout({ workingWeight: newWorkingWeight });
  }

  // function isAnyExerciseComplete() {
  //   return (
  //     !!currentWorkout &&
  //     Object.values(currentWorkout.lastSetReps).some((reps) => !!reps)
  //   );
  // }
}
