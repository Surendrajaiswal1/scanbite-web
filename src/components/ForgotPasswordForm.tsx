import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordSchema, type ForgotPasswordFormType } from "../utils/validation";
import { useAuthStore } from "../store/auth";
import { apiClient } from "../services/api";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthInput } from "../components/auth/AuthInput";
import { AuthButton } from "../components/auth/AuthButton";
import { AuthAlert } from "../components/auth/AuthAlert";

export const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const { setError: setAuthError, error: authError } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotPasswordFormType) => {
    try {
      setAuthError(null);
      const response = await apiClient.forgotPassword(data.email);

      if (response.success) {
        // Show success message and redirect after 2 seconds
        setAuthError("Check your email for password reset instructions");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setAuthError(response.message || response.error || "Failed to send reset email");
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
  //   <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
  //     <div className="w-full max-w-md">
  //       {/* Header */}
  //       <div className="text-center mb-8">
  //         <h1 className="text-4xl font-bold text-white mb-2">ScanBite</h1>
  //         <p className="text-slate-400">QR-based Takeaway Ordering Platform</p>
  //         <p className="text-slate-500 text-sm mt-2">Reset your password</p>
  //       </div>

  //       {/* Card */}
  //       <div className="bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
  //         <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
  //           {/* Email */}
  //           <div>
  //             <label className="block text-sm font-medium text-slate-300 mb-2">
  //               Email Address
  //             </label>
  //             <input
  //               {...register("email")}
  //               type="email"
  //               placeholder="john@example.com"
  //               className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
  //                 errors.email ? "border-red-500" : "border-slate-600"
  //               }`}
  //             />
  //             {errors.email && (
  //               <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
  //             )}
  //           </div>

  //           {/* Info Message */}
  //           <div className="bg-blue-900/20 border border-blue-700 text-blue-400 px-4 py-3 rounded-lg text-sm">
  //             We'll send you a link to reset your password
  //           </div>

  //           {/* Error Message */}
  //           {authError && (
  //             <div className={`px-4 py-3 rounded-lg text-sm border ${
  //               authError.includes("Check your email")
  //                 ? "bg-green-900/20 border-green-700 text-green-400"
  //                 : "bg-red-900/20 border-red-700 text-red-400"
  //             }`}>
  //               {authError}
  //             </div>
  //           )}

  //           {/* Submit Button */}
  //           <button
  //             type="submit"
  //             disabled={isSubmitting}
  //             className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition duration-200 mt-6"
  //           >
  //             {isSubmitting ? "Sending..." : "Send Reset Link"}
  //           </button>
  //         </form>

  //         {/* Back to Login */}
  //         <p className="text-center text-slate-400 text-sm mt-6">
  //           Remember your password?{" "}
  //           <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
  //             Back to login
  //           </a>
  //         </p>
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email address to receive a reset link"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthInput
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="bg-[var(--accent-bg)] border border-[var(--border)] text-[var(--text)] px-4 py-3 rounded-xl text-sm">
          We'll send you a link to reset your password.
        </div>

        {authError && (
          <AuthAlert 
            message={authError} 
            variant={authError.toLowerCase().includes("check your email") ? "success" : "error"}
          />
        )}

        <AuthButton loading={isSubmitting}>
          Send Reset Link
        </AuthButton>
      </form>

      <p className="text-center mt-6 text-sm text-[var(--text)]">
        Remember your password?
        <Link
          to="/login"
          className="ml-2 text-[var(--accent)] font-medium hover:opacity-80"
        >
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
};
