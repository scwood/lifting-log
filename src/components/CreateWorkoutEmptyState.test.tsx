import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { testTheme } from "../test-utils/testTheme";
import {
  CreateWorkoutEmptyState,
  CreateWorkoutEmptyStateProps,
} from "./CreateWorkoutEmptyState";

function renderCreateWorkoutEmptyState(
  propsOverrides: Partial<CreateWorkoutEmptyStateProps> = {},
) {
  const user = userEvent.setup();
  const props: CreateWorkoutEmptyStateProps = {
    onCreate: vi.fn(),
    isPending: false,
    ...propsOverrides,
  };

  render(
    <MantineProvider theme={testTheme}>
      <CreateWorkoutEmptyState {...props} />
    </MantineProvider>,
  );

  return { ...props, user };
}

describe("CreateWorkoutEmptyState", () => {
  it("renders the create button", () => {
    renderCreateWorkoutEmptyState();

    expect(
      screen.getByRole("button", { name: "Create workout plan" }),
    ).toBeInTheDocument();
  });

  it("calls onCreate when the button is clicked", async () => {
    const { user, onCreate } = renderCreateWorkoutEmptyState();

    await user.click(
      screen.getByRole("button", { name: "Create workout plan" }),
    );

    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("shows loading state when pending", () => {
    renderCreateWorkoutEmptyState({ isPending: true });

    expect(
      screen.getByRole("button", { name: "Create workout plan" }),
    ).toBeDisabled();
  });
});
