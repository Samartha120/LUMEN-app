import { useAuthStore } from "../store/AuthStore";

const API_URL = "http://localhost:3000/auth";

export const AuthService = {
  initialize() {
    // Keep Zustand state in sync if needed (could check token validity here)
  },

  async signInMock(email: string) {
    let role: "citizen" | "engineer" = "citizen";
    if (email.toLowerCase().includes("engineer")) role = "engineer";
    useAuthStore.getState().setRole(role);
    useAuthStore.getState().setSession({ access_token: "mock", user: { email, role } } as any);
    return role;
  },

  async signInWithPassword(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Login failed");
      }

      const data = await response.json();
      useAuthStore.getState().setRole(data.user.role);
      useAuthStore
        .getState()
        .setSession({ access_token: data.access_token, user: data.user } as any);
      return data.user.role;
    } catch (e: any) {
      if (e.message?.includes("fetch failed") || e.message?.includes("Network request failed")) {
        console.warn("Backend not reachable, falling back to mock sign in");
        return this.signInMock(email);
      }
      throw e;
    }
  },

  async signUp(email: string, password: string, role: string = "citizen") {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Registration failed");
      }

      const data = await response.json();
      useAuthStore.getState().setRole(data.user.role);
      useAuthStore
        .getState()
        .setSession({ access_token: data.access_token, user: data.user } as any);
      return data;
    } catch (e: any) {
      if (e.message?.includes("fetch failed") || e.message?.includes("Network request failed")) {
        console.warn("Backend not reachable, falling back to mock sign up");
        return this.signInMock(email);
      }
      throw e;
    }
  },

  async signOut() {
    useAuthStore.getState().logout();
  },

  async saveUserProfile(profileData: any) {
    useAuthStore.getState().setRole(profileData.role || "citizen");
    useAuthStore.getState().completeOnboarding();
  },
};
