import { Text, Button, Card, Title } from "@mantine/core";

import { Exercise } from "../types/Exercise";
import { getVolumeLoad } from "../utils/workoutUtils";

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
          This session: {getVolumeLoad(exercise)} (
          {Object.values(exercise.workingSets)
            .map((workingSet) => workingSet.reps)
            .join(",")}
          )
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
