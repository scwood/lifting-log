import { Flex } from "@mantine/core";
import { v4 as uuidV4 } from "uuid";
import { z } from "zod";

import { Day } from "../types/Day";
import { useAppForm } from "../hooks/useAppForm";

export interface DayFormProps {
  initialValues?: Day;
  onSave: (day: Day) => void;
}

const formSchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
});

export function DayForm(props: DayFormProps) {
  const { initialValues, onSave } = props;

  const form = useAppForm({
    defaultValues: {
      name: initialValues?.name ?? "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = formSchema.parse(value);
      if (initialValues) {
        onSave({ ...initialValues, ...result });
      } else {
        onSave({ id: uuidV4(), exercises: [], ...result });
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.AppField
        name="name"
        children={(field) => {
          return (
            <field.AppTextInput
              withAsterisk
              label="Name"
              placeholder="Monday"
              description="Label for the day. For example: A, B, Monday, Tuesday, etc."
            />
          );
        }}
      />
      <form.AppForm>
        <Flex justify="flex-end" mt="lg">
          <form.AppSubmitButton />
        </Flex>
      </form.AppForm>
    </form>
  );
}
