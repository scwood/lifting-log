import { Radio, RadioGroupProps } from "@mantine/core";

import { useFieldContext } from "../../contexts/formHookContexts";
import { getFieldErrors } from "../../utils/formUtils";

export function AppRadioGroup(props: RadioGroupProps) {
  const field = useFieldContext<string>();

  return (
    <Radio.Group
      value={field.state.value}
      onChange={(value) => field.handleChange(value)}
      error={getFieldErrors(field)}
      {...props}
    />
  );
}
