import { supabase } from "./supabase";
import { useAuthStore } from "../store/AuthStore";

export const AuthService = {
  /**
   * Initializes the authentication listener to keep Zustand state in sync with Supabase session.
   */
  initialize() {
    supabase.auth.getSession().then(({ data: { session } }) => {
      useAuthStore.getState().setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setSession(session);
    });
  },

  /**
   * Sign in with Google (OAuth)
   */
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "lumen://auth/callback",
      },
    });
    if (error) throw error;
  },

  /**
   * Sign in with Apple (OAuth)
   */
  async signInWithApple() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: "lumen://auth/callback",
      },
    });
    if (error) throw error;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    useAuthStore.getState().logout();
  },

  /**
   * Mock implementation for complete profile saving during onboarding.
   * In a real app, this would insert/update a record in a `profiles` table.
   */
  async saveUserProfile(profileData: any) {
    // const { error } = await supabase.from('profiles').upsert([profileData]);
    // if (error) throw error;
    
    // For now, we simulate a network request.
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    useAuthStore.getState().setRole(profileData.role);
    useAuthStore.getState().completeOnboarding();
  }
};
