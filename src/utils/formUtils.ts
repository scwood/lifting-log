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
