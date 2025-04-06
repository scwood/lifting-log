import {
  GithubAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
} from "firebase/auth";
import { useEffect, useState, JSX } from "react";

import { authContext } from "../contexts/authContext";

export interface AuthProviderProps {
  children?: JSX.Element;
}

export function AuthProvider(props: AuthProviderProps) {
  const { children } = props;
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    return getAuth().onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        setDisplayName(user.displayName);
      } else {
        setUserId(null);
        setDisplayName(null);
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <authContext.Provider
      value={{
        isLoading,
        error,
        userId,
        displayName,
        signIn,
        signOut,
      }}
    >
      {isLoading ? null : children}
    </authContext.Provider>
  );

  async function signIn(provider: "google" | "github") {
    try {
      await signInWithPopup(
        getAuth(),
        provider === "github"
          ? new GithubAuthProvider()
          : new GoogleAuthProvider()
      );
      setError(null);
    } catch (error) {
      setError(error as Error);
    }
  }

  async function signOut() {
    try {
      await getAuth().signOut();
      setError(null);
    } catch (error) {
      setError(error as Error);
    }
  }
}
