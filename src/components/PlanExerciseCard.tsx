import { ActionIcon, Card, Flex, Menu, Text, Title } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";

import { Exercise } from "../types/Exercise";
import { getVolumeLoad } from "../utils/workoutUtils";

export interface PlanExerciseCardProps {
  exercise: Exercise;
  moveUpDisabled: boolean;
  moveDownDisabled: boolean;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  onMoveUp: (exercise: Exercise) => void;
  onMoveDown: (exercise: Exercise) => void;
}

export function PlanExerciseCard(props: PlanExerciseCardProps) {
  const {
    exercise,
    moveDownDisabled,
    moveUpDisabled,
    onEdit,
    onDelete,
    onMoveDown,
    onMoveUp,
  } = props;

  return (
    <Card withBorder>
      <Flex justify="space-between" align="center">
        <Title order={4}>{exercise.name}</Title>
        {/* <Text fw={600}>{exercise.name}</Text> */}
        <Menu>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
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
        {getVolumeLoad(exercise)} with {exercise.warmUpSets.length} warm-up
        sets.
      </Text>
    </Card>
  );
}
