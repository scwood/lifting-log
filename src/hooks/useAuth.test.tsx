import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { authContext } from "../contexts/authContext";
import { makeAuthContext } from "../test-utils/factories";
import { useAuth } from "./useAuth";

describe("useAuth", () => {
  it("returns the context value when used inside an AuthProvider", () => {
    const value = makeAuthContext({ userId: "u1", displayName: "Alice" });
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <authContext.Provider value={value}>{children}</authContext.Provider>
      ),
    });
    expect(result.current).toBe(value);
  });

  it("throws when used outside an AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used inside an AuthProvider",
    );
  });
});
