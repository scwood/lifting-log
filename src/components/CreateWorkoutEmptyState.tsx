import { Button, Flex } from "@mantine/core";

export interface CreateWorkoutEmptyStateProps {
  isPending: boolean;
  onCreate: () => void | Promise<void>;
}

export function CreateWorkoutEmptyState(props: CreateWorkoutEmptyStateProps) {
  const { isPending, onCreate } = props;

  return (
    <Flex direction="column" align="center" gap="sm">
      <div>To get started, press the button below to create a workout plan</div>
      <Button color="green" loading={isPending} onClick={onCreate}>
        Create workout plan
      </Button>
    </Flex>
  );
}
