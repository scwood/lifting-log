const requiredMessage = "Required field";

export function validateNumberInput(value: number) {
  return isNaN(parseInt(String(value))) ? requiredMessage : null;
}

export function validateTextInput(value: string) {
  return value.trim() === "" ? requiredMessage : null;
}
