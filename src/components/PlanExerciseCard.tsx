import { ActionIcon, Card, Flex, Menu, Text, Title } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";

import { DayExercise } from "../types/DayExercise";
import { Workout } from "../types/Workout";
import { getTrainingLoadString } from "../utils/workoutFormattingUtils";
import { selectExerciseDefinition } from "../utils/workoutSelectors";

export interface PlanExerciseCardProps {
  workout: Workout;
  exercise: DayExercise;
  moveUpDisabled: boolean;
  moveDownDisabled: boolean;
  onEdit: (exercise: DayExercise) => void;
  onDelete: (exercise: DayExercise) => void;
  onMoveUp: (exercise: DayExercise) => void;
  onMoveDown: (exercise: DayExercise) => void;
}

export function PlanExerciseCard(props: PlanExerciseCardProps) {
  const {
    workout,
    exercise,
    moveDownDisabled,
    moveUpDisabled,
    onEdit,
    onDelete,
    onMoveDown,
    onMoveUp,
  } = props;

  const exerciseDefinition = selectExerciseDefinition(workout, exercise);
  if (!exerciseDefinition) {
    return null;
  }

  return (
    <Card withBorder>
      <Flex justify="space-between" align="center">
        <Title order={4}>{exerciseDefinition.name}</Title>
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
            <Menu.Item
              disabled={moveUpDisabled}
              onClick={() => onMoveUp(exercise)}
            >
              Move up
            </Menu.Item>
            <Menu.Item
              disabled={moveDownDisabled}
              onClick={() => onMoveDown(exercise)}
            >
              Move down
            </Menu.Item>
            <Menu.Item onClick={() => onEdit(exercise)}>Edit</Menu.Item>
            <Menu.Item color="red" onClick={() => onDelete(exercise)}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>
      <Text c="dimmed" size="sm">
        {getTrainingLoadString(exerciseDefinition.trainingLoad)} with{" "}
        {exerciseDefinition.warmUpSets.length} warm-up sets.
      </Text>
    </Card>
  );
}
