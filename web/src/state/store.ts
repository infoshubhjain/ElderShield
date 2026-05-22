/**
 * Centralized state management using Zustand
 * Stores user session, accessibility preferences, and app state
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  role?: "USER" | "ADMIN";
}

export interface AccessibilityPreferences {
  fontSize: "normal" | "large" | "extra-large";
  highContrast: boolean;
  textToSpeech: boolean;
}

interface AppState {
  // User session
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Accessibility
  accessibility: AccessibilityPreferences;

  // Actions
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
  setFontSize: (size: AccessibilityPreferences["fontSize"]) => void;
  setHighContrast: (enabled: boolean) => void;
  setTextToSpeech: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      accessibility: {
        fontSize: "normal",
        highContrast: false,
        textToSpeech: false
      },

      // Actions
      setSession: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      clearSession: () =>
        set({ user: null, token: null, isAuthenticated: false }),

      setFontSize: (fontSize) =>
        set((state) => ({
          accessibility: { ...state.accessibility, fontSize }
        })),

      setHighContrast: (highContrast) =>
        set((state) => ({
          accessibility: { ...state.accessibility, highContrast }
        })),

      setTextToSpeech: (enabled) =>
        set((state) => ({
          accessibility: { ...state.accessibility, textToSpeech: enabled }
        }))
    }),
    {
      name: "eldershield-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        accessibility: state.accessibility
      })
    }
  )
);
