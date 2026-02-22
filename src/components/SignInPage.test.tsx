import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { useAuth } from "../hooks/useAuth";
import { makeAuthContext } from "../test-utils/factories";
import { SignInProvider } from "../types/SignInProvider";
import { SignInPage } from "./SignInPage";

vi.mock("../hooks/useAuth");

const mockUseAuth = vi.mocked(useAuth);

function renderSignInPage() {
  const user = userEvent.setup();
  const result = render(
    <MantineProvider>
      <MemoryRouter initialEntries={["/sign-in"]}>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </MantineProvider>,
  );
  return { user, ...result };
}

describe("SignInPage", () => {
  describe("when already signed in (userId is set)", () => {
    it("redirects to /", () => {
      mockUseAuth.mockReturnValue(makeAuthContext({ userId: "user-123" }));
      renderSignInPage();
      expect(screen.getByText("Home")).toBeDefined();
    });

    it("does not render sign-in buttons", () => {
      mockUseAuth.mockReturnValue(makeAuthContext({ userId: "user-123" }));
      renderSignInPage();
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("when not signed in (userId is null)", () => {
    it("renders the GitHub sign-in button", () => {
      mockUseAuth.mockReturnValue(makeAuthContext());
      renderSignInPage();
      expect(screen.getByRole("button", { name: /github/i })).toBeDefined();
    });

    it("renders the Google sign-in button", () => {
      mockUseAuth.mockReturnValue(makeAuthContext());
      renderSignInPage();
      expect(screen.getByRole("button", { name: /google/i })).toBeDefined();
    });

    it("does not show an error alert", () => {
      mockUseAuth.mockReturnValue(makeAuthContext({ error: null }));
      renderSignInPage();
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  describe("when there is an auth error", () => {
    it("shows the error message in an alert", () => {
      mockUseAuth.mockReturnValue(
        makeAuthContext({ error: new Error("Sign-in failed") }),
      );
      renderSignInPage();
      expect(screen.getByRole("alert")).toBeDefined();
      expect(screen.getByText("Sign-in failed")).toBeDefined();
    });
  });

  describe("when clicking sign-in buttons", () => {
    it("calls signIn with GitHub provider and navigates to /", async () => {
      const signIn = vi.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue(makeAuthContext({ signIn }));
      const { user } = renderSignInPage();
      await user.click(screen.getByRole("button", { name: /github/i }));
      expect(signIn).toHaveBeenCalledWith(SignInProvider.GitHub);
      expect(screen.getByText("Home")).toBeDefined();
    });

    it("calls signIn with Google provider and navigates to /", async () => {
      const signIn = vi.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue(makeAuthContext({ signIn }));
      const { user } = renderSignInPage();
      await user.click(screen.getByRole("button", { name: /google/i }));
      expect(signIn).toHaveBeenCalledWith(SignInProvider.Google);
      expect(screen.getByText("Home")).toBeDefined();
    });
  });
});
