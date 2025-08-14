import { AnyFieldApi } from "@tanstack/react-form";

const requiredMessage = "Required field";

export function validateNumberNotEmpty(value: number) {
  return isNaN(parseFloat(String(value))) ? requiredMessage : null;
}

export function validateNumberGreaterThanZero(value: number) {
  const parsedNumber = parseFloat(String(value));
  if (isNaN(parsedNumber) || parsedNumber <= 0) {
    return "Must be greater than zero";
  }
  return null;
}

export function validateTextNotEmpty(value: string) {
  return value.trim() === "" ? requiredMessage : null;
}

export function getFieldErrors(field: AnyFieldApi) {
  return field.state.meta.isTouched && !field.state.meta.isValid
    ? field.state.meta.errors.map((error) => error.message).join(", ")
    : undefined;
}
