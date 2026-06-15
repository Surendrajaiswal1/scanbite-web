import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { signupSchema } from "../utils/validation";
import type { SignupFormType } from "../utils/validation";
import { useAuthStore } from "../store/auth";
import { apiClient } from "../services/api";
import { GoogleLogin } from "@react-oauth/google";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthInput } from "../components/auth/AuthInput";
import { AuthButton } from "../components/auth/AuthButton";
import { AuthAlert } from "../components/auth/AuthAlert";
import { AuthDivider } from "../components/auth/AuthDivider";

export const SignupForm = () => {
  const navigate = useNavigate();
  const { setError: setAuthError, error: authError, setUser, setTokens } = useAuthStore();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormType>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SignupFormType) => {
    try {
      setAuthError(null);
      const response = await apiClient.register(data as unknown as import("../types/auth").SignupFormData);

      if (response.success) {
        sessionStorage.setItem("signup_email", data.email);
        navigate("/verify-otp", { state: { email: data.email } });
      } else {
        // Handle validation errors from backend
        if (response.errors && typeof response.errors === "object") {
          Object.entries(response.errors).forEach(
            ([field, messages]: [string, unknown]) => {
              const message = Array.isArray(messages) ? messages[0] : messages;
              setError(field as keyof SignupFormType, {
                type: "server",
                message: String(message),
              });
            }
          );
        } else {
          // Show general error message
          setAuthError(response.message || response.error || "Sign up failed");
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError("An unexpected error occurred");
      }
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Create your business account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <AuthInput
          label="Full Name"
          type="text"
          placeholder="John Doe"
          error={errors.full_name?.message}
          {...register("full_name")}
        />

        <AuthInput
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <AuthInput
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <p className="text-xs text-[var(--text)] mt-2">
            Must include uppercase, lowercase, number and special character.
          </p>
        </div>

        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.password_confirmation?.message}
          {...register("password_confirmation")}
        />

        {authError && (
          <AuthAlert message={authError} />
        )}

        <AuthButton loading={isSubmitting}>
          Create Account
        </AuthButton>

      </form>

      <AuthDivider />

      <div className="mt-6 flex justify-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              const token = credentialResponse.credential;

              if (!token) {
                setAuthError("Google authentication failed. Please try again.");
                return;
              }

              const response = await apiClient.authenticateWithGoogle(token);

              if (response.success && response.data) {
                setUser({
                  id: response.data.user_id,
                  full_name: response.data.full_name,
                  email: response.data.email,
                  business_name: response.data.business_name,
                  email_verified: true,
                  onboarding_completed: response.data.onboarding_completed ?? false,
                  status: "email_verified",
                  is_store_open: response.data.is_store_open ?? true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });

                setTokens({
                  access_token: response.data.access_token,
                  refresh_token: response.data.refresh_token,
                  expires_in: response.data.expires_in,
                });

                navigate("/dashboard");
              } else {
                setAuthError(response.message || response.error || "Google sign-up failed");
              }
            } catch (error) {
              setAuthError(error instanceof Error ? error.message : "Google sign-up failed");
            }
          }}
          onError={() => setAuthError("Google authentication failed. Please try again.")}
        />
      </div>

      <p className="text-center mt-6 text-sm text-[var(--text)]">
        Already have an account?
        <Link
          to="/login"
          className="ml-2 text-[var(--accent)] font-medium hover:opacity-80"
        >
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};
