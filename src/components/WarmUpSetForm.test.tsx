import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeWarmUpSet } from "../test-utils/factories";
import { WarmUpType } from "../types/WarmUpType";
import { WarmUpSetForm, WarmUpSetFormProps } from "./WarmUpSetForm";

const testUuid = "test-uuid";
vi.mock("uuid", () => ({ v4: () => testUuid }));

function renderWarmUpSetForm(props: Partial<WarmUpSetFormProps> = {}) {
  const user = userEvent.setup();
  const onSave = props.onSave ?? vi.fn();
  render(
    <MantineProvider>
      <WarmUpSetForm onSave={onSave} defaultValues={props.defaultValues} />
    </MantineProvider>,
  );
  return { user, onSave };
}

describe("WarmUpSetForm", () => {
  describe("initial state without defaultValues", () => {
    it("selects Percentage as the default type", () => {
      renderWarmUpSetForm();
      expect(
        screen.getByRole("radio", { name: "Percentage of working weight" }),
      ).toBeChecked();
    });

    it("leaves the Reps field empty", () => {
      renderWarmUpSetForm();
      expect(screen.getByRole("textbox", { name: "Reps" })).toHaveValue("");
    });

    it("shows the value field labeled Percentage", () => {
      renderWarmUpSetForm();
      expect(screen.getByRole("textbox", { name: "Percentage" })).toBeDefined();
    });

    it("disables the Save button", () => {
      renderWarmUpSetForm();
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });
  });

  describe("with defaultValues", () => {
    it("selects the correct type radio", () => {
      renderWarmUpSetForm({
        defaultValues: makeWarmUpSet({ type: WarmUpType.Weight }),
      });
      expect(screen.getByRole("radio", { name: "Fixed weight" })).toBeChecked();
    });

    it("pre-fills the Reps field", () => {
      renderWarmUpSetForm({ defaultValues: makeWarmUpSet({ reps: 8 }) });
      expect(screen.getByRole("textbox", { name: "Reps" })).toHaveValue("8");
    });

    it("pre-fills the value field", () => {
      renderWarmUpSetForm({
        defaultValues: makeWarmUpSet({
          type: WarmUpType.Percentage,
          value: 60,
        }),
      });
      expect(screen.getByRole("textbox", { name: "Percentage" })).toHaveValue(
        "60",
      );
    });

    it("enables the Save button", () => {
      renderWarmUpSetForm({ defaultValues: makeWarmUpSet() });
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });
  });

  describe("type selection", () => {
    it("changes the value field label to Weight when Fixed weight is selected", async () => {
      const { user } = renderWarmUpSetForm();
      await user.click(screen.getByRole("radio", { name: "Fixed weight" }));
      expect(screen.getByRole("textbox", { name: "Weight" })).toBeDefined();
    });

    it("changes the value field label back to Percentage when Percentage is re-selected", async () => {
      const { user } = renderWarmUpSetForm({
        defaultValues: makeWarmUpSet({ type: WarmUpType.Weight }),
      });
      await user.click(
        screen.getByRole("radio", { name: "Percentage of working weight" }),
      );
      expect(screen.getByRole("textbox", { name: "Percentage" })).toBeDefined();
    });
  });

  describe("validation", () => {
    it("enables the Save button after filling in Reps and value", async () => {
      const { user } = renderWarmUpSetForm();
      await user.type(screen.getByRole("textbox", { name: "Reps" }), "5");
      await user.type(
        screen.getByRole("textbox", { name: "Percentage" }),
        "60",
      );
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });

    it("disables the Save button when Reps is cleared", async () => {
      const { user } = renderWarmUpSetForm({
        defaultValues: makeWarmUpSet(),
      });
      await user.clear(screen.getByRole("textbox", { name: "Reps" }));
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });

    it("disables the Save button when the value field is cleared", async () => {
      const { user } = renderWarmUpSetForm({
        defaultValues: makeWarmUpSet(),
      });
      await user.clear(screen.getByRole("textbox", { name: "Percentage" }));
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });
  });

  describe("onSave", () => {
    it("creates a new WarmUpSet with a generated id when no defaultValues", async () => {
      const onSave = vi.fn();
      const { user } = renderWarmUpSetForm({ onSave });
      await user.type(screen.getByRole("textbox", { name: "Reps" }), "5");
      await user.type(
        screen.getByRole("textbox", { name: "Percentage" }),
        "60",
      );
      await user.click(screen.getByRole("button", { name: "Save" }));
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({
          id: testUuid,
          type: WarmUpType.Percentage,
          reps: 5,
          value: 60,
        });
      });
    });

    it("merges updates into defaultValues when editing", async () => {
      const warmUpSet = makeWarmUpSet({ reps: 5, value: 60 });
      const onSave = vi.fn();
      const { user } = renderWarmUpSetForm({
        defaultValues: warmUpSet,
        onSave,
      });
      const repsInput = screen.getByRole("textbox", { name: "Reps" });
      await user.clear(repsInput);
      await user.type(repsInput, "8");
      await user.click(screen.getByRole("button", { name: "Save" }));
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({ ...warmUpSet, reps: 8 });
      });
    });
  });
});
