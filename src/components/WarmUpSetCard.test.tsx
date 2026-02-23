import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeWarmUpSet } from "../test-utils/factories";
import { testTheme } from "../test-utils/testTheme";
import { WarmUpType } from "../types/WarmUpType";
import { WarmUpSetCard, WarmUpSetCardProps } from "./WarmUpSetCard";

function renderCard(propsOverrides: Partial<WarmUpSetCardProps> = {}) {
  const user = userEvent.setup();
  const props: WarmUpSetCardProps = {
    warmUpSet: makeWarmUpSet(),
    moveUpDisabled: false,
    moveDownDisabled: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    ...propsOverrides,
  };
  render(
    <MantineProvider theme={testTheme}>
      <WarmUpSetCard {...props} />
    </MantineProvider>,
  );
  return { user, ...props };
}

describe("WarmUpSetCard", () => {
  describe("display text", () => {
    it("shows plural reps and percentage suffix for Percentage type", () => {
      renderCard();
      expect(
        screen.getByText(/5 reps with 60% of working weight/),
      ).toBeInTheDocument();
    });

    it("uses singular rep when reps is 1", () => {
      renderCard({ warmUpSet: makeWarmUpSet({ reps: 1 }) });
      expect(screen.getByText(/1 rep with/)).toBeInTheDocument();
    });

    it("omits the percentage suffix for Weight type", () => {
      renderCard({ warmUpSet: makeWarmUpSet({ type: WarmUpType.Weight }) });
      expect(screen.queryByText(/% of working weight/)).not.toBeInTheDocument();
    });
  });

  describe("menu", () => {
    it("calls onMoveUp with the warmUpSet when Move up is clicked", async () => {
      const warmUpSet = makeWarmUpSet();
      const { user, onMoveUp } = renderCard({ warmUpSet });
      await user.click(screen.getByRole("button"));
      await user.click(screen.getByText("Move up"));
      expect(onMoveUp).toHaveBeenCalledWith(warmUpSet);
    });

    it("calls onMoveDown with the warmUpSet when Move down is clicked", async () => {
      const warmUpSet = makeWarmUpSet();
      const { user, onMoveDown } = renderCard({ warmUpSet });
      await user.click(screen.getByRole("button"));
      await user.click(screen.getByText("Move down"));
      expect(onMoveDown).toHaveBeenCalledWith(warmUpSet);
    });

    it("calls onEdit with the warmUpSet when Edit is clicked", async () => {
      const warmUpSet = makeWarmUpSet();
      const { user, onEdit } = renderCard({ warmUpSet });
      await user.click(screen.getByRole("button"));
      await user.click(screen.getByText("Edit"));
      expect(onEdit).toHaveBeenCalledWith(warmUpSet);
    });

    it("calls onDelete with the warmUpSet when Delete is clicked", async () => {
      const warmUpSet = makeWarmUpSet();
      const { user, onDelete } = renderCard({ warmUpSet });
      await user.click(screen.getByRole("button"));
      await user.click(screen.getByText("Delete"));
      expect(onDelete).toHaveBeenCalledWith(warmUpSet);
    });

    it("disables Move up when moveUpDisabled is true", async () => {
      const { user } = renderCard({ moveUpDisabled: true });
      await user.click(screen.getByRole("button"));
      expect(screen.getByText("Move up").closest("button")).toBeDisabled();
    });

    it("disables Move down when moveDownDisabled is true", async () => {
      const { user } = renderCard({ moveDownDisabled: true });
      await user.click(screen.getByRole("button"));
      expect(screen.getByText("Move down").closest("button")).toBeDisabled();
    });
  });
});
