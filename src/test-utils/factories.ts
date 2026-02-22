import { vi } from "vitest";

import { AuthContext } from "../contexts/authContext";

export function makeAuthContext(
  overrides: Partial<AuthContext> = {},
): AuthContext {
  return {
    userId: null,
    displayName: null,
    isLoading: false,
    error: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    ...overrides,
  };
}
