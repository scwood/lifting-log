import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { currentUserContext } from "../contexts/currentUserContext";
import { makeCurrentUserContext } from "../test-utils/factories";
import { useCurrentUser } from "./useCurrentUser";

describe("useCurrentUser", () => {
  it("returns the context value when used inside a CurrentUserProvider", () => {
    const value = makeCurrentUserContext({ userId: "u1" });
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <currentUserContext.Provider value={value}>
          {children}
        </currentUserContext.Provider>
      ),
    });
    expect(result.current).toBe(value);
  });

  it("throws when used outside a CurrentUserProvider", () => {
    expect(() => renderHook(() => useCurrentUser())).toThrow(
      "useCurrentUser must be used within a CurrentUserProvider",
    );
  });
});
