import { TextInput, TextInputProps } from "@mantine/core";

import { useFieldContext } from "../../contexts/formHookContexts";
import { getFieldErrors } from "../../utils/formUtils";

export function AppTextInput(props: TextInputProps) {
  const field = useFieldContext<string>();

  return (
    <TextInput
      value={field.state.value}
      onChange={(e) => field.handleChange(e.currentTarget.value)}
      error={getFieldErrors(field)}
      {...props}
    />
  );
}
