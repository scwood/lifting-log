import { createContext } from "react";

import { SignInProvider } from "../types/SignInProvider";

export interface AuthContext {
  userId: string | null;
  displayName: string | null;
  error: Error | null;
  signIn: (provider: SignInProvider) => void;
  signOut: () => void;
}

export const authContext = createContext<AuthContext | null>(null);
