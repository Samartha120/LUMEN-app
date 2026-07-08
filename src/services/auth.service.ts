import { supabase, SUPABASE_URL } from "./supabase";
import { useAuthStore } from "../store/AuthStore";

export const AuthService = {
  /**
   * Initializes the authentication listener to keep Zustand state in sync with Supabase session.
   */
  initialize() {
    supabase.auth.getSession().then(({ data: { session } }) => {
      useAuthStore.getState().setSession(session);
      if (session?.user) {
        this.fetchAndSetUserRole(session.user.id, session.user.user_metadata?.role);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setSession(session);
      if (session?.user) {
        this.fetchAndSetUserRole(session.user.id, session.user.user_metadata?.role);
      }
    });
  },

  /**
   * Helper to fetch and set user role from profiles database or user metadata.
   */
  async fetchAndSetUserRole(userId: string, metadataRole?: string) {
    let role: "citizen" | "engineer" = (metadataRole as any) || "citizen";
    
    if (SUPABASE_URL.includes("your-project") || SUPABASE_URL === "") {
      useAuthStore.getState().setRole(role);
      return role;
    }

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      if (profile?.role) {
        role = profile.role as "citizen" | "engineer";
      }
    } catch (e) {
      console.warn("Could not fetch user role from profiles table, falling back to metadata:", e);
    }
    useAuthStore.getState().setRole(role);
    return role;
  },

  /**
   * Mock authentication fallback when Supabase is not configured or offline.
   */
  signInMock(email: string) {
    let role: "citizen" | "engineer" = "citizen";
    if (email.toLowerCase().includes("engineer")) {
      role = "engineer";
    }
    useAuthStore.getState().setRole(role);
    
    // Create a mock session that passes validation checks
    const mockSession = {
      access_token: "mock-token",
      refresh_token: "mock-refresh-token",
      expires_in: 3600,
      token_type: "bearer",
      user: {
        id: "mock-user-id",
        email: email,
        user_metadata: { role },
        aud: "authenticated",
        role: "authenticated",
        created_at: new Date().toISOString(),
      },
    };
    useAuthStore.getState().setSession(mockSession as any);
    return role;
  },

  /**
   * Sign in with Email and Password
   */
  async signInWithPassword(email: string, password: string) {
    if (SUPABASE_URL.includes("your-project") || SUPABASE_URL === "") {
      console.warn("Supabase URL is placeholder, falling back to mock sign in");
      return this.signInMock(email);
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      let role: "citizen" | "engineer" = "citizen";
      if (data.user) {
        role = await this.fetchAndSetUserRole(data.user.id, data.user.user_metadata?.role);
      }
      return role;
    } catch (e: any) {
      // Graceful host/network failure fallback to let local testing work fine for every email
      if (
        e.message?.includes("fetch failed") || 
        e.message?.includes("Network request failed") || 
        e.message?.includes("UnknownHostException")
      ) {
        console.warn("Supabase network request failed, falling back to mock sign in");
        return this.signInMock(email);
      }
      throw e;
    }
  },

  /**
   * Sign up with Email and Password
   */
  async signUp(email: string, password: string, role: string = "citizen") {
    if (SUPABASE_URL.includes("your-project") || SUPABASE_URL === "") {
      return { user: { id: "mock-user-id", email, user_metadata: { role } } };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        },
      });
      if (error) throw error;
      return data;
    } catch (e: any) {
      if (
        e.message?.includes("fetch failed") || 
        e.message?.includes("Network request failed") || 
        e.message?.includes("UnknownHostException")
      ) {
        console.warn("Supabase network request failed, falling back to mock sign up");
        return { user: { id: "mock-user-id", email, user_metadata: { role } } };
      }
      throw e;
    }
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
    if (SUPABASE_URL.includes("your-project") || SUPABASE_URL === "") {
      useAuthStore.getState().logout();
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase sign out failed, clearing state anyway");
    } finally {
      useAuthStore.getState().logout();
    }
  },

  /**
   * Save complete profile initialization.
   */
  async saveUserProfile(profileData: any) {
    if (SUPABASE_URL.includes("your-project") || SUPABASE_URL === "") {
      useAuthStore.getState().setRole(profileData.role || "citizen");
      useAuthStore.getState().completeOnboarding();
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      const { error } = await supabase.from("profiles").upsert([
        {
          id: user.id,
          email: user.email,
          role: profileData.role || "citizen",
          full_name: profileData.fullName || "",
          username: profileData.username || "",
          phone: profileData.phone || "",
          country: profileData.country || "",
          city: profileData.city || "",
          pincode: profileData.pincode || "",
          bio: profileData.bio || "",
          theme: profileData.theme || "system",
          language: profileData.language || "en",
          updated_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;

      useAuthStore.getState().setRole(profileData.role || "citizen");
      useAuthStore.getState().completeOnboarding();
    } catch (e: any) {
      if (
        e.message?.includes("fetch failed") || 
        e.message?.includes("Network request failed") || 
        e.message?.includes("UnknownHostException")
      ) {
        console.warn("Supabase profiles upsert failed, skipping table updates in mock mode");
        useAuthStore.getState().setRole(profileData.role || "citizen");
        useAuthStore.getState().completeOnboarding();
      } else {
        throw e;
      }
    }
  },
};
