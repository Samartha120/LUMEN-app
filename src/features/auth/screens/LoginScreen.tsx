import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Pressable,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MotiView } from "moti";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { TextStyles } from "@/design-system/tokens";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { AuthService } from "@/services/auth.service";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SECURE_STORE_CREDENTIALS_KEY = "lumen_biometric_credentials";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [canUseBiometric, setCanUseBiometric] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const storedCreds = await SecureStore.getItemAsync(SECURE_STORE_CREDENTIALS_KEY);
      
      if (hasHardware && isEnrolled && storedCreds) {
        setCanUseBiometric(true);
      }
    } catch (e) {
      console.warn("Biometric check failed", e);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const promptEnableBiometric = async (password: string) => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (hasHardware && isEnrolled) {
      const storedCreds = await SecureStore.getItemAsync(SECURE_STORE_CREDENTIALS_KEY);
      if (!storedCreds) {
        // Show prompt to enroll
        return new Promise<void>((resolve) => {
          Alert.alert(
            "Enable Face ID / Touch ID?",
            "Would you like to securely log in with biometrics next time?",
            [
              { text: "Not Now", style: "cancel", onPress: () => resolve() },
              {
                text: "Enable",
                onPress: async () => {
                  try {
                    await AuthService.enrollBiometric(password);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  } catch (e: any) {
                    Alert.alert("Failed to enroll", e.message);
                  }
                  resolve();
                },
              },
            ]
          );
        });
      }
    }
  };

  const onLogin = async (data: LoginFormData) => {
    setLoading(true);
    setErrorText(null);
    try {
      const user = await AuthService.login(data.email, data.password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Offer to enable biometric if applicable
      await promptEnableBiometric(data.password);

      if (user.role === "engineer") {
        router.replace("/(engineer)/Dashboard" as any);
      } else {
        router.replace("/(citizen)/Dashboard" as any);
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Invalid email or password.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const user = await AuthService.loginWithBiometric();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (user.role === "engineer") {
        router.replace("/(engineer)/Dashboard" as any);
      } else {
        router.replace("/(citizen)/Dashboard" as any);
      }
    } catch (err: any) {
      setErrorText(err.message || "Biometric login failed.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0F172A", "#1E1B4B", "#0F172A"]} style={StyleSheet.absoluteFill} />

      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ type: "timing", duration: 3000, loop: true }}
        style={[styles.glowOrb, { top: -100, left: -100, backgroundColor: "#38BDF8" }]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 100 }}
          style={styles.content}
        >
          <View style={styles.headerContainer}>
            <View style={styles.logoWrapper}>
              <LumenIcon name="circle" size="2xl" color="#38BDF8" />
            </View>
            <Text style={[TextStyles.heading1, styles.title]}>Welcome Back</Text>
            <Text style={[TextStyles.body, styles.subtitle]}>Sign in to continue to LUMEN</Text>
          </View>

          <BlurView intensity={20} tint="dark" style={styles.glassCard}>
            <View style={styles.formContainer}>
              {errorText && (
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.errorBox}>
                  <LumenIcon name="info" size="sm" color="#F87171" />
                  <Text style={styles.errorText}>{errorText}</Text>
                </MotiView>
              )}

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />

              <Pressable style={styles.forgotPassword} onPress={() => router.push("/(auth)/ForgotPassword" as any)}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>

              <View style={styles.actionContainer}>
                <Button
                  label="Sign In"
                  onPress={handleSubmit(onLogin)}
                  loading={loading}
                  variant="primary"
                  size="lg"
                  style={styles.loginBtn}
                />
                
                {canUseBiometric && (
                  <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16 }}>
                    <Button
                      label="Sign in with Face ID"
                      onPress={handleBiometricLogin}
                      variant="outline"
                      size="lg"
                      style={styles.biometricBtn}
                    />
                  </MotiView>
                )}
              </View>
            </View>
          </BlurView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.push("/(auth)/Register" as any)}>
              <Text style={styles.registerText}>Create one</Text>
            </Pressable>
          </View>
        </MotiView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  glowOrb: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    filter: "blur(50px)",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  title: {
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    color: "#94A3B8",
    textAlign: "center",
  },
  glassCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  formContainer: {
    padding: 24,
    gap: 16,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.3)",
    gap: 8,
  },
  errorText: {
    color: "#F87171",
    fontSize: 14,
    flex: 1,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -8,
  },
  forgotText: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "600",
  },
  actionContainer: {
    marginTop: 12,
  },
  loginBtn: {
    backgroundColor: "#38BDF8",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  biometricBtn: {
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#94A3B8",
    fontSize: 15,
  },
  registerText: {
    color: "#38BDF8",
    fontSize: 15,
    fontWeight: "700",
  },
});
