import {
  Checkbox,
  NumberInput,
  Table,
  Title,
  useMantineTheme,
} from "@mantine/core";

import { Day } from "../types/Day";
import { Exercise } from "../types/Exercise";
import { Workout } from "../types/Workout";
import { useUpdateWorkoutMutation } from "../hooks/useUpdateWorkoutMutation";
import { calculatePlates } from "../utils/weightUtils";

export interface CurrentWorkoutDayProps {
  day: Day;
}

export function CurrentWorkoutDay(props: CurrentWorkoutDayProps) {
  const { day } = props;
  const { mutate: updateWorkout } = useUpdateWorkoutMutation();
  const theme = useMantineTheme();

  return (
    <>
      <Title
        order={3}
        style={{
          borderBottom: `1px solid ${theme.colors.dark[4]}`,
        }}
        pb={6}
        mb="md"
      >
        Day: {day.name}
      </Title>
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
                {Array.from({ length: exercise.sets }).map((_, index) => {
                  return (
                    <Table.Tr key={index}>
                      <Table.Td>{exercise.weight}</Table.Td>
                      <Table.Td>{calculatePlates(exercise.weight)}</Table.Td>
                      <Table.Td>
                        <NumberInput
                          styles={{ input: { width: 42, height: 10 } }}
                          size="sm"
                          placeholder={String(exercise.reps)}
                          hideControls
                        />
                      </Table.Td>
                      <Table.Td>
                        <Checkbox size="md" variant="" color="green" />
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </div>
        );
      })}
    </>
  );

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
