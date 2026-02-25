import { Button, Card, Text, Title } from "@mantine/core";

import { Exercise } from "../types/Exercise";
import {
  getLoggedSetBreakdown,
  getVolumeLoad,
} from "../utils/workoutFormattingUtils";

export interface CompletedExerciseProps {
  exercise: Exercise;
  onUndo: (exercise: Exercise) => void;
}

export function CompletedExercise(props: CompletedExerciseProps) {
  const { onUndo, exercise } = props;

  return (
    <Card withBorder shadow="sm">
      <Card.Section withBorder inheritPadding py="xs">
        <Title order={4} mb={2}>
          {exercise.name}
        </Title>
        <Text size="sm" c="dimmed">
          This session:{" "}
          {getLoggedSetBreakdown(exercise.workingSets, exercise.weight)}
          <br />
          Next session:{" "}
          {getVolumeLoad({ ...exercise, ...exercise.nextSession })}
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
