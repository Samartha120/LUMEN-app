import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Pressable,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MotiView, MotiText } from "moti";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { AuthService } from "@/services/auth.service";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

const SECURE_STORE_CREDENTIALS_KEY = "lumen_biometric_credentials";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Floating animated orb component
function FloatingOrb({
  color,
  size,
  top,
  left,
  right,
  bottom,
  delay,
  duration,
}: {
  color: string;
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  delay: number;
  duration: number;
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 800 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 1000 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(20, { duration: duration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.55,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top,
          left,
          right,
          bottom,
        },
        animStyle,
      ]}
    />
  );
}

// Pulsing ring animation for the logo
function PulsingLogo() {
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);

  useEffect(() => {
    ring1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );
    ring2.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );
  }, []);

  const ring1Style = useAnimatedStyle(() => ({
    opacity: interpolate(ring1.value, [0, 0.5, 1], [0.6, 0.2, 0]),
    transform: [{ scale: interpolate(ring1.value, [0, 1], [1, 1.8]) }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: interpolate(ring2.value, [0, 0.5, 1], [0.4, 0.1, 0]),
    transform: [{ scale: interpolate(ring2.value, [0, 1], [1, 2.2]) }],
  }));

  return (
    <View style={logoStyles.container}>
      <Animated.View style={[logoStyles.ring, ring2Style]} />
      <Animated.View style={[logoStyles.ring, ring1Style]} />
      <LinearGradient
        colors={["#38BDF8", "#818CF8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={logoStyles.logoGradient}
      >
        <LumenIcon name="spark" size="xl" color="#FFFFFF" />
      </LinearGradient>
    </View>
  );
}

const logoStyles = StyleSheet.create({
  container: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#38BDF8",
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});

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
      await promptEnableBiometric(data.password);
      if (user.role === "engineer") {
        router.replace("/(engineer)/Dashboard" as any);
      } else {
        router.replace("/(citizen)/Dashboard" as any);
      }
    } catch (err: any) {
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

      {/* Background gradient */}
      <LinearGradient colors={["#060818", "#0D1235", "#060818"]} style={StyleSheet.absoluteFill} />

      {/* Atmospheric orbs */}
      <FloatingOrb color="#38BDF8" size={340} top={-120} left={-140} delay={0} duration={4000} />
      <FloatingOrb
        color="#818CF8"
        size={250}
        bottom={50}
        right={-100}
        delay={300}
        duration={5000}
      />
      <FloatingOrb
        color="#6EE7B7"
        size={180}
        top={height * 0.3}
        right={-60}
        delay={600}
        duration={3500}
      />

      {/* Fine grid overlay */}
      <View style={styles.gridOverlay} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header section */}
          <MotiView
            from={{ opacity: 0, translateY: -30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 100, damping: 18 }}
            style={styles.headerSection}
          >
            <PulsingLogo />
            <MotiText
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: 300 }}
              style={styles.brand}
            >
              LUMEN
            </MotiText>
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", delay: 450, duration: 500 }}
            >
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your account to continue</Text>
            </MotiView>
          </MotiView>

          {/* Glass card */}
          <MotiView
            from={{ opacity: 0, translateY: 40, scale: 0.96 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: "spring", delay: 250, damping: 18, stiffness: 120 }}
          >
            <BlurView intensity={28} tint="dark" style={styles.glassCard}>
              {/* Top accent line */}
              <LinearGradient
                colors={["#38BDF8", "#818CF8", "#6EE7B7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardAccentLine}
              />

              <View style={styles.formContainer}>
                {/* Error box */}
                {errorText && (
                  <MotiView
                    from={{ opacity: 0, translateY: -8, scale: 0.97 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 16 }}
                    style={styles.errorBox}
                  >
                    <View style={styles.errorIcon}>
                      <LumenIcon name="warning" size="sm" color="#F87171" />
                    </View>
                    <Text style={styles.errorText}>{errorText}</Text>
                  </MotiView>
                )}

                {/* Email field */}
                <MotiView
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: "spring", delay: 400, damping: 18 }}
                >
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Email Address"
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        iconLeft="email"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.email?.message}
                        size="lg"
                      />
                    )}
                  />
                </MotiView>

                {/* Password field */}
                <MotiView
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: "spring", delay: 500, damping: 18 }}
                >
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Password"
                        placeholder="Enter your password"
                        secureTextEntry
                        iconLeft="lock"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.password?.message}
                        size="lg"
                      />
                    )}
                  />
                </MotiView>

                {/* Forgot password */}
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "timing", delay: 600, duration: 400 }}
                  style={styles.forgotRow}
                >
                  <Pressable
                    onPress={() => router.push("/(auth)/ForgotPassword" as any)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  >
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </Pressable>
                </MotiView>

                {/* Sign In Button */}
                <MotiView
                  from={{ opacity: 0, translateY: 16 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "spring", delay: 650, damping: 16 }}
                  style={styles.actionContainer}
                >
                  <Pressable
                    onPress={handleSubmit(onLogin)}
                    disabled={loading}
                    style={({ pressed }) => [
                      styles.gradientBtnWrapper,
                      {
                        opacity: loading ? 0.8 : pressed ? 0.92 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={loading ? ["#4B5563", "#374151"] : ["#38BDF8", "#818CF8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientBtn}
                    >
                      {loading ? (
                        <MotiView
                          from={{ rotate: "0deg" }}
                          animate={{ rotate: "360deg" }}
                          transition={{ type: "timing", duration: 800, loop: true }}
                        >
                          <LumenIcon name="refresh" size="md" color="#FFFFFF" />
                        </MotiView>
                      ) : (
                        <View style={styles.btnInner}>
                          <Text style={styles.gradientBtnText}>Sign In</Text>
                          <LumenIcon name="forward" size="md" color="#FFFFFF" />
                        </View>
                      )}
                    </LinearGradient>
                  </Pressable>
                </MotiView>

                {/* Biometric login */}
                {canUseBiometric && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", delay: 750, damping: 16 }}
                  >
                    <View style={styles.dividerRow}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>or continue with</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <Pressable
                      onPress={handleBiometricLogin}
                      style={({ pressed }) => [
                        styles.biometricBtn,
                        { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                      ]}
                    >
                      <LinearGradient
                        colors={["rgba(56,189,248,0.12)", "rgba(129,140,248,0.12)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.biometricGradient}
                      >
                        <LumenIcon name="biometric" size="lg" color="#38BDF8" />
                        <Text style={styles.biometricText}>Face ID / Touch ID</Text>
                      </LinearGradient>
                    </Pressable>
                  </MotiView>
                )}
              </View>
            </BlurView>
          </MotiView>

          {/* Footer */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", delay: 800, duration: 500 }}
            style={styles.footer}
          >
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable
              onPress={() => router.push("/(auth)/Register" as any)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={styles.registerLink}>Create Account</Text>
            </Pressable>
          </MotiView>

          {/* Bottom trust badge */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", delay: 1000, duration: 500 }}
            style={styles.trustRow}
          >
            <LumenIcon name="shield" size="xs" color="#4B5563" />
            <Text style={styles.trustText}>256-bit encrypted · Secure login</Text>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060818",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.04,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  brand: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 8,
    color: "#38BDF8",
    marginTop: 14,
    marginBottom: 20,
    opacity: 0.9,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#F8FAFC",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
  glassCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(10,15,40,0.6)",
  },
  cardAccentLine: {
    height: 2,
    width: "100%",
  },
  formContainer: {
    padding: 24,
    gap: 18,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239,68,68,0.1)",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    gap: 10,
  },
  errorIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(239,68,68,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 13.5,
    flex: 1,
    lineHeight: 20,
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotText: {
    color: "#38BDF8",
    fontSize: 13.5,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  actionContainer: {
    marginTop: 4,
  },
  gradientBtnWrapper: {
    borderRadius: 16,
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  gradientBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  gradientBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  dividerText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  biometricBtn: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  biometricGradient: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  biometricText: {
    color: "#7DD3FC",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },
  footerText: {
    color: "#475569",
    fontSize: 15,
  },
  registerLink: {
    color: "#38BDF8",
    fontSize: 15,
    fontWeight: "700",
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 6,
  },
  trustText: {
    color: "#374151",
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
