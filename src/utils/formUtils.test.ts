import { AnyFieldApi } from "@tanstack/react-form";
import { describe, expect, it } from "vitest";

import { getFieldErrors } from "./formUtils";

// Build a minimal AnyFieldApi stub — only the properties getFieldErrors reads.
function makeField(opts: {
  isTouched: boolean;
  isValid: boolean;
  errors: Array<{ message: string }>;
}): AnyFieldApi {
  return {
    state: {
      meta: {
        isTouched: opts.isTouched,
        isValid: opts.isValid,
        errors: opts.errors,
      },
    },
  } as unknown as AnyFieldApi;
}

describe("getFieldErrors", () => {
  describe("when the field has not been touched", () => {
    it("returns undefined even when the field is invalid", () => {
      const field = makeField({
        isTouched: false,
        isValid: false,
        errors: [{ message: "Required" }],
      });
      expect(getFieldErrors(field)).toBeUndefined();
    });

    it("returns undefined when the field is valid", () => {
      const field = makeField({ isTouched: false, isValid: true, errors: [] });
      expect(getFieldErrors(field)).toBeUndefined();
    });
  });

  describe("when the field has been touched", () => {
    it("returns undefined when the field is valid", () => {
      const field = makeField({ isTouched: true, isValid: true, errors: [] });
      expect(getFieldErrors(field)).toBeUndefined();
    });

    it("returns the error message when there is a single error", () => {
      const field = makeField({
        isTouched: true,
        isValid: false,
        errors: [{ message: "Required" }],
      });
      expect(getFieldErrors(field)).toBe("Required");
    });

    it("joins multiple error messages with a comma and space", () => {
      const field = makeField({
        isTouched: true,
        isValid: false,
        errors: [
          { message: "Must be at least 1" },
          { message: "Must be a number" },
        ],
      });
      expect(getFieldErrors(field)).toBe(
        "Must be at least 1, Must be a number",
      );
    });

    it("returns an empty string when invalid but the errors array is empty", () => {
      const field = makeField({ isTouched: true, isValid: false, errors: [] });
      expect(getFieldErrors(field)).toBe("");
    });
  });
});
