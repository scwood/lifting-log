import {
  GithubAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

import { authContext } from "../contexts/authContext";
import { SignInProvider } from "../types/SignInProvider";

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

  const signIn = useCallback(async (provider: SignInProvider) => {
    try {
      await signInWithPopup(
        getAuth(),
        provider === SignInProvider.GitHub
          ? new GithubAuthProvider()
          : new GoogleAuthProvider()
      );
      setError(null);
    } catch (error) {
      setError(error as Error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await getAuth().signOut();
      setError(null);
    } catch (error) {
      setError(error as Error);
    }
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
}
