import { create } from "zustand";
import type { AuthState, User, AuthTokens } from "../types/auth";

interface AuthStore extends AuthState {
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  restoreSession: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  tokens: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  setUser: (user: User | null) => {
    set({ user });
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  },

  setTokens: (tokens: AuthTokens | null) => {
    set({ tokens });
    if (tokens) {
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
    }
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  logout: () => {
    set({ user: null, tokens: null, error: null });
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  restoreSession: () => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    const userStr = localStorage.getItem("user");
    
    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 86400, // 24 hours
          },
          isInitialized: true
        });
        return;
      } catch {
        localStorage.removeItem("user");
      }
    }
    set({ isInitialized: true });
  },
}));
