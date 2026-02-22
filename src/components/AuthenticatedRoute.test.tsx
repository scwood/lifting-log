import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { useAuth } from "../hooks/useAuth";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { makeAuthContext } from "../test-utils/factories";
import { AuthenticatedRoute } from "./AuthenticatedRoute";

vi.mock("../hooks/useAuth");

const mockUseAuth = vi.mocked(useAuth);

function renderInRouter(initialPath = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<AuthenticatedRoute />}>
          <Route path="dashboard" element={<OutletSpy />} />
        </Route>
        <Route path="/sign-in" element={<div>Sign In Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function OutletSpy() {
  const { userId } = useCurrentUser();
  return <div data-testid="outlet">userId={userId ?? "none"}</div>;
}

describe("AuthenticatedRoute", () => {
  describe("when userId is null (unauthenticated)", () => {
    it("redirects to /sign-in", () => {
      mockUseAuth.mockReturnValue(makeAuthContext({ userId: null }));
      renderInRouter();
      expect(screen.getByText("Sign In Page")).toBeDefined();
    });

    it("does not render outlet content", () => {
      mockUseAuth.mockReturnValue(makeAuthContext({ userId: null }));
      renderInRouter();
      expect(screen.queryByTestId("outlet")).toBeNull();
    });
  });

  describe("when userId is set (authenticated)", () => {
    it("renders the outlet content", () => {
      mockUseAuth.mockReturnValue(makeAuthContext({ userId: "user-123" }));
      renderInRouter();
      expect(screen.getByTestId("outlet")).toBeDefined();
    });

    it("does not render the sign-in page", () => {
      mockUseAuth.mockReturnValue(makeAuthContext({ userId: "user-123" }));
      renderInRouter();
      expect(screen.queryByText("Sign In Page")).toBeNull();
    });

    it("provides the userId via currentUserContext", () => {
      mockUseAuth.mockReturnValue(makeAuthContext({ userId: "user-123" }));
      renderInRouter();
      expect(screen.getByTestId("outlet").textContent).toBe("userId=user-123");
    });
  });
});
