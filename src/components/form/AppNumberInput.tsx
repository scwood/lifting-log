import { NumberInput, NumberInputProps } from "@mantine/core";

import { useFieldContext } from "../../contexts/formHookContexts";
import { getFieldErrors } from "../../utils/formUtils";

export function AppNumberInput(props: NumberInputProps) {
  const field = useFieldContext<number | string>();

  return (
    <NumberInput
      value={field.state.value}
      onChange={(value) => field.handleChange(value)}
      error={getFieldErrors(field)}
      {...props}
    />
  );
}
