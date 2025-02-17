import { Navigate, Outlet } from "react-router";

import { useAuth } from "../hooks/useAuth";
import { CurrentUserProvider } from "./CurrentUserProvider";

export function AuthenticatedRoute() {
  const { userId } = useAuth();

  if (!userId) {
    return <Navigate to="/sign-in" />;
  } else {
    return (
      <CurrentUserProvider userId={userId}>
        <Outlet />
      </CurrentUserProvider>
    );
  }
}
