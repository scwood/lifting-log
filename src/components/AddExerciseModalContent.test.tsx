import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeExerciseDefinition, makeWorkout } from "../test-utils/factories";
import {
  AddExerciseModalContent,
  AddExerciseModalContentProps,
} from "./AddExerciseModalContent";

function renderContent(
  propsOverrides: Partial<AddExerciseModalContentProps> = {},
) {
  const user = userEvent.setup();
  const props: AddExerciseModalContentProps = {
    workout: makeWorkout({
      exerciseDefinitionsById: {
        def1: makeExerciseDefinition({ id: "def1", name: "Squat" }),
        def2: makeExerciseDefinition({ id: "def2", name: "Bench Press" }),
      },
    }),
    onSave: vi.fn(),
    onCreateNew: vi.fn(),
    ...propsOverrides,
  };
  render(
    <MantineProvider env="test">
      <AddExerciseModalContent {...props} />
    </MantineProvider>,
  );
  return { user, ...props };
}

describe("AddExerciseModalContent", () => {
  it("renders the add existing exercise section", () => {
    renderContent();
    expect(screen.getByText("Add existing exercise")).toBeInTheDocument();
  });

  it("renders the create new exercise section", () => {
    renderContent();
    expect(
      screen.getByRole("heading", { name: "Create new exercise" }),
    ).toBeInTheDocument();
  });

  it("renders exercise definitions as select options sorted alphabetically", async () => {
    const { user } = renderContent();
    await user.click(
      screen.getByRole("textbox", { name: "Existing exercise" }),
    );
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Bench Press");
    expect(options[1]).toHaveTextContent("Squat");
  });

  it("renders no options when workout has no exercise definitions", async () => {
    const { user } = renderContent({
      workout: makeWorkout({ exerciseDefinitionsById: {} }),
    });
    await user.click(
      screen.getByRole("textbox", { name: "Existing exercise" }),
    );
    expect(screen.getByText("No exercises found")).toBeInTheDocument();
  });

  describe("Save button", () => {
    it("is disabled when no exercise is selected", () => {
      renderContent();
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });

    it("is enabled after selecting an exercise", async () => {
      const { user } = renderContent();
      await user.click(
        screen.getByRole("textbox", { name: "Existing exercise" }),
      );
      await user.click(screen.getByRole("option", { name: "Squat" }));
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });

    it("calls onSave with selected exercise definition id", async () => {
      const { user, onSave } = renderContent();
      await user.click(
        screen.getByRole("textbox", { name: "Existing exercise" }),
      );
      await user.click(screen.getByRole("option", { name: "Squat" }));
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onSave).toHaveBeenCalledOnce();
      expect(onSave).toHaveBeenCalledWith("def1");
    });
  });

  describe("Create new exercise button", () => {
    it("calls onCreateNew when clicked", async () => {
      const { user, onCreateNew } = renderContent();
      await user.click(
        screen.getByRole("button", { name: "Create new exercise" }),
      );
      expect(onCreateNew).toHaveBeenCalledOnce();
    });
  });
});
