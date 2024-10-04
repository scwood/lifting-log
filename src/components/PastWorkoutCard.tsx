import { Box, Card, Flex, Text } from "@mantine/core";

import { Workout } from "../types/Workout";
import { getVolumeLoad } from "../utils/workoutUtils";

export interface PastWorkoutCardProps {
  workout: Workout;
}

export function PastWorkoutCard(props: PastWorkoutCardProps) {
  const { workout } = props;

  return (
    <Card withBorder shadow="sm" fz="sm">
      <Card.Section withBorder inheritPadding py="xs" mb="xs">
        <Text c="dimmed" size="sm">
          Completed on{" "}
          {new Date(workout.completedTimestamp || 0).toLocaleString(undefined, {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </Text>
      </Card.Section>
      <Flex direction="column" gap="xs">
        {workout.days.map((day) => {
          return (
            <div key={day.id}>
              <u>{day.name}</u>
              <Flex direction="column">
                {day.exercises.map((exercise) => {
                  return (
                    <span>
                      {exercise.name}: {getVolumeLoad(exercise)} (
                      {Object.values(exercise.workingSets)
                        .map((workingSet) => {
                          return workingSet.reps;
                        })
                        .join(",")}
                      )
                    </span>
                  );
                })}
              </Flex>
            </div>
          );
        })}
        {workout.notes && <Box>Notes: {workout.notes}</Box>}
      </Flex>
    </Card>
  );
}
