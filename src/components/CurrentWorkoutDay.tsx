import { Divider, Modal, Table, Title } from "@mantine/core";
import { useState } from "react";

import { Day } from "../types/Day";
import { Exercise } from "../types/Exercise";
import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";
import { WorkingSetTableRow } from "./WorkingSetTableRow";
import { Workout } from "../types/Workout";
import { WorkingSet } from "../types/WorkingSet";
import { ExerciseCompleteForm } from "./ExerciseCompleteForm";
import { NextSessionPlan } from "../types/NextSessionPlan";
import {
  calculatePlates,
  getWarmUpWeight,
  isExerciseComplete,
  isPlateExercise,
} from "../utils/workoutUtils";

export interface CurrentWorkoutDayProps {
  workout: Workout;
  day: Day;
}

export function CurrentWorkoutDay(props: CurrentWorkoutDayProps) {
  const { workout, day } = props;
  const { mutate: updateWorkout } = useUpdateWorkoutMutation();
  const [isExerciseCompleteModalOpen, setIsExerciseCompleteModalOpen] =
    useState(false);
  const [completedExercise, setCompletedExercise] = useState<Exercise | null>(
    null
  );
  const [lastWorkingSet, setLastWorkingSet] = useState<WorkingSet | null>(null);
  const [lastWorkingSetIndex, setLastWorkingSetIndex] = useState<number | null>(
    null
  );
  const incompleteExercises = day.exercises.filter((exercise) => {
    return !isExerciseComplete(exercise);
  });

  return (
    <>
      <Title order={3}>Day: {day.name}</Title>
      <Divider mt={4} mb="md" />
      {incompleteExercises.map((exercise) => {
        return (
          <div key={exercise.id}>
            <Title order={4} mb="xs">
              {exercise.name}:
            </Title>
            <Table mb="lg" withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Weight</Table.Th>
                  {isPlateExercise(exercise) && <Table.Th>Plates</Table.Th>}
                  <Table.Th>Reps</Table.Th>
                  <Table.Th>Log</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {exercise.warmUpSets.map((warmUpSet) => {
                  const warmUpWeight = getWarmUpWeight(exercise, warmUpSet);
                  return (
                    <Table.Tr key={warmUpSet.id}>
                      <Table.Td>{warmUpWeight}</Table.Td>
                      {isPlateExercise(exercise) && (
                        <Table.Td>
                          {}
                          {calculatePlates(warmUpWeight, exercise.type)}
                        </Table.Td>
                      )}
                      <Table.Td>{warmUpSet.reps}</Table.Td>
                      <Table.Td></Table.Td>
                    </Table.Tr>
                  );
                })}
                {Array.from({ length: exercise.sets }).map((_, setNumber) => {
                  const workingSet = exercise.workingSets[setNumber] ?? {
                    isLogged: false,
                    reps: null,
                  };
                  return (
                    <WorkingSetTableRow
                      key={setNumber}
                      exercise={exercise}
                      workingSet={workingSet}
                      onChange={(workingSet) => {
                        updateWorkingSet(exercise, setNumber, workingSet);
                      }}
                    />
                  );
                })}
              </Table.Tbody>
            </Table>
          </div>
        );
      })}
      <Modal
        centered
        opened={isExerciseCompleteModalOpen}
        onClose={() => setIsExerciseCompleteModalOpen(false)}
        title="Exercise complete"
      >
        {completedExercise && (
          <ExerciseCompleteForm
            initialValues={completedExercise}
            onSave={handleSaveWorkoutCompletion}
          />
        )}
      </Modal>
    </>
  );

  async function updateWorkingSet(
    exercise: Exercise,
    setNumber: number,
    workingSet: WorkingSet
  ) {
    const exerciseCopy = {
      ...exercise,
      workingSets: {
        ...exercise.workingSets,
        [setNumber]: workingSet,
      },
    };
    if (isExerciseComplete(exerciseCopy)) {
      setCompletedExercise(exercise);
      setLastWorkingSet(workingSet);
      setLastWorkingSetIndex(setNumber);
      setIsExerciseCompleteModalOpen(true);
    } else {
      await updateExercise(exerciseCopy);
    }
  }

  function handleSaveWorkoutCompletion(nextSession: NextSessionPlan) {
    if (
      completedExercise === null ||
      lastWorkingSet === null ||
      lastWorkingSetIndex === null
    ) {
      return;
    }
    setIsExerciseCompleteModalOpen(false);
    const exerciseCopy = {
      ...completedExercise,
      workingSets: {
        ...completedExercise.workingSets,
        [lastWorkingSetIndex]: lastWorkingSet,
      },
      nextSession,
    };
    updateExercise(exerciseCopy);
  }

  async function updateExercise(exercise: Exercise) {
    await updateWorkout({
      workoutId: workout.id,
      updates: {
        days: workout.days.map((d) => {
          return d.id === day.id
            ? {
                ...day,
                exercises: day.exercises.map((e) => {
                  return e.id === exercise.id ? exercise : e;
                }),
              }
            : d;
        }),
      },
    });
  }
}
