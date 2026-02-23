import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { testTheme } from "../test-utils/testTheme";
import {
  DeleteConfirmationModal,
  DeleteConfirmationModalProps,
} from "./DeleteConfirmationModal";

function renderModal(
  propsOverrides: Partial<DeleteConfirmationModalProps> = {},
) {
  const user = userEvent.setup();
  const props: DeleteConfirmationModalProps = {
    opened: true,
    itemName: "workout",
    onClose: vi.fn(),
    onDelete: vi.fn(),
    ...propsOverrides,
  };
  render(
    <MantineProvider theme={testTheme}>
      <DeleteConfirmationModal {...props} />
    </MantineProvider>,
  );
  return { user, ...props };
}

describe("DeleteConfirmationModal", () => {
  it("renders the modal title with itemName", () => {
    renderModal({ itemName: "exercise" });
    expect(screen.getByText("Delete exercise")).toBeInTheDocument();
  });

  it("renders the confirmation message with itemName", () => {
    renderModal({ itemName: "exercise" });
    expect(
      screen.getByText(
        "Are you sure you want to permanently delete this exercise?",
      ),
    ).toBeInTheDocument();
  });

  it("does not render modal content when opened is false", () => {
    renderModal({ opened: false, itemName: "exercise" });
    expect(screen.queryByText("Delete exercise")).not.toBeInTheDocument();
  });

  describe("Cancel button", () => {
    it("calls onClose when clicked", async () => {
      const { user, onClose } = renderModal();
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe("Delete button", () => {
    it("calls onDelete when clicked", async () => {
      const { user, onDelete } = renderModal();
      await user.click(screen.getByRole("button", { name: "Delete" }));
      expect(onDelete).toHaveBeenCalledOnce();
    });

    it("calls onClose when clicked", async () => {
      const { user, onClose } = renderModal();
      await user.click(screen.getByRole("button", { name: "Delete" }));
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
