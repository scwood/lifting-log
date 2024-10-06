import { Button, Flex, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

import { Day } from "../types/Day";

export interface DayFormProps {
  initialValues?: Day;
  onSave: (name: string) => void;
}

export function DayForm(props: DayFormProps) {
  const { initialValues, onSave } = props;

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: initialValues?.name ?? "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Invalid name" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSave(values.name))}>
      <TextInput
        withAsterisk
        label="Label"
        placeholder="Monday"
        description="Label for the day. For example: A, B, Monday, Tuesday, etc."
        key={form.key("name")}
        {...form.getInputProps("name")}
      />
      <Flex justify="flex-end" mt="lg">
        <Button type="submit" color="green">
          Save
        </Button>
      </Flex>
    </form>
  );
}
