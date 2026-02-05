import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SignupScreen } from "../../components/SignupScreen";
import { supabase } from "../../lib/supabaseClient";
import { routes } from "../../app/routes";

export default function SignupPage() {
  const navigate = useNavigate();

  const handleSignup = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });

        if (error) {
          console.error("Signup error:", error);
          alert("Signup error: " + error.message);
          return;
        }

        const user = data?.user ?? data?.session?.user;
        if (!user) {
          alert("Check your email for confirmation!");
          navigate(routes.auth.login, { replace: true });
          return;
        }

        alert("Signup successful!");
        navigate(routes.app.root, { replace: true });
      } catch (err: any) {
        console.error("Signup failed:", err);
        alert("Signup failed: " + (err?.message || err));
      }
    },
    [navigate]
  );

  return (
    <SignupScreen
      onSignup={handleSignup}
      onNavigateToLogin={() => navigate(routes.auth.login)}
    />
  );
}

