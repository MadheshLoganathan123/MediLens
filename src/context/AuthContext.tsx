import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import * as api from "../lib/apiClient";

interface User {
  id: string;
  email: string;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp(email: string, password: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  clearError(): void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on mount (check if token exists)
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const token = api.getAccessToken();
        
        if (token) {
          // Try to verify token by calling /api/auth/me
          try {
            const response = await api.apiFetch<{ user: User }>("/auth/me");
            if (isMounted) {
              setUser(response.user);
              setError(null);
            }
          } catch (err) {
            // Token is invalid, clear it
            if (isMounted) {
              api.logout();
              setUser(null);
            }
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null);
    // Clear current user before attempting signup to prevent account mixing
    setUser(null);
    try {
      const response = await api.register(email, password);
      // Verify the response contains the correct user data
      if (!response.user || !response.user.id || !response.user.email) {
        throw new Error("Invalid registration response");
      }
      console.log('[AuthContext] Setting user:', response.user.email);
      setUser(response.user);
    } catch (err: any) {
      const message = err?.message || "Signup failed";
      setError(message);
      // Ensure user is cleared on error
      setUser(null);
      throw err;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    // Clear current user before attempting login to prevent account mixing
    setUser(null);
    try {
      const response = await api.login(email, password);
      // Verify the response contains the correct user data
      if (!response.user || !response.user.id || !response.user.email) {
        throw new Error("Invalid login response");
      }
      console.log('[AuthContext] Setting user:', response.user.email);
      setUser(response.user);
    } catch (err: any) {
      const message = err?.message || "Sign in failed";
      setError(message);
      // Ensure user is cleared on error
      setUser(null);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      api.logout();
      setUser(null);
    } catch (err: any) {
      const message = err?.message || "Sign out failed";
      setError(message);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
