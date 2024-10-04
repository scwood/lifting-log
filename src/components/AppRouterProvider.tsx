import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";

import { HistoryTab } from "./HistoryTab";
import { Layout } from "./Layout";
import { SignInPage } from "./SignInPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { CurrentWorkoutTab } from "./CurrentWorkoutTab";
import { PlanWorkoutTab } from "./PlanWorkoutTab";

const hashRouter = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <CurrentWorkoutTab />,
          },
          {
            path: "plan",
            element: <PlanWorkoutTab />,
          },
          {
            path: "history",
            element: <HistoryTab />,
          },
        ],
      },
      {
        path: "sign-in",
        element: <SignInPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);

export function AppRouterProvider() {
  return <RouterProvider router={hashRouter} />;
}
