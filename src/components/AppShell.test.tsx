import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { useAuth } from "../hooks/useAuth";
import { makeAuthContext } from "../test-utils/factories";
import { testTheme } from "../test-utils/testTheme";
import { AppShell } from "./AppShell";

vi.mock("../hooks/useAuth");

const mockUseAuth = vi.mocked(useAuth);

function renderAppShell(initialPath = "/") {
  const user = userEvent.setup();
  const result = render(
    <MantineProvider theme={testTheme}>
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
      expect(screen.getByRole("button", { name: "User menu" })).toBeDefined();
    });

    describe("user menu dropdown", () => {
      it("shows the sign out option", async () => {
        mockUseAuth.mockReturnValue(makeAuthContext({ userId: "user-123" }));
        const { user } = renderAppShell();
        await user.click(screen.getByRole("button", { name: "User menu" }));
        expect(screen.getByText("Sign out")).toBeDefined();
      });

      it("shows 'Unknown user' when displayName is null", async () => {
        mockUseAuth.mockReturnValue(
          makeAuthContext({ userId: "user-123", displayName: null }),
        );
        const { user } = renderAppShell();
        await user.click(screen.getByRole("button", { name: "User menu" }));
        expect(screen.getByText("Unknown user")).toBeDefined();
      });

      it("shows a display name item when displayName is set", async () => {
        mockUseAuth.mockReturnValue(
          makeAuthContext({ userId: "user-123", displayName: "Spencer" }),
        );
        const { user } = renderAppShell();
        await user.click(screen.getByRole("button", { name: "User menu" }));
        expect(screen.getByText("Spencer")).toBeDefined();
      });

      it("calls signOut when the sign out option is clicked", async () => {
        const signOut = vi.fn();
        mockUseAuth.mockReturnValue(
          makeAuthContext({ userId: "user-123", signOut }),
        );
        const { user } = renderAppShell();
        await user.click(screen.getByRole("button", { name: "User menu" }));
        await user.click(screen.getByText("Sign out"));
        expect(signOut).toHaveBeenCalledOnce();
      });
    });
  });
});
