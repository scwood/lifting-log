import { lazy } from "react";
import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";

import { Layout } from "./Layout";
import { ProtectedRoute } from "./ProtectedRoute";

const CurrentWorkoutTab = lazy(() => import("./CurrentWorkoutTab"));
const PlanWorkoutTab = lazy(() => import("./PlanWorkoutTab"));
const HistoryTab = lazy(() => import("./HistoryTab"));
const SignInPage = lazy(() => import("./SignInPage"));

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
