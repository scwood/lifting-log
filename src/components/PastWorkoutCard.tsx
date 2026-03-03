import { Box, Card, Flex, Text } from "@mantine/core";

import { Workout } from "../types/Workout";
import { formatLoggedSetBreakdown } from "../utils/workoutFormattingUtils";
import { selectExerciseDefinition } from "../utils/workoutSelectors";

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
                  const exerciseDefinition = selectExerciseDefinition(
                    workout,
                    exercise,
                  );
                  if (!exerciseDefinition) {
                    return null;
                  }
                  return (
                    <span key={exercise.id}>
                      {exerciseDefinition.name}:{" "}
                      {formatLoggedSetBreakdown(
                        exercise.workingSets,
                        exerciseDefinition.trainingLoad.weight,
                      )}
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
