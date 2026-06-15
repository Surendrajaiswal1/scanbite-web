// User related types
export interface User {
  id: number;
  full_name: string;
  email: string;
  business_name?: string;
  business_type?: string;
  business_slug?: string;
  email_verified: boolean;
  onboarding_completed: boolean;
  status: "pending" | "email_verified" | "active";
  created_at: string;
  updated_at: string;
  is_store_open?: boolean;
}

// Auth related types
export interface SignupFormData {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: {
    user_id: number;
    email: string;
    status: string;
    message: string;
  };
  errors?: Record<string, unknown>;
}

export interface OTPVerificationResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: {
    user_id: number;
    email: string;
    full_name: string;
    business_name: string;
    onboarding_completed: boolean;
    is_store_open: boolean;
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  errors?: Record<string, unknown>;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  error?: string;
  errors?: string[] | Record<string, unknown>;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: { email: string };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
}
