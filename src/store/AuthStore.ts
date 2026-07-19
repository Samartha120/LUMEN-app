import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, User } from "@supabase/supabase-js";

export type Role = "citizen" | "engineer" | "GUEST" | null;

interface AuthState {
  session: Session | null;
  user: User | null;
  role: Role;
  guestMode: boolean;
  isOnboardingComplete: boolean;
  preferences: {
    theme: "light" | "dark" | "system";
    language: string;
  };
  userAvatars: Record<string, string>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setRole: (role: Role) => void;
  completeOnboarding: () => void;
  updatePreferences: (prefs: Partial<AuthState["preferences"]>) => void;
  setAvatarUri: (userId: string, uri: string | null) => void;
  loginAsGuest: () => void;
  logout: () => void;
}

const memoryStorage: Record<string, string> = {};

const safeStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (e) {
      return memoryStorage[name] || null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (e) {
      memoryStorage[name] = value;
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (e) {
      delete memoryStorage[name];
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      role: null,
      guestMode: false,
      isOnboardingComplete: false,
      preferences: {
        theme: "system",
        language: "en",
      },
      userAvatars: {},
      setSession: (session) => set({ session, user: session?.user || null }),
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      completeOnboarding: () => set({ isOnboardingComplete: true }),
      updatePreferences: (prefs) =>
        set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
      setAvatarUri: (userId, uri) =>
        set((state) => {
          const nextAvatars = { ...state.userAvatars };
          if (uri) {
            nextAvatars[userId] = uri;
          } else {
            delete nextAvatars[userId];
          }
          return { userAvatars: nextAvatars };
        }),
      loginAsGuest: () =>
        set({
          session: null,
          user: { id: "guest", email: "guest@lumen.city", role: "GUEST" } as any,
          role: "GUEST",
          guestMode: true,
        }),
      logout: () =>
        set({
          session: null,
          user: null,
          role: null,
          guestMode: false,
        }),
    }),
    {
      name: "lumen-auth-storage",
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
