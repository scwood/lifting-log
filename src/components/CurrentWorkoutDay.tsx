import { Divider, Table, Title } from "@mantine/core";

import { Day } from "../types/Day";
import { Exercise } from "../types/Exercise";
import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";
import { WorkingSetTableRow } from "./WorkingSetTableRow";
import { Workout } from "../types/Workout";
import { WorkingSet } from "../types/WorkingSet";
import { cloneDeep } from "lodash";

export interface CurrentWorkoutDayProps {
  workout: Workout;
  day: Day;
}

export function CurrentWorkoutDay(props: CurrentWorkoutDayProps) {
  const { workout, day } = props;
  const { mutate: updateWorkout } = useUpdateWorkoutMutation();

  return (
    <>
      <Title order={3}>Day: {day.name}</Title>
      <Divider mt={4} mb="md" />
      {day.exercises.map((exercise) => {
        return (
          <div key={exercise.id}>
            <Title order={4} mb="xs">
              {exercise.name}:
            </Title>
            <Table mb="lg" withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Weight</Table.Th>
                  <Table.Th>Plates</Table.Th>
                  <Table.Th>Reps</Table.Th>
                  <Table.Th>Log</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {exercise.warmUpSets.map((warmUpSet) => {
                  return (
                    <Table.Tr key={warmUpSet.id}>
                      <Table.Td>TODO</Table.Td>
                      <Table.Td>TODO</Table.Td>
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
    </>
  );

  function updateWorkingSet(
    exercise: Exercise,
    setNumber: number,
    workingSet: WorkingSet
  ) {
    const exercises = cloneDeep(day.exercises);
    exercises.forEach((e) => {
      if (e.id === exercise.id) {
        e.workingSets[setNumber] = workingSet;
      }
    });
    updateExercises(exercises);
  }

  async function updateExercises(exercises: Exercise[]) {
    await updateWorkout({
      workoutId: workout.id,
      updates: {
        days: workout.days.map((d) =>
          d.id === day.id ? { ...d, exercises } : d
        ),
      },
    });
  }
}
