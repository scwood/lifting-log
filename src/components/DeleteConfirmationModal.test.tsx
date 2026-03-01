import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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
    title: "Delete workout",
    children: "Are you sure?",
    onClose: vi.fn(),
    onDelete: vi.fn(),
    ...propsOverrides,
  };
  render(
    <MantineProvider env="test">
      <DeleteConfirmationModal {...props} />
    </MantineProvider>,
  );
  return { user, ...props };
}

describe("DeleteConfirmationModal", () => {
  it("renders the modal title", () => {
    renderModal({ title: "Delete exercise" });
    expect(screen.getByText("Delete exercise")).toBeInTheDocument();
  });

  it("renders children as the body content", () => {
    renderModal({ children: "This will remove it from every day." });
    expect(
      screen.getByText("This will remove it from every day."),
    ).toBeInTheDocument();
  });

  it("does not render modal content when opened is false", () => {
    renderModal({ opened: false, title: "Delete exercise" });
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
