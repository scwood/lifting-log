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
import { DayExercise } from "../types/DayExercise";
import { TrainingLoad } from "../types/TrainingLoad";
import { WorkingSet } from "../types/WorkingSet";
import { Workout } from "../types/Workout";
import { calculatePlates } from "../utils/weightUtils";
import {
  completeWorkoutDayExercise,
  setExerciseDefinitionTrainingLoad,
  setWorkoutDayExerciseWorkingSet,
  skipWorkoutDayExercise,
} from "../utils/workoutMutationHelpers";
import {
  selectExerciseDefinition,
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
  const [completedExercise, setCompletedExercise] =
    useState<DayExercise | null>(null);
  const [lastWorkingSet, setLastWorkingSet] = useState<WorkingSet | null>(null);
  const [lastWorkingSetNumber, setLastWorkingSetNumber] = useState<
    number | null
  >(null);
  const incompleteExercises = selectIncompleteDayExercises(workout, day);

  const completedExerciseDefinition = completedExercise
    ? selectExerciseDefinition(workout, completedExercise)
    : undefined;

  return (
    <>
      <Title order={3}>Day: {day.name}</Title>
      <Divider mt={4} mb="md" />
      {incompleteExercises.map((exercise) => {
        const exerciseDefinition = selectExerciseDefinition(workout, exercise);
        if (!exerciseDefinition) {
          return null;
        }
        return (
          <div key={exercise.id}>
            <Flex justify="space-between" align="center" mb="xs">
              <Title order={4}>{exerciseDefinition.name}:</Title>
              <Menu>
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label={`${exerciseDefinition.name} menu`}
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
                  {selectExerciseUsesPlates(exerciseDefinition) && (
                    <Table.Th>Plates</Table.Th>
                  )}
                  <Table.Th>Reps</Table.Th>
                  <Table.Th>Log</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {exerciseDefinition.warmUpSets.map((warmUpSet) => {
                  const warmUpWeight = selectWarmUpSetWeight(
                    exerciseDefinition,
                    warmUpSet,
                  );
                  return (
                    <Table.Tr key={warmUpSet.id}>
                      <Table.Td>{warmUpWeight}</Table.Td>
                      {selectExerciseUsesPlates(exerciseDefinition) && (
                        <Table.Td>
                          {calculatePlates(
                            warmUpWeight,
                            exerciseDefinition.type,
                          )}
                        </Table.Td>
                      )}
                      <Table.Td>{warmUpSet.reps}</Table.Td>
                      <Table.Td></Table.Td>
                    </Table.Tr>
                  );
                })}
                {Array.from({
                  length: exerciseDefinition.trainingLoad.sets,
                }).map((_, setNumber) => {
                  const workingSet = exercise.workingSets[setNumber] ?? {
                    isLogged: false,
                    reps: null,
                    weight: null,
                  };
                  return (
                    <WorkingSetTableRow
                      key={setNumber}
                      exerciseDefinition={exerciseDefinition}
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
        {completedExerciseDefinition && (
          <ExerciseCompleteForm
            exerciseDefinition={completedExerciseDefinition}
            onSave={handleSaveExerciseCompletion}
          />
        )}
      </Modal>
    </>
  );

  async function updateWorkingSet(
    exercise: DayExercise,
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
    if (selectExerciseIsComplete(workout, exerciseCopy)) {
      setCompletedExercise(exercise);
      setLastWorkingSet(workingSet);
      setLastWorkingSetNumber(setNumber);
      setIsExerciseCompleteModalOpen(true);
    } else {
      await updateWorkout({
        workoutId: workout.id,
        updates: setWorkoutDayExerciseWorkingSet(
          workout,
          day.id,
          exercise.id,
          setNumber,
          workingSet,
        ),
      });
    }
  }

  async function handleSaveExerciseCompletion(
    nextTrainingLoad: Partial<TrainingLoad>,
  ) {
    if (
      completedExercise == null ||
      lastWorkingSet == null ||
      lastWorkingSetNumber == null ||
      completedExerciseDefinition == null
    ) {
      return;
    }
    setIsExerciseCompleteModalOpen(false);
    await updateWorkout({
      workoutId: workout.id,
      updates: {
        ...setExerciseDefinitionTrainingLoad(
          workout,
          completedExerciseDefinition,
          nextTrainingLoad,
        ),
        ...completeWorkoutDayExercise(
          workout,
          day.id,
          completedExercise.id,
          lastWorkingSetNumber,
          lastWorkingSet,
          completedExerciseDefinition.trainingLoad,
        ),
      },
    });
  }

  async function handleSkipExercise(exercise: DayExercise) {
    await updateWorkout({
      workoutId: workout.id,
      updates: skipWorkoutDayExercise(workout, day.id, exercise.id),
    });
  }
}
