import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider } from "../context/AuthContext";
import { AuthLayout } from "../layouts/AuthLayout";
import { MainLayout } from "../layouts/MainLayout";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import { routes } from "./routes";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import AppShellPage from "../pages/main/AppShellPage";

export function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Public auth routes */}
            <Route element={<AuthLayout />}>
              <Route path={routes.auth.login} element={<LoginPage />} />
              <Route path={routes.auth.signup} element={<SignupPage />} />
            </Route>

            {/* Protected app shell */}
            <Route
              path={routes.app.root}
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AppShellPage />} />
            </Route>

            {/* Default redirects */}
            <Route path="/" element={<Navigate to={routes.app.root} replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

