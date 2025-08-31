import { HashRouter, Navigate, Route, Routes } from "react-router";

import { AppShell } from "./AppShell";
import { AuthenticatedRoute } from "./AuthenticatedRoute";
import { CurrentWorkoutPage } from "./CurrentWorkoutPage";
import { HistoryPage } from "./HistoryPage";
import { PlanWorkoutPage } from "./PlanWorkoutPage";
import { SignInPage } from "./SignInPage";

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route element={<AuthenticatedRoute />}>
            <Route path="/" element={<CurrentWorkoutPage />} />
            <Route path="plan" element={<PlanWorkoutPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>
          <Route path="sign-in" element={<SignInPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
