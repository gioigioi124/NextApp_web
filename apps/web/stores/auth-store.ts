"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthTokens, User } from "shared-types";
import { apiClient } from "@/lib/api-client";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      setAuth: (user, tokens) => {
        apiClient.setToken(tokens.accessToken);
        setCookie("auth-token", tokens.accessToken, 60 * 60 * 24 * 7);
        setCookie("auth-role", user.role, 60 * 60 * 24 * 7);
        set({ user, tokens, isAuthenticated: true });
      },
      logout: () => {
        apiClient.setToken(null);
        clearCookie("auth-token");
        clearCookie("auth-role");
        set({ user: null, tokens: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        apiClient.setToken(state?.tokens?.accessToken || null);
      },
    },
  ),
);
