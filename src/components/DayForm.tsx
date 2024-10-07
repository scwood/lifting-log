import { Button, Flex, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { v4 as uuidV4 } from "uuid";

import { Day } from "../types/Day";
import { validateTextInput } from "../utils/formUtils";

export interface DayFormProps {
  initialValues?: Day;
  onSave: (day: Day) => void;
}

export function DayForm(props: DayFormProps) {
  const { initialValues, onSave } = props;

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: initialValues?.name ?? "",
    },
    validate: {
      name: validateTextInput,
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    if (initialValues) {
      onSave({ ...initialValues, ...values });
    } else {
      onSave({ id: uuidV4(), exercises: [], ...values });
    }
  });

  return (
    <form onSubmit={handleSubmit}>
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
