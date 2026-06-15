// import axios from "axios";
// import type { AxiosInstance } from "axios";
// import type { SignupFormData, LoginFormData, SignupResponse, OTPVerificationResponse } from "../types/auth";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// class ApiClient {
//   private client: AxiosInstance;

//   constructor() {
//     this.client = axios.create({
//       baseURL: `${API_BASE_URL}/api/v1`,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     // Add token to requests
//     this.client.interceptors.request.use((config) => {
//       const token = localStorage.getItem("access_token");
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//     });

//     // Handle errors
//     this.client.interceptors.response.use(
//       (response) => response,
//       (error) => {
//         if (error.response?.status === 401) {
//           // Clear tokens on unauthorized
//           localStorage.removeItem("access_token");
//           localStorage.removeItem("refresh_token");
//           window.location.href = "/login";
//         }
//         return Promise.reject(error);
//       }
//     );
//   }

//   // Authentication endpoints
//   async signup(data: SignupFormData): Promise<SignupResponse> {
//     const response = await this.client.post("/auth/signup", {
//       user: data,
//     });
//     return response.data;
//   }

//   async verifyOTP(email: string, otp_code: string): Promise<OTPVerificationResponse> {
//     const response = await this.client.post("/auth/verify-otp", {
//       verification: { email, otp_code },
//     });
//     return response.data;
//   }

//   async login(data: LoginFormData): Promise<OTPVerificationResponse> {
//     const response = await this.client.post("/auth/session", {
//       credentials: data,
//     });
//     return response.data;
//   }

//   async resendOTP(email: string): Promise<{ success: boolean; message: string; data?: { email: string } }> {
//     const response = await this.client.post("/auth/resend-otp", {
//       user: { email },
//     });
//     return response.data;
//   }

//   async googleAuth(idToken: string) {
//     const response = await this.client.post("/auth/google", {
//       token: idToken,
//     });

//     return response.data;
//   }

//   async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
//     const response = await this.client.post("/auth/forgot-password", {
//       user: { email },
//     });
//     return response.data;
//   }

//   async resetPassword(token: string, password: string, password_confirmation: string): Promise<{ success: boolean; message: string; errors?: string[] }> {
//     const response = await this.client.post("/auth/reset-password", {
//       password_reset: { token, password, password_confirmation },
//     });
//     return response.data;
//   }
// }

// export const apiClient = new ApiClient();

import axios from "axios";
import type { AxiosInstance } from "axios";

import type {
  SignupFormData,
  LoginFormData,
  SignupResponse,
  OTPVerificationResponse,
  PasswordResetResponse,
  ResendOtpResponse,
} from "../types/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const AUTH_ROUTES = {
  registration: "/auth/registration",
  session: "/auth/session",
  otpVerification: "/auth/otp_verifications",
  resendOtp: "/auth/otp_verifications/resend",
  googleAuth: "/auth/google_auth",
  forgotPassword: "/auth/password/forgot",
  resetPassword: "/auth/password/reset",
} as const;

// Error message mapping for user-friendly responses
const getErrorMessage = (status: number, data?: Record<string, unknown>): string => {
  if (data?.error && typeof data.error === "string") return data.error;
  if (data?.message && typeof data.message === "string") return data.message;

  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Invalid email or password.";
    case 404:
      return "Resource not found.";
    case 422:
      return "Email already exists or invalid data provided.";
    case 429:
      return "Too many attempts. Please try again later.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "An unexpected error occurred.";
  }
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const hasToken = localStorage.getItem("access_token");

        // Only logout if an authenticated request fails
        if (error.response?.status === 401 && hasToken) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          window.location.href = "/login";
        }

        return Promise.reject(error);
      }
    );
  }

  // Helper to handle errors consistently
  private handleError(error: unknown) {
    const axiosError = error as { response?: { status?: number; data?: Record<string, unknown> } };
    const status = axiosError.response?.status || 500;
    const data = axiosError.response?.data;

    return {
      success: false as const,
      message: getErrorMessage(status, data),
      error: getErrorMessage(status, data),
      errors: (data?.errors || {}) as Record<string, unknown>,
    };
  }

  // --------------------------------------------------------------------------
  // Authentication
  // --------------------------------------------------------------------------

  async register(
    data: SignupFormData
  ): Promise<SignupResponse> {
    try {
      const response = await this.client.post(
        AUTH_ROUTES.registration,
        {
          user: data,
        }
      );

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async login(
    data: LoginFormData
  ): Promise<OTPVerificationResponse> {
    try {
      const response = await this.client.post(
        AUTH_ROUTES.session,
        {
          credentials: data,
        }
      );

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async verifyOtp(
    email: string,
    otp_code: string
  ): Promise<OTPVerificationResponse> {
    try {
      const response = await this.client.post(
        AUTH_ROUTES.otpVerification,
        {
          verification: {
            email,
            otp_code,
          },
        }
      );

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async resendOtp(
    email: string
  ): Promise<ResendOtpResponse> {
    try {
      const response = await this.client.post(
        AUTH_ROUTES.resendOtp,
        {
          user: { email },
        }
      );

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async authenticateWithGoogle(idToken: string) {
    try {
      const response = await this.client.post(
        AUTH_ROUTES.googleAuth,
        {
          token: idToken,
        }
      );

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async forgotPassword(
    email: string
  ): Promise<PasswordResetResponse> {
    try {
      const response = await this.client.post(
        AUTH_ROUTES.forgotPassword,
        {
          user: { email },
        }
      );

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async resetPassword(
    token: string,
    password: string,
    password_confirmation: string
  ): Promise<PasswordResetResponse> {
    try {
      const response = await this.client.post(
        AUTH_ROUTES.resetPassword,
        {
          password_reset: {
            token,
            password,
            password_confirmation,
          },
        }
      );

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
  async getBusinessProfile() {
    try {
      const response = await this.client.get("/business_profile");
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createBusinessProfile(data: Record<string, unknown>) {
    try {
      const response = await this.client.post("/business_profile", {
        business_profile: data,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateBusinessProfile(data: any) {
    try {
      const response = await this.client.put("/business_profile", {
        business_profile: data,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async completeOnboarding() {
    try {
      const response = await this.client.post("/business_profile/complete_onboarding");
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMenuItems() {
    try {
      const response = await this.client.get("/menu_items");
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createMenuItem(formData: FormData) {
    try {
      const response = await this.client.post("/menu_items", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateMenuItem(id: number | string, formData: FormData) {
    try {
      const response = await this.client.put(`/menu_items/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteMenuItem(id: number | string) {
    try {
      const response = await this.client.delete(`/menu_items/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async importCsvMenuItems(file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await this.client.post("/menu_items/import_csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getPublicMenu(slug: string) {
    try {
      const response = await this.client.get(`/public_menus/${slug}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateOrder(orderId: string | number, status?: string, paymentStatus?: string) {
    try {
      const payload: any = {};
      if (status) payload.status = status;
      if (paymentStatus) payload.payment_status = paymentStatus;
      
      const response = await this.client.put(`/orders/${orderId}`, payload);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getOrders() {
    try {
      const response = await this.client.get("/orders");
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createOrder(slug: string, items: { id: number | string, quantity: number }[], customerDetails?: { name: string; phone: string; email?: string; notes?: string }, paymentMethod?: string, paymentStatus?: string) {
    try {
      const response = await this.client.post(`/public_menus/${slug}/orders`, { 
        items, 
        customerDetails,
        paymentMethod,
        paymentStatus
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProfile(data: { full_name?: string; password?: string; password_confirmation?: string }) {
    try {
      const response = await this.client.put("/user", { user: data });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const apiClient = new ApiClient();