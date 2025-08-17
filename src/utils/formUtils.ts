import { AnyFieldApi } from "@tanstack/react-form";

export function getFieldErrors(field: AnyFieldApi) {
  return field.state.meta.isTouched && !field.state.meta.isValid
    ? field.state.meta.errors.map((error) => error.message).join(", ")
    : undefined;
}
