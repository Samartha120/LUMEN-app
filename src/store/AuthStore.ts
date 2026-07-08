import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, User } from "@supabase/supabase-js";

export type Role = "citizen" | "engineer" | null;

interface AuthState {
  session: Session | null;
  user: User | null;
  role: Role;
  isOnboardingComplete: boolean;
  preferences: {
    theme: "light" | "dark" | "system";
    language: string;
  };
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setRole: (role: Role) => void;
  completeOnboarding: () => void;
  updatePreferences: (prefs: Partial<AuthState["preferences"]>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      role: null,
      isOnboardingComplete: false,
      preferences: {
        theme: "system",
        language: "en",
      },
      setSession: (session) => set({ session, user: session?.user || null }),
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      completeOnboarding: () => set({ isOnboardingComplete: true }),
      updatePreferences: (prefs) =>
        set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
      logout: () =>
        set({
          session: null,
          user: null,
          role: null,
        }),
    }),
    {
      name: "lumen-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
