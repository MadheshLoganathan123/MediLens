import { supabase } from "./supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type ApiError = Error & {
  status?: number;
  code?: string;
};

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // ignore non-JSON body
  }

  if (!res.ok) {
    const detail = body?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : detail?.message || `Request failed with status ${res.status}`;

    const error: ApiError = new Error(message);
    error.status = res.status;
    if (detail && typeof detail === "object") {
      error.code = detail.code;
    }
    throw error;
  }

  return body as T;
}

export async function analyzeIssue(symptoms: string, hasImage: boolean) {
  return apiFetch<{ analysis: string }>("/analyze", {
    method: "POST",
    body: JSON.stringify({ symptoms, has_image: hasImage }),
  });
}

