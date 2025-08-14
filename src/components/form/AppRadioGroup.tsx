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

// <TextInput
//   value={field.state.value}
//   onChange={(e) => field.handleChange(e.currentTarget.value)}
//   error={
//     field.state.meta.isTouched && !field.state.meta.isValid
//       ? field.state.meta.errors.map((error) => error.message).join(", ")
//       : undefined
//   }
//   {...props}
// />
