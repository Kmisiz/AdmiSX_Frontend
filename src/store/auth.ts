import { create } from "zustand";
import type { User, AuthState } from "../types/auth";

const STORAGE_KEY_TOKEN = "candidate_token";
const STORAGE_KEY_USER = "candidate_user";

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem(STORAGE_KEY_TOKEN),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEY_TOKEN),
  isLoading: true,

  setAuth: (user: User, token: string) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

export const initAuthFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
    return token;
  }
  return null;
};
