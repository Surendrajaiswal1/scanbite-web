import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordSchema, type ResetPasswordFormType } from "../utils/validation";
import { useAuthStore } from "../store/auth";
import { apiClient } from "../services/api";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthInput } from "../components/auth/AuthInput";
import { AuthButton } from "../components/auth/AuthButton";
import { AuthAlert } from "../components/auth/AuthAlert";

export const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setError: setAuthError, error: authError } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormType>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const token = searchParams.get("token");

  if (!token) {
    return (
      <AuthLayout
        title="Invalid Link"
        subtitle="This password reset link is invalid or has expired."
      >
        <div className="text-center">
          <Link
            to="/forgot-password"
            className="inline-block bg-[var(--accent)] text-white font-medium py-2.5 px-6 rounded-xl transition hover:opacity-90"
          >
            Request New Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const onSubmit = async (data: ResetPasswordFormType) => {
    try {
      setAuthError(null);
      const response = await apiClient.resetPassword(
        token,
        data.password,
        data.password_confirmation
      );

      if (response.success) {
        setAuthError("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorMsg = Array.isArray(response.errors)
          ? response.errors.join(", ")
          : response.message || response.error || "Password reset failed";
        setAuthError(errorMsg);
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
      title="Reset Password"
      subtitle="Create your new password"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthInput
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <p className="text-xs text-[var(--text)] -mt-2">
          Must include: uppercase, lowercase, number, special character
          (@#$%^&*!)
        </p>

        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.password_confirmation?.message}
          {...register("password_confirmation")}
        />

        {authError && (
          <AuthAlert
            message={authError}
            variant={
              authError.toLowerCase().includes("success")
                ? "success"
                : "error"
            }
          />
        )}

        <AuthButton loading={isSubmitting}>
          Reset Password
        </AuthButton>
      </form>

      <p className="text-center mt-6 text-sm text-[var(--text)]">
        <Link
          to="/login"
          className="text-[var(--accent)] font-medium hover:opacity-80"
        >
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
};
