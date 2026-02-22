import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { useAuth } from "../hooks/useAuth";
import { makeAuthContext } from "../test-utils/factories";
import { AppShell } from "./AppShell";

vi.mock("../hooks/useAuth");

const mockUseAuth = vi.mocked(useAuth);

function renderAppShell(initialPath = "/") {
  const user = userEvent.setup();
  const result = render(
    <MantineProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </MemoryRouter>
    </MantineProvider>,
  );
  return { user, ...result };
}

describe("AppShell", () => {
  describe("when unauthenticated (userId is null)", () => {
    it("does not render the navigation tabs", () => {
      mockUseAuth.mockReturnValue(makeAuthContext({ userId: null }));
      renderAppShell();
      expect(screen.queryByRole("tablist")).toBeNull();
    });

    it("does not render the user menu", () => {
      mockUseAuth.mockReturnValue(makeAuthContext({ userId: null }));
      renderAppShell();
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("when authenticated (userId is set)", () => {
    it("renders all navigation tabs", () => {
      mockUseAuth.mockReturnValue(makeAuthContext({ userId: "user-123" }));
      renderAppShell();
      expect(
        screen.getByRole("tab", { name: "Current workout" }),
      ).toBeDefined();
      expect(screen.getByRole("tab", { name: "Workout plan" })).toBeDefined();
      expect(screen.getByRole("tab", { name: "History" })).toBeDefined();
    });

    it("highlights the tab that matches the current path", () => {
      mockUseAuth.mockReturnValue(makeAuthContext({ userId: "user-123" }));
      renderAppShell("/plan");
      expect(
        screen.getByRole("tab", { name: "Workout plan", selected: true }),
      ).toBeDefined();
    });

    it("renders the user menu trigger", () => {
      mockUseAuth.mockReturnValue(makeAuthContext({ userId: "user-123" }));
      renderAppShell();
      expect(screen.getByRole("button")).toBeDefined();
    });

    describe("user menu dropdown", () => {
      it("shows the sign out option", async () => {
        mockUseAuth.mockReturnValue(makeAuthContext({ userId: "user-123" }));
        const { user } = renderAppShell();
        await user.click(screen.getByRole("button"));
        expect(await screen.findByText("Sign out")).toBeDefined();
      });

      it("does not show a display name item when displayName is null", async () => {
        mockUseAuth.mockReturnValue(
          makeAuthContext({ userId: "user-123", displayName: null }),
        );
        const { user } = renderAppShell();
        await user.click(screen.getByRole("button"));
        const items = await screen.findAllByRole("menuitem");
        expect(items).toHaveLength(1);
      });

      it("shows a display name item when displayName is set", async () => {
        mockUseAuth.mockReturnValue(
          makeAuthContext({ userId: "user-123", displayName: "Spencer" }),
        );
        const { user } = renderAppShell();
        await user.click(screen.getByRole("button"));
        await waitFor(() => {
          expect(screen.getByText("Spencer")).toBeDefined();
          expect(screen.getAllByRole("menuitem")).toHaveLength(2);
        });
      });

      it("calls signOut when the sign out option is clicked", async () => {
        const signOut = vi.fn();
        mockUseAuth.mockReturnValue(
          makeAuthContext({ userId: "user-123", signOut }),
        );
        const { user } = renderAppShell();
        await user.click(screen.getByRole("button"));
        await user.click(await screen.findByText("Sign out"));
        expect(signOut).toHaveBeenCalledOnce();
      });
    });
  });
});
