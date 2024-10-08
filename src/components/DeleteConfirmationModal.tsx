import { Button, Flex, Modal } from "@mantine/core";

export interface DeleteConfirmationModalProps {
  opened: boolean;
  itemName: string;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteConfirmationModal(props: DeleteConfirmationModalProps) {
  const { opened, itemName, onClose, onDelete } = props;

  return (
    <Modal
      centered
      title={`Delete ${itemName}`}
      opened={opened}
      onClose={onClose}
    >
      Are you sure you want to permanently delete this {itemName}?
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
