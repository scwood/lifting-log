import { TextInput, TextInputProps } from "@mantine/core";

import { useFieldContext } from "../../contexts/formHookContexts";

export function AppTextInput(props: TextInputProps) {
  const field = useFieldContext<string>();

  return (
    <TextInput
      value={field.state.value}
      onChange={(e) => field.handleChange(e.currentTarget.value)}
      error={
        field.state.meta.isTouched && !field.state.meta.isValid
          ? field.state.meta.errors.map((error) => error.message).join(", ")
          : undefined
      }
      {...props}
    />
  );
}
