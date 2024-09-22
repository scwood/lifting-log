import { TextInput, Modal, Button, Divider, Flex } from "@mantine/core";
import { useState } from "react";

import { Day } from "../types/Day";

export interface DayModalProps {
  opened: boolean;
  day?: Day;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function DayModal(props: DayModalProps) {
  const { opened, day, onClose, onSave } = props;
  const [name, setName] = useState(day?.name ?? "");

  const [prevOpened, setPrevOpened] = useState(opened);
  if (prevOpened !== opened) {
    setName(day?.name ?? "");
    setPrevOpened(opened);
  }

  const saveEnabled = name.trim().length > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`${day ? "Edit" : "Create"} day`}
      centered
    >
      <Flex direction="column" gap="sm">
        <TextInput
          required
          label="Label"
          placeholder="Monday"
          description="Label for the day. For example: A, B, Monday, Tuesday, etc."
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Divider />
        <div>
          <Button color="green" onClick={handleSave} disabled={!saveEnabled}>
            Save
          </Button>
        </div>
      </Flex>
    </Modal>
  );

  function handleSave() {
    onSave(name);
    onClose();
  }
}
