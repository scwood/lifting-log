import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeDay } from "../test-utils/factories";
import { DayForm, DayFormProps } from "./DayForm";

const testUuid = "test-uuid";
vi.mock("uuid", () => ({ v4: () => testUuid }));

function renderDayForm(props: Partial<DayFormProps> = {}) {
  const user = userEvent.setup();
  const onSave = props.onSave ?? vi.fn();
  render(
    <MantineProvider>
      <DayForm onSave={onSave} defaultValues={props.defaultValues} />
    </MantineProvider>,
  );
  return { user, onSave };
}

describe("DayForm", () => {
  it("starts with an empty name field when no defaultValues are provided", () => {
    renderDayForm();
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("");
  });

  it("disables the Save button when name is empty", () => {
    renderDayForm();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  describe("with defaultValues", () => {
    it("pre-fills the name field", () => {
      renderDayForm({ defaultValues: makeDay({ name: "Monday" }) });
      expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue(
        "Monday",
      );
    });

    it("enables the Save button", () => {
      renderDayForm({ defaultValues: makeDay({ name: "Monday" }) });
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });
  });

  describe("validation", () => {
    it("enables the Save button after typing a name", async () => {
      const { user } = renderDayForm();
      await user.type(screen.getByRole("textbox", { name: "Name" }), "Monday");
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });

    it("disables the Save button when name is cleared", async () => {
      const { user } = renderDayForm({
        defaultValues: makeDay({ name: "Monday" }),
      });
      await user.clear(screen.getByRole("textbox", { name: "Name" }));
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });

    it("disables the Save button for a whitespace-only name", async () => {
      const { user } = renderDayForm();
      await user.type(screen.getByRole("textbox", { name: "Name" }), "   ");
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });
  });

  describe("onSave", () => {
    it("creates a new Day with a generated id when no defaultValues", async () => {
      const onSave = vi.fn();
      const { user } = renderDayForm({ onSave });
      await user.type(screen.getByRole("textbox", { name: "Name" }), "Monday");
      await user.click(screen.getByRole("button", { name: "Save" }));
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({
          id: testUuid,
          exercises: [],
          name: "Monday",
        });
      });
    });

    it("merges the updated name into defaultValues when editing", async () => {
      const day = makeDay({ id: "day1", name: "Monday" });
      const onSave = vi.fn();
      const { user } = renderDayForm({ defaultValues: day, onSave });
      const nameInput = screen.getByRole("textbox", { name: "Name" });
      await user.clear(nameInput);
      await user.type(nameInput, "Tuesday");
      await user.click(screen.getByRole("button", { name: "Save" }));
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({ ...day, name: "Tuesday" });
      });
    });
  });
});
