import { Text } from "@mantine/core";
import { FormErrors } from "@mantine/form";

export interface FormErrorsSummaryProps {
  form: { errors: FormErrors };
}

export function FormErrorsSummary(props: FormErrorsSummaryProps) {
  const { form } = props;
  const errors = Object.values(form.errors);

  if (errors.length === 0) {
    return null;
  }

  return (
    <Text c="red.8" fz="small">
      Please correct the highlighted field{errors.length > 1 ? "s" : ""}.
    </Text>
  );
}
