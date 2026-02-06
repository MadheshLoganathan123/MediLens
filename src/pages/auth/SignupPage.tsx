import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignupScreen } from "../../components/SignupScreen";
import { useAuth } from "../../context/AuthContext";
import { routes } from "../../app/routes";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        setError(null);
        setIsLoading(true);
        
        await signUp(email, password);

        // Store name in session data for profile creation
        localStorage.setItem("pending_profile_name", name);
        
        // Check if email confirmation is required
        // Supabase might require email confirmation before user can access app
        console.log("Signup successful. User may need to confirm email.");
        setError(null);
        
        // Navigate to app - AuthContext listener will handle redirect if needed
        navigate(routes.app.root, { replace: true });
      } catch (err: any) {
        console.error("Signup failed:", err);
        const errorMessage = err?.message || "Signup failed. Please try again.";
        setError(errorMessage);
        setIsLoading(false);
      }
    },
    [signUp, navigate]
  );

  return (
    <SignupScreen
      onSignup={handleSignup}
      onNavigateToLogin={() => {
        setError(null);
        navigate(routes.auth.login);
      }}
      isLoading={isLoading}
      error={error}
      onDismissError={() => setError(null)}
    />
  );
}

