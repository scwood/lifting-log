import { lazy } from "react";
import { Navigate, HashRouter, Routes, Route } from "react-router";

import { AppShell } from "./AppShell";
import { AuthenticatedRoute } from "./AuthenticatedRoute";

const CurrentWorkoutTab = lazy(() => import("./CurrentWorkoutTab"));
const PlanWorkoutTab = lazy(() => import("./PlanWorkoutTab"));
const HistoryTab = lazy(() => import("./HistoryTab"));
const SignInPage = lazy(() => import("./SignInPage"));

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route element={<AuthenticatedRoute />}>
            <Route path="/" element={<CurrentWorkoutTab />} />
            <Route path="plan" element={<PlanWorkoutTab />} />
            <Route path="history" element={<HistoryTab />} />
          </Route>
          <Route path="sign-in" element={<SignInPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
