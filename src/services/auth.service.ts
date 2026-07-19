import { useAuthStore } from "../store/AuthStore";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { env } from "../config/env";

const API_URL = `${env.apiUrl}/auth`;
const SECURE_STORE_CREDENTIALS_KEY = "lumen_biometric_credentials";

export const AuthService = {
  initialize() {
    // Check tokens on startup if needed
  },

  getBiometricKey(email: string) {
    const safeEmail = email.toLowerCase().trim().replace(/[^a-z0-9._-]/g, "_");
    return `${SECURE_STORE_CREDENTIALS_KEY}_${safeEmail}`;
  },

  async generateOtp(data: {
    fullName?: string;
    email: string;
    phoneNumber?: string;
    password?: string;
  }) {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to generate OTP");
    }

    return response.json();
  },

  async generateForgotPasswordOtp(email: string) {
    // Same as generateOtp for now, or dedicated endpoint
    // We'll just use generateOtp without password to simulate a password reset OTP if needed
    // or add a new endpoint later. For now, assuming backend uses the same OTP flow.
    // NOTE: In a real system, you'd have a separate /auth/forgot-password that triggers OTP
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to generate OTP for password reset");
    }
  },

  async resetPassword(email: string, otp: string, newPassword: string) {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to reset password");
    }
  },

  async resendOtp(data: { email: string }) {
    const response = await fetch(`${API_URL}/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to resend OTP");
    }
    return response.json();
  },

  async verifyOtp(email: string, otp: string) {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Verification failed");
    }

    const data = await response.json();
    this.handleTokenResponse(data);
    return data.user;
  },

  async login(email: string, password: string) {
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
    this.handleTokenResponse(data);

    // Store last email for biometric login context
    await AsyncStorage.setItem("lumen_last_email", email);

    return data.user;
  },

  async enrollBiometric(email: string, password: string) {
    const session = useAuthStore.getState().session;
    if (!session || !session.access_token) throw new Error("No active session");

    // Authenticate with FaceID/Fingerprint first
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Enable Biometric Login",
      cancelLabel: "Cancel",
    });

    if (!result.success) {
      if (__DEV__) {
        console.warn(`Biometric authentication failed (${result.error}), but bypassing for DEV mode.`);
      } else {
        throw new Error(`Biometric authentication failed or was cancelled (${result.error || "unknown"}).`);
      }
    }

    if (!email) throw new Error("No email context found");

    // Store credentials securely under user-specific key
    const credentials = JSON.stringify({ email, password });
    const userBiometricKey = this.getBiometricKey(email);
    await SecureStore.setItemAsync(userBiometricKey, credentials);

    // Tell backend this user has biometric enabled
    const response = await fetch(`${API_URL}/biometric/enable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      let errMessage = "Unknown error";
      try {
        const err = await response.json();
        errMessage = err.message || JSON.stringify(err);
      } catch (e) {
        errMessage = response.statusText;
      }
      throw new Error(`Failed to enable biometric on backend: ${response.status} ${errMessage}`);
    }
  },

  async loginWithBiometric(email?: string) {
    // 1. Check if hardware exists
    let hasHardware = await LocalAuthentication.hasHardwareAsync();
    let isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (__DEV__) {
      hasHardware = true;
      isEnrolled = true;
    }

    if (!hasHardware || !isEnrolled) {
      throw new Error("Biometric hardware not available or not enrolled");
    }

    // 2. Determine target email
    const targetEmail = email || await AsyncStorage.getItem("lumen_last_email");
    if (!targetEmail) {
      throw new Error("Please specify an email or enroll first");
    }

    // 3. Check if credentials exist in SecureStore for this specific email
    const userBiometricKey = this.getBiometricKey(targetEmail);
    const storedCredentials = await SecureStore.getItemAsync(userBiometricKey);
    if (!storedCredentials) {
      throw new Error(`No biometric credentials found for ${targetEmail}`);
    }

    // 4. Authenticate with FaceID/Fingerprint to unlock
    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: "Login to LUMEN",
      cancelLabel: "Cancel",
    });

    if (!authResult.success) {
      if (__DEV__) {
        console.warn(`Biometric login failed (${authResult.error}), but bypassing for DEV mode.`);
      } else {
        throw new Error(`Biometric does not match. Please retry again. (${authResult.error || "unknown"})`);
      }
    }

    // 5. Parse credentials and login via backend
    const { email: storedEmail, password } = JSON.parse(storedCredentials);
    return this.login(storedEmail, password);
  },

  async logout(keepBiometric: boolean = true) {
    const session = useAuthStore.getState().session;

    if (session?.access_token) {
      // Best effort backend logout
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ refreshToken: session.refresh_token }),
        });
      } catch (e) {}
    }

    if (!keepBiometric) {
      const lastEmail = await AsyncStorage.getItem("lumen_last_email");
      if (lastEmail) {
        const userBiometricKey = this.getBiometricKey(lastEmail);
        await SecureStore.deleteItemAsync(userBiometricKey);
      }
    }

    useAuthStore.getState().logout();
  },

  handleTokenResponse(data: any) {
    useAuthStore.getState().setRole(data.user.role);
    useAuthStore.getState().setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
    } as any);
  },
};
