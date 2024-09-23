import { Text, Card, Flex, ActionIcon, rem, Menu } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";

import { WarmupSet } from "../types/WarmupSet";
import { WarmupType } from "../types/WarmupType";

export interface WarmupSetCardProps {
  warmupSet: WarmupSet;
  moveUpDisabled: boolean;
  moveDownDisabled: boolean;
  onEdit: (warmupSet: WarmupSet) => void;
  onDelete: (warmupSet: WarmupSet) => void;
  onMoveUp: (warmupSet: WarmupSet) => void;
  onMoveDown: (warmupSet: WarmupSet) => void;
}

export function WarmupSetCard(props: WarmupSetCardProps) {
  const {
    warmupSet,
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
          {warmupSet.reps} rep{warmupSet.reps !== 1 && "s"} for{" "}
          {warmupSet.value}
          {warmupSet.type === WarmupType.Weight ? "lbs" : "% of working weight"}
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
              onClick={() => onMoveUp(warmupSet)}
            >
              Move up
            </Menu.Item>
            <Menu.Item
              disabled={moveDownDisabled}
              onClick={() => onMoveDown(warmupSet)}
            >
              Move down
            </Menu.Item>
            <Menu.Item onClick={() => onEdit(warmupSet)}>Edit</Menu.Item>
            <Menu.Item color="red" onClick={() => onDelete(warmupSet)}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>
    </Card>
  );
}
