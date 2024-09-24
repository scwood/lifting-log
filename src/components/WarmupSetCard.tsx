import { Text, Card, Flex, ActionIcon, rem, Menu } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";

import { WarmUpSet } from "../types/WarmUpSet";
import { WarmUpType } from "../types/WarmUpType";

export interface WarmUpSetCardProps {
  warmUpSet: WarmUpSet;
  moveUpDisabled: boolean;
  moveDownDisabled: boolean;
  onEdit: (warmUpSet: WarmUpSet) => void;
  onDelete: (warmUpSet: WarmUpSet) => void;
  onMoveUp: (warmUpSet: WarmUpSet) => void;
  onMoveDown: (warmUpSet: WarmUpSet) => void;
}

export function WarmUpSetCard(props: WarmUpSetCardProps) {
  const {
    warmUpSet,
    moveUpDisabled,
    moveDownDisabled,
    onEdit,
    onDelete,
    onMoveUp,
    onMoveDown,
  } = props;

  return (
    <Card>
      <Flex justify="space-between" align="center">
        <Text size="sm">
          {warmUpSet.reps} rep{warmUpSet.reps !== 1 && "s"} for{" "}
          {warmUpSet.value}
          {warmUpSet.type === WarmUpType.Weight ? "lbs" : "% of working weight"}
        </Text>
        <Menu>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <IconDots style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              disabled={moveUpDisabled}
              onClick={() => onMoveUp(warmUpSet)}
            >
              Move up
            </Menu.Item>
            <Menu.Item
              disabled={moveDownDisabled}
              onClick={() => onMoveDown(warmUpSet)}
            >
              Move down
            </Menu.Item>
            <Menu.Item onClick={() => onEdit(warmUpSet)}>Edit</Menu.Item>
            <Menu.Item color="red" onClick={() => onDelete(warmUpSet)}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>
    </Card>
  );
}
