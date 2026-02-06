import type { HealthCase, HealthCaseCreate, HealthCaseUpdate } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type ApiError = Error & {
  status?: number;
  code?: string;
};

// Store current access token in memory for API requests
let currentAccessToken: string | null = null;

// Initialize token from localStorage on load
function initializeToken() {
  const stored = localStorage.getItem('access_token');
  if (stored) {
    currentAccessToken = stored;
    console.log('[apiClient] Token initialized from localStorage');
  }
}

// Initialize on module load
initializeToken();

export function setAccessToken(token: string | null) {
  currentAccessToken = token;
  if (token) {
    localStorage.setItem('access_token', token);
    console.log('[apiClient] Token saved to localStorage');
  } else {
    localStorage.removeItem('access_token');
    console.log('[apiClient] Token cleared from localStorage');
  }
}

export function getAccessToken(): string | null {
  return currentAccessToken;
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const tokenToUse = currentAccessToken;

  if (tokenToUse) {
    headers["Authorization"] = `Bearer ${tokenToUse}`;
    console.log('[apiClient] Sending request with Authorization header');
  } else {
    console.warn('[apiClient] No token available for request to', path);
  }

  console.log('[apiClient] Request to:', API_BASE_URL + path);
  
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

  console.log('[apiClient] Response status:', res.status);
  
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

    // If unauthorized, clear the token
    if (res.status === 401) {
      setAccessToken(null);
    }

    throw error;
  }

  return body as T;
}

// Auth API

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
  };
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  // Clear any existing token before registration to prevent account mixing
  console.log('[apiClient] Clearing existing token before registration');
  setAccessToken(null);
  
  const response = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  // Save new token
  if (response.access_token) {
    console.log('[apiClient] Setting new token for user:', response.user.email);
    setAccessToken(response.access_token);
  }
  
  return response;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  // Clear any existing token before login to prevent account mixing
  console.log('[apiClient] Clearing existing token before login');
  setAccessToken(null);
  
  const response = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  // Save new token
  if (response.access_token) {
    console.log('[apiClient] Setting new token for user:', response.user.email);
    setAccessToken(response.access_token);
  }
  
  return response;
}

export function logout() {
  setAccessToken(null);
}

// Profile API

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  zip_code?: string;
  blood_type?: string;
  height?: number;
  weight?: number;
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_number?: string;
  medical_history?: any[];
  latitude?: number;
  longitude?: number;
}

export interface ProfileUpdateRequest {
  email?: string;
  full_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  zip_code?: string;
  blood_type?: string;
  height?: number;
  weight?: number;
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_number?: string;
  medical_history?: any[];
  latitude?: number;
  longitude?: number;
}

/**
 * Get the current user's profile
 * @returns User profile data
 */
export async function getProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/profile", {
    method: "GET",
  });
}

/**
 * Update the current user's profile
 * @param data - Partial profile update data
 * @returns Updated profile
 */
export async function updateProfile(data: ProfileUpdateRequest): Promise<UserProfile> {
  return apiFetch<UserProfile>("/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function analyzeIssue(symptoms: string, hasImage: boolean) {
  return apiFetch<{ analysis: string }>("/analyze", {
    method: "POST",
    body: JSON.stringify({ symptoms, has_image: hasImage }),
  });
}

// Gemini Image Analysis API

export interface SymptomData {
  symptom_name: string;
  severity: string;
  confidence: number;
  description?: string;
}

export interface ImageAnalysisResponse {
  success: boolean;
  analysis_text: string;
  detected_symptoms: SymptomData[];
  possible_conditions: string[];
  urgency_level: string;
  recommendations: string[];
  disclaimer: string;
}

/**
 * Analyze medical image using Gemini AI
 * @param imageBase64 - Base64 encoded image (with or without data URI prefix)
 * @param symptoms - Optional user-provided symptoms
 * @param userPrompt - Optional custom analysis prompt
 * @returns Structured analysis result
 */
export async function analyzeImage(
  imageBase64: string,
  symptoms?: string,
  userPrompt?: string
): Promise<ImageAnalysisResponse> {
  return apiFetch<ImageAnalysisResponse>("/analyze-image", {
    method: "POST",
    body: JSON.stringify({
      image: imageBase64,
      symptoms,
      user_prompt: userPrompt,
    }),
  });
}

/**
 * Convert File to base64 string
 * @param file - Image file
 * @returns Promise with base64 string (includes data URI prefix)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Health Cases API

/**
 * Create a new health case for the current user
 * @param data - Health case creation data
 * @returns Created health case
 */
export async function createCase(data: HealthCaseCreate): Promise<HealthCase> {
  return apiFetch<HealthCase>("/cases", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Get all health cases for the current user
 * @returns List of health cases
 */
export async function getCases(): Promise<HealthCase[]> {
  return apiFetch<HealthCase[]>("/cases", {
    method: "GET",
  });
}

/**
 * Get a single health case by ID
 * @param id - Case ID (UUID)
 * @returns Health case details
 */
export async function getCase(id: string): Promise<HealthCase> {
  return apiFetch<HealthCase>(`/cases/${id}`, {
    method: "GET",
  });
}

/**
 * Update a health case
 * @param id - Case ID (UUID)
 * @param data - Partial case update data
 * @returns Updated health case
 */
export async function updateCase(
  id: string,
  data: HealthCaseUpdate
): Promise<HealthCase> {
  return apiFetch<HealthCase>(`/cases/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

