import { Button, Card, Text, Title } from "@mantine/core";

import { DayExercise } from "../types/DayExercise";
import { ExerciseDefinition } from "../types/ExerciseDefinition";
import {
  getLoggedSetBreakdown,
  getTrainingLoadString,
} from "../utils/workoutFormattingUtils";

export interface CompletedExerciseProps {
  exercise: DayExercise;
  exerciseDefinition: ExerciseDefinition;
  onUndo: (exercise: DayExercise) => void;
}

export function CompletedExercise(props: CompletedExerciseProps) {
  const { onUndo, exercise, exerciseDefinition } = props;

  return (
    <Card withBorder shadow="sm">
      <Card.Section withBorder inheritPadding py="xs">
        <Title order={4} mb={2}>
          {exerciseDefinition.name}
        </Title>
        <Text size="sm" c="dimmed">
          This session: {getLoggedSetBreakdown(exercise.workingSets)}
          <br />
          Next session: {getTrainingLoadString(exerciseDefinition.trainingLoad)}
        </Text>
        <Button
          fullWidth
          size="xs"
          mt="sm"
          mb={6}
          onClick={() => onUndo(exercise)}
        >
          Undo
        </Button>
      </Card.Section>
    </Card>
  );
}
