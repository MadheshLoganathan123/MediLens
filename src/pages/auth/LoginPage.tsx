import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LoginScreen } from "../../components/LoginScreen";
import { supabase } from "../../lib/supabaseClient";
import { routes } from "../../app/routes";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert("Login error: " + error.message);
        return;
      }
      navigate(routes.app.root, { replace: true });
    } catch (err: any) {
      console.error("Login failed:", err);
      alert("Login failed: " + (err?.message || err));
    }
  }, [navigate]);

  return (
    <LoginScreen
      onLogin={handleLogin}
      onNavigateToSignup={() => navigate(routes.auth.signup)}
    />
  );
}

