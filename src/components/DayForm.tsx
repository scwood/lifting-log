import { Flex } from "@mantine/core";
import { v4 as uuidV4 } from "uuid";
import { z } from "zod";

import { useAppForm } from "../hooks/useAppForm";
import { Day } from "../types/Day";

export interface DayFormProps {
  defaultValues?: Day;
  onSave: (day: Day) => void;
}

const formSchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
});

export function DayForm(props: DayFormProps) {
  const { defaultValues, onSave } = props;

  const form = useAppForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
    },
    validators: {
      onMount: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      const parsedValues = formSchema.parse(value);
      if (defaultValues) {
        onSave({ ...defaultValues, ...parsedValues });
      } else {
        onSave({ id: uuidV4(), exercises: [], ...parsedValues });
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
