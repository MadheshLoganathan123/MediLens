import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "./LoginScreen";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!user) {
    return (
      <LoginScreen
        onLogin={async () => {
          // Actual login is handled via LoginScreen; this is just a type placeholder.
        }}
        onNavigateToSignup={() => {}}
      />
    );
  }

  return <>{children}</>;
}

