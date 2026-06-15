import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpVerificationSchema } from "../utils/validation";
import type { OTPVerificationType } from "../utils/validation";
import { useAuthStore } from "../store/auth";
import { apiClient } from "../services/api";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthButton } from "../components/auth/AuthButton";
import { AuthAlert } from "../components/auth/AuthAlert";
import { Link } from "react-router-dom";

export const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setError: setAuthError, setUser, setTokens, error: authError } = useAuthStore();
  
  const [email] = useState(() => {
    const state = location.state as { email?: string } | null;
    if (state?.email) return state.email;
    const storedEmail = sessionStorage.getItem("signup_email");
    return storedEmail || "";
  });

  const [resendCountdown, setResendCountdown] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OTPVerificationType>({
    resolver: zodResolver(otpVerificationSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  // Handle resend countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const onSubmit = async (data: OTPVerificationType) => {
    try {
      setAuthError(null);
      const response = await apiClient.verifyOtp(email, data.otp_code);

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

        sessionStorage.removeItem("signup_email");
        navigate("/dashboard");
      } else {
        setAuthError(response.message || response.error || "OTP verification failed");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError("An unexpected error occurred");
      }
    }
  };

  const handleResendOTP = async () => {
    try {
      setAuthError(null);
      const response = await apiClient.resendOtp(email);

      if (response.success) {
        setAuthError(null);
        setResendCountdown(60);
      } else {
        setAuthError(response.message || response.error || "Failed to resend OTP");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError("An unexpected error occurred");
      }
    }
  };

  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
  //     <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-lg p-8">
  //       <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
  //         Verify Email
  //       </h1>
  //       <p className="text-center text-gray-600 mb-8">
  //         Enter the OTP sent to <strong>{email}</strong>
  //       </p>

  //       <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

  //         {/* OTP Code */}
  //         <div>
  //           <label className="block text-sm font-medium text-gray-700 mb-1">
  //             Enter OTP Code
  //           </label>
  //           <input
  //             {...register("otp_code")}
  //             type="text"
  //             placeholder="000000"
  //             inputMode="numeric"
  //             maxLength={6}
  //             className={`w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition font-mono ${
  //               errors.otp_code ? "border-red-500" : "border-gray-300"
  //             }`}
  //           />
  //           {errors.otp_code && (
  //             <p className="text-red-500 text-sm mt-1">
  //               {errors.otp_code.message}
  //             </p>
  //           )}
  //           <p className="text-xs text-gray-500 mt-2">
  //             OTP is valid for 10 minutes
  //           </p>
  //         </div>

  //         {/* Auth Error */}
  //         {authError && (
  //           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
  //             {authError}
  //           </div>
  //         )}

  //         {/* Submit Button */}
  //         <button
  //           type="submit"
  //           disabled={isSubmitting}
  //           className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 rounded-lg transition duration-200"
  //         >
  //           {isSubmitting ? "Verifying..." : "Verify OTP"}
  //         </button>

  //         {/* Resend OTP */}
  //         <div className="text-center">
  //           {resendCountdown > 0 ? (
  //             <p className="text-gray-600 text-sm">
  //               Resend OTP in <strong>{resendCountdown}s</strong>
  //             </p>
  //           ) : (
  //             <button
  //               type="button"
  //               onClick={handleResendOTP}
  //               className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
  //             >
  //               Didn't receive OTP? Resend
  //             </button>
  //           )}
  //         </div>

  //         {/* Back Link */}
  //         <p className="text-center text-gray-600 text-sm">
  //           <a href="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">
  //             Back to Sign Up
  //           </a>
  //         </p>
  //       </form>
  //     </div>
  //   </div>
  // );
  return (
    <AuthLayout
      title="Verify Email"
      subtitle={`Enter the OTP sent to ${email}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <div>
          <label className="block text-sm font-medium text-[var(--text-h)] mb-2">
            Enter OTP Code
          </label>

          <input
            {...register("otp_code")}
            type="text"
            placeholder="000000"
            inputMode="numeric"
            maxLength={6}
            className={`
              w-full
              h-14
              rounded-xl
              border
              border-[var(--border)]
              text-center
              text-2xl
              tracking-[0.4em]
              font-mono
              text-[var(--text-h)]
              outline-none
              transition
              focus:ring-2
              focus:ring-[var(--accent)]
              focus:border-[var(--accent)]
              ${
                errors.otp_code
                  ? "border-red-500"
                  : "border-[var(--border)]"
              }
            `}
          />

          {errors.otp_code && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.otp_code.message}
            </p>
          )}

          <p className="text-xs text-[var(--text)] mt-2">
            OTP is valid for 10 minutes
          </p>
        </div>

        {authError && (
          <AuthAlert message={authError} />
        )}

        <AuthButton loading={isSubmitting}>
          Verify OTP
        </AuthButton>

        <div className="text-center">
          {resendCountdown > 0 ? (
            <p className="text-sm text-[var(--text)]">
              Resend OTP in{" "}
              <span className="font-semibold text-[var(--accent)]">
                {resendCountdown}s
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              className="
                text-sm
                font-medium
                text-[var(--accent)]
                hover:opacity-80
              "
            >
              Didn't receive OTP? Resend
            </button>
          )}
        </div>

        <p className="text-center text-sm text-[var(--text)]">
          <Link to="/signup"
            className="
              text-[var(--accent)]
              font-medium
              hover:opacity-80
            "
          >
            Back to Sign Up
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
};
