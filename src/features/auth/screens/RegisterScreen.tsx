import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Pressable,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MotiView } from "moti";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/design-system/ThemeContext";
import { Radius, Spacing, TextStyles } from "@/design-system/tokens";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { AuthService } from "@/services/auth.service";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onRegister = async (data: RegisterFormData) => {
    setLoading(true);
    setErrorText(null);
    try {
      await AuthService.signUp(data.email, data.password, "citizen");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(citizen)/Dashboard" as any);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Registration failed. Try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#1E1B4B", "#0F172A", "#1E1B4B"]} style={StyleSheet.absoluteFill} />

      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ type: "timing", duration: 4000, loop: true }}
        style={[styles.glowOrb, { top: -50, right: -100, backgroundColor: "#A78BFA" }]}
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
              <LumenIcon name="profile" size="2xl" color="#A78BFA" />
            </View>
            <Text style={[TextStyles.heading1, styles.title]}>Create Account</Text>
            <Text style={[TextStyles.body, styles.subtitle]}>Join LUMEN to get started</Text>
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
                    placeholder="Create a password"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              <View style={styles.actionContainer}>
                <Button
                  label="Sign Up"
                  onPress={handleSubmit(onRegister)}
                  loading={loading}
                  variant="primary"
                  size="lg"
                  style={styles.registerBtn}
                />
              </View>
            </View>
          </BlurView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.loginText}>Sign In</Text>
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
    backgroundColor: "rgba(167, 139, 250, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.3)",
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
  actionContainer: {
    marginTop: 16,
  },
  registerBtn: {
    backgroundColor: "#A78BFA",
    shadowColor: "#A78BFA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
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
  loginText: {
    color: "#A78BFA",
    fontSize: 15,
    fontWeight: "700",
  },
});
