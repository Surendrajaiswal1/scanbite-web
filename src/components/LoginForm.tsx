// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useNavigate, useLocation } from "react-router-dom";
// import { loginSchema, type LoginFormType } from "../utils/validation";
// import { useAuthStore } from "../store/auth";
// import { apiClient } from "../services/api";
// import { GoogleLogin } from "@react-oauth/google";

// export const LoginForm = () => {
  // const navigate = useNavigate();
  // const location = useLocation();
  // const { setError: setAuthError, error: authError, setUser, setTokens } = useAuthStore();
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors, isSubmitting },
  // } = useForm<LoginFormType>({
  //   resolver: zodResolver(loginSchema),
  //   mode: "onBlur",
  // });

  // const from = (location.state as { from?: string })?.from || "/dashboard";

  // const onSubmit = async (data: LoginFormType) => {
  //   try {
  //     setAuthError(null);
  //     const response = await apiClient.login(data);

  //     if (response.success && response.data) {
  //       setUser({
  //         id: response.data.user_id,
  //         full_name: response.data.full_name,
  //         email: response.data.email,
  //         business_name: response.data.business_name,
  //         email_verified: true,
  //         status: "email_verified",
  //         created_at: new Date().toISOString(),
  //         updated_at: new Date().toISOString(),
  //       });

  //       setTokens({
  //         access_token: response.data.access_token,
  //         refresh_token: response.data.refresh_token,
  //         expires_in: response.data.expires_in,
  //       });

  //       navigate(from);
  //     } else {
  //       setAuthError(response.error || "Login failed");
  //     }
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       setAuthError(error.message);
  //     } else {
  //       setAuthError("An unexpected error occurred");
  //     }
  //   }
  // };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-white mb-2">ScanBite</h1>
//           <p className="text-slate-400">QR-based Takeaway Ordering Platform</p>
//           <p className="text-slate-500 text-sm mt-2">Sign in to your account</p>
//         </div>

//         {/* Card */}
//         <div className="bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//             {/* Email */}
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-2">
//                 Email Address
//               </label>
//               <input
//                 {...register("email")}
//                 type="email"
//                 placeholder="john@example.com"
//                 className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
//                   errors.email ? "border-red-500" : "border-slate-600"
//                 }`}
//               />
//               {errors.email && (
//                 <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
//               )}
//             </div>

//             {/* Password */}
//             <div>
//               <div className="flex justify-between items-center mb-2">
//                 <label className="block text-sm font-medium text-slate-300">
//                   Password
//                 </label>
//                 <a href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
//                   Forgot password?
//                 </a>
//               </div>
//               <input
//                 {...register("password")}
//                 type="password"
//                 placeholder="••••••••"
//                 className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
//                   errors.password ? "border-red-500" : "border-slate-600"
//                 }`}
//               />
//               {errors.password && (
//                 <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
//               )}
//             </div>

//             {/* Error Message */}
//             {authError && (
//               <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">
//                 {authError}
//               </div>
//             )}

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition duration-200 mt-6"
//             >
//               {isSubmitting ? "Signing in..." : "Sign In"}
//             </button>
//           </form>

//           {/* Divider */}
//           <div className="relative my-6">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-slate-600"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 bg-slate-800 text-slate-400">or sign in with</span>
//             </div>
//           </div>

//           {/* Google Sign In */}
//           <div className="mb-6">
//             <GoogleLogin
//               onSuccess={async (credentialResponse) => {
//                 try {
//                   const token = credentialResponse.credential;

//                   if (!token) {
//                     setAuthError("Google authentication failed");
//                     return;
//                   }

//                   const response = await apiClient.googleAuth(token);

//                   if (response.success && response.data) {
//                     setUser({
//                       id: response.data.user_id,
//                       full_name: response.data.full_name,
//                       email: response.data.email,
//                       business_name: response.data.business_name,
//                       email_verified: true,
//                       status: "email_verified",
//                       created_at: new Date().toISOString(),
//                       updated_at: new Date().toISOString(),
//                     });

//                     setTokens({
//                       access_token: response.data.access_token,
//                       refresh_token: response.data.refresh_token,
//                       expires_in: response.data.expires_in,
//                     });

//                     navigate(from);
//                   }
//                 } catch (error) {
//                   console.error(error);
//                   setAuthError("Google sign-in failed");
//                 }
//               }}
//               onError={() => {
//                 setAuthError("Google sign-in failed");
//               }}
//             />
//           </div>

//           {/* Sign Up Link */}
//           <p className="text-center text-slate-400 text-sm">
//             Don't have an account?{" "}
//             <a href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
//               Sign up
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useNavigate, useLocation } from "react-router-dom";
// import { GoogleLogin } from "@react-oauth/google";

// import { loginSchema, type LoginFormType } from "../utils/validation";
// import { useAuthStore } from "../store/auth";
// import { apiClient } from "../services/api";

// import { AuthLayout } from "../components/auth/AuthLayout";
// import { AuthInput } from "../components/auth/AuthInput";
// import { AuthButton } from "../components/auth/AuthButton";
// import { AuthAlert } from "../components/auth/AuthAlert";
// import { AuthDivider } from "../components/auth/AuthDivider";

// export const LoginForm = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const {
//     setError: setAuthError,
//     error: authError,
//     setUser,
//     setTokens,
//   } = useAuthStore();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<LoginFormType>({
//     resolver: zodResolver(loginSchema),
//     mode: "onBlur",
//   });

//   const from =
//     (location.state as { from?: string })?.from || "/dashboard";

//   const normalizeUser = (data: any) => ({
//     id: data.userId || data.user_id,
//     full_name: data.fullName || data.full_name,
//     email: data.email,
//     business_name: data.businessName || data.business_name,
//     email_verified:
//       data.emailVerified ?? data.email_verified ?? false,
//     status: data.status || "active",
//     created_at: data.createdAt || new Date().toISOString(),
//     updated_at: data.updatedAt || new Date().toISOString(),
//   });

//   const normalizeTokens = (data: any) => ({
//     access_token: data.accessToken || data.access_token,
//     refresh_token: data.refreshToken || data.refresh_token,
//     expires_in: data.expiresIn || data.expires_in,
//   });

//   const onSubmit = async (data: LoginFormType) => {
//     try {
//       setAuthError(null);

//       const response = await apiClient.login(data);

//       if (!response?.success || !response.data) {
//         setAuthError(response?.error || "Login failed");
//         return;
//       }

//       setUser(normalizeUser(response.data));
//       setTokens(normalizeTokens(response.data));

//       navigate(from, { replace: true });
//     } catch (error: unknown) {
//       setAuthError(
//         error instanceof Error
//           ? error.message
//           : "An unexpected error occurred"
//       );
//     }
//   };

//   const handleGoogleSuccess = async (credentialResponse: any) => {
//     try {
//       const token = credentialResponse?.credential;

//       if (!token) {
//         setAuthError("Google authentication failed");
//         return;
//       }

//       const response = await apiClient.googleAuth(token);

//       if (!response?.success || !response.data) {
//         setAuthError(response?.error || "Google login failed");
//         return;
//       }

//       setUser(normalizeUser(response.data));
//       setTokens(normalizeTokens(response.data));

//       navigate(from, { replace: true });
//     } catch (error) {
//       console.error(error);
//       setAuthError("Google sign-in failed");
//     }
//   };

//   return (
//     <AuthLayout
//       title="Welcome Back"
//       subtitle="Sign in to manage your business"
//     >
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//         <AuthInput
//           label="Email Address"
//           type="email"
//           placeholder="john@example.com"
//           error={errors.email?.message}
//           {...register("email")}
//         />

//         <AuthInput
//           label="Password"
//           type="password"
//           placeholder="••••••••"
//           error={errors.password?.message}
//           {...register("password")}
//         />

//         <div className="text-right">
//           <a
//             href="/forgot-password"
//             className="text-sm text-violet-600 hover:text-violet-700"
//           >
//             Forgot Password?
//           </a>
//         </div>

//         {authError && <AuthAlert message={authError} />}

//         <AuthButton loading={isSubmitting}>
//           Sign In
//         </AuthButton>
//       </form>

//       <AuthDivider />

//       <div className="mt-6 flex justify-center">
//         <GoogleLogin
//           onSuccess={handleGoogleSuccess}
//           onError={() => setAuthError("Google sign-in failed")}
//         />
//       </div>

//       <p className="text-center mt-6 text-sm text-slate-500">
//         Don't have an account?
//         <a
//           href="/signup"
//           className="ml-2 text-violet-600 font-medium hover:text-violet-700"
//         >
//           Create Account
//         </a>
//       </p>
//     </AuthLayout>
//   );
// };

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import { loginSchema, type LoginFormType } from "../utils/validation";
import { useAuthStore } from "../store/auth";
import { apiClient } from "../services/api";

import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthInput } from "../components/auth/AuthInput";
import { AuthButton } from "../components/auth/AuthButton";
import { AuthAlert } from "../components/auth/AuthAlert";
import { AuthDivider } from "../components/auth/AuthDivider";

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    setError: setAuthError,
    error: authError,
    setUser,
    setTokens,
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const from =
    (location.state as { from?: string })?.from || "/dashboard";

  const normalizeUser = (data: Record<string, unknown>) => ({
    id: (data.userId || data.user_id) as number,
    full_name: (data.fullName || data.full_name) as string,
    email: data.email as string,
    business_name: (data.businessName || data.business_name) as string | undefined,
    email_verified:
      (data.emailVerified ?? data.email_verified ?? false) as boolean,
    onboarding_completed:
      (data.onboardingCompleted ?? data.onboarding_completed ?? false) as boolean,
    status: (data.status || "active") as "pending" | "email_verified" | "active",
    is_store_open: (data.isStoreOpen ?? data.is_store_open ?? true) as boolean,
    created_at: (data.createdAt || new Date().toISOString()) as string,
    updated_at: (data.updatedAt || new Date().toISOString()) as string,
  });

  const normalizeTokens = (data: Record<string, unknown>) => ({
    access_token: (data.accessToken || data.access_token) as string,
    refresh_token: (data.refreshToken || data.refresh_token) as string,
    expires_in: (data.expiresIn || data.expires_in) as number,
  });

  const onSubmit = async (data: LoginFormType) => {
    try {
      setAuthError(null);

      const response = await apiClient.login(data as unknown as import("../types/auth").LoginFormData);

      if (response.success && response.data) {
        setUser(normalizeUser(response.data));
        setTokens(normalizeTokens(response.data));

        navigate(from, { replace: true });
      } else {
        setAuthError(response.message || response.error || "Login failed");
      }
    } catch (error: unknown) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred"
      );
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const token = credentialResponse?.credential as string;

      if (!token) {
        setAuthError("Google authentication failed. Please try again.");
        return;
      }

      const response = await apiClient.authenticateWithGoogle(token);

      if (response.success && response.data) {
        setUser(normalizeUser(response.data));
        setTokens(normalizeTokens(response.data));

        navigate(from, { replace: true });
      } else {
        setAuthError(response.message || response.error || "Google login failed");
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Google sign-in failed");
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to manage your business"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthInput
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-[var(--accent)] hover:opacity-80"
          >
            Forgot Password?
          </Link>
        </div>

        {authError && <AuthAlert message={authError} />}

        <AuthButton loading={isSubmitting}>
          Sign In
        </AuthButton>
      </form>

      <AuthDivider />

      <div className="mt-6 flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setAuthError("Google authentication failed. Please try again.")}
        />
      </div>

      <p className="text-center mt-6 text-sm text-[var(--text)]">
        Don't have an account?
        <Link to="/signup"
          className="ml-2 text-[var(--accent)] font-medium hover:opacity-80"
        >
          Create Account
        </Link>
      </p>
    </AuthLayout>
  );
};