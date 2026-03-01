import { Button, Flex, Modal } from "@mantine/core";
import { ReactNode } from "react";

export interface DeleteConfirmationModalProps {
  opened: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteConfirmationModal(props: DeleteConfirmationModalProps) {
  const { opened, title, children, onClose, onDelete } = props;

  return (
    <Modal centered title={title} opened={opened} onClose={onClose}>
      {children}
      <Flex justify="flex-end" gap="xs" mt="lg">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button color="red" onClick={handleDelete}>
          Delete
        </Button>
      </Flex>
    </Modal>
  );

  function handleDelete() {
    onDelete();
    onClose();
  }
}
