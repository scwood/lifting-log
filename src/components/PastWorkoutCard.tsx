import { Box, Card, Flex, Text } from "@mantine/core";

import { Workout } from "../types/Workout";
import {
  getLoggedSetBreakdown,
  getVolumeLoad,
} from "../utils/workoutFormattingUtils";

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
                    <span key={exercise.id}>
                      {exercise.name}: {getVolumeLoad(exercise)} (
                      {getLoggedSetBreakdown(exercise.workingSets, exercise.weight)}
                      )
                    </span>
                  );
                })}
              </Flex>
            </div>
          );
        })}
        {workout.notes && (
          <Box>
            <u>Notes:</u> {workout.notes}
          </Box>
        )}
      </Flex>
    </Card>
  );
}
