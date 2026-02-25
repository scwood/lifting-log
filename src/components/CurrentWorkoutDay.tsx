import {
  ActionIcon,
  Divider,
  Flex,
  Menu,
  Modal,
  Table,
  Title,
} from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import { useState } from "react";

import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";
import { Day } from "../types/Day";
import { Exercise } from "../types/Exercise";
import { NextSessionPlan } from "../types/NextSessionPlan";
import { WorkingSet } from "../types/WorkingSet";
import { Workout } from "../types/Workout";
import { calculatePlates } from "../utils/weightUtils";
import {
  completeWorkoutDayEntry,
  setWorkoutDayEntryWorkingSet,
  skipWorkoutDayEntry,
} from "../utils/workoutMutationHelpers";
import {
  selectExerciseIsComplete,
  selectExerciseUsesPlates,
  selectIncompleteDayExercises,
  selectWarmUpSetWeight,
} from "../utils/workoutSelectors";
import { ExerciseCompleteForm } from "./ExerciseCompleteForm";
import { WorkingSetTableRow } from "./WorkingSetTableRow";

export interface CurrentWorkoutDayProps {
  workout: Workout;
  day: Day;
}

export function CurrentWorkoutDay(props: CurrentWorkoutDayProps) {
  const { workout, day } = props;
  const { mutateAsync: updateWorkout } = useUpdateWorkoutMutation();
  const [isExerciseCompleteModalOpen, setIsExerciseCompleteModalOpen] =
    useState(false);
  const [completedExercise, setCompletedExercise] = useState<Exercise | null>(
    null,
  );
  const [lastWorkingSet, setLastWorkingSet] = useState<WorkingSet | null>(null);
  const [lastWorkingSetIndex, setLastWorkingSetIndex] = useState<number | null>(
    null,
  );
  const incompleteExercises = selectIncompleteDayExercises(day);

  return (
    <>
      <Title order={3}>Day: {day.name}</Title>
      <Divider mt={4} mb="md" />
      {incompleteExercises.map((exercise) => {
        return (
          <div key={exercise.id}>
            <Flex justify="space-between" align="center" mb="xs">
              <Title order={4}>{exercise.name}:</Title>
              <Menu>
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label={`${exercise.name} menu`}
                  >
                    <IconDots />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item onClick={() => handleSkipExercise(exercise)}>
                    Skip exercise
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Flex>
            <Table mb="lg" withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Weight</Table.Th>
                  {selectExerciseUsesPlates(exercise) && (
                    <Table.Th>Plates</Table.Th>
                  )}
                  <Table.Th>Reps</Table.Th>
                  <Table.Th>Log</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {exercise.warmUpSets.map((warmUpSet) => {
                  const warmUpWeight = selectWarmUpSetWeight(
                    exercise,
                    warmUpSet,
                  );
                  return (
                    <Table.Tr key={warmUpSet.id}>
                      <Table.Td>{warmUpWeight}</Table.Td>
                      {selectExerciseUsesPlates(exercise) && (
                        <Table.Td>
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
                    weight: null,
                  };
                  return (
                    <WorkingSetTableRow
                      key={setNumber}
                      exercise={exercise}
                      setNumber={setNumber + 1}
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
            defaultValues={completedExercise}
            onSave={handleSaveWorkoutCompletion}
          />
        )}
      </Modal>
    </>
  );

  async function updateWorkingSet(
    exercise: Exercise,
    setNumber: number,
    workingSet: WorkingSet,
  ) {
    const exerciseCopy = {
      ...exercise,
      workingSets: {
        ...exercise.workingSets,
        [setNumber]: workingSet,
      },
    };
    if (selectExerciseIsComplete(exerciseCopy)) {
      setCompletedExercise(exercise);
      setLastWorkingSet(workingSet);
      setLastWorkingSetIndex(setNumber);
      setIsExerciseCompleteModalOpen(true);
    } else {
      await updateWorkout({
        workoutId: workout.id,
        updates: setWorkoutDayEntryWorkingSet(
          workout,
          day.id,
          exercise.id,
          setNumber,
          workingSet,
        ),
      });
    }
  }

  async function handleSaveWorkoutCompletion(nextSession: NextSessionPlan) {
    if (
      completedExercise === null ||
      lastWorkingSet === null ||
      lastWorkingSetIndex === null
    ) {
      return;
    }
    setIsExerciseCompleteModalOpen(false);
    await updateWorkout({
      workoutId: workout.id,
      updates: completeWorkoutDayEntry(workout, {
        dayId: day.id,
        entryId: completedExercise.id,
        setNumber: lastWorkingSetIndex,
        workingSet: lastWorkingSet,
        nextSession,
      }),
    });
  }

  async function handleSkipExercise(exercise: Exercise) {
    await updateWorkout({
      workoutId: workout.id,
      updates: skipWorkoutDayEntry(workout, day.id, exercise.id),
    });
  }
}
