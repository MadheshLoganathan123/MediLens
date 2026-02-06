import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginScreen } from "../../components/LoginScreen";
import { useAuth } from "../../context/AuthContext";
import { routes } from "../../app/routes";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      await signIn(email, password);
      
      // Navigation is handled by ProtectedRoute when session updates
      navigate(routes.app.root, { replace: true });
    } catch (err: any) {
      console.error("Login failed:", err);
      const errorMessage = err?.message || "Login failed. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [signIn, navigate]);

  return (
    <LoginScreen
      onLogin={handleLogin}
      onNavigateToSignup={() => {
        setError(null);
        navigate(routes.auth.signup);
      }}
      isLoading={isLoading}
      error={error}
      onDismissError={() => setError(null)}
    />
  );
}

