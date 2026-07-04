// ============================================================
// LUMEN — Premium ForgetPassword Screen
// Phase 2: Authentication (Recovery)
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/design-system/ThemeContext";
import { Input } from "@/design-system/components/Input";
import { Button } from "@/design-system/components/Button";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";

export function ForgetPasswordScreen() {
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [success, setSuccess] = useState(false);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 4 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleSendLink = async () => {
    if (!email) {
      setEmailErr("Email is required");
      return;
    }
    setEmailErr("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: colors.bgBase }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.bgBase}
      />

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + Hero */}
        <Animated.View style={[s.hero, { opacity: logoAnim }]}>
          <View style={[s.wordmarkRow]}>
            <View style={[s.wordmarkDot, { backgroundColor: colors.brand }]} />
            <Text style={[TextStyles.badge, { color: colors.brand, letterSpacing: 3 }]}>LUMEN</Text>
          </View>
          <Text style={[TextStyles.heading1, { color: colors.textPrimary }]}>Recover Access</Text>
          <Text style={[TextStyles.body, { color: colors.textSecondary, marginTop: 4 }]}>
            Enter your email below and we'll send you an OTP code to reset your password.
          </Text>
        </Animated.View>

        {/* Card */}
        <Animated.View
          style={[
            s.card,
            {
              backgroundColor: colors.bgGlass,
              borderColor: colors.borderGlass,
              transform: [{ translateY: cardAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {success ? (
            <View style={s.successContainer}>
              <Text
                style={[
                  TextStyles.subtitle,
                  { color: colors.textPrimary, textAlign: "center", marginBottom: Spacing[2] },
                ]}
              >
                Check your Email
              </Text>
              <Text
                style={[
                  TextStyles.bodySmall,
                  { color: colors.textSecondary, textAlign: "center", marginBottom: Spacing[5] },
                ]}
              >
                We've sent a 6-digit OTP code to <Text style={{ fontWeight: "700" }}>{email}</Text>.
                Please check your inbox.
              </Text>
              <Button
                label="Enter OTP Code"
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => router.replace("/Otp" as any)}
                iconRight="forward"
              />
            </View>
          ) : (
            <View style={s.fields}>
              <Input
                label="Email address"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setEmailErr("");
                }}
                placeholder="yourname@lumen.app"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                iconLeft="email"
                error={emailErr}
              />
              <Button
                label={loading ? "Sending link…" : "Send Reset Code"}
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                onPress={handleSendLink}
              />
            </View>
          )}

          {/* Back to login */}
          <Pressable
            style={s.backToLogin}
            onPress={() => router.replace("/Login" as any)}
            accessibilityLabel="Back to sign in"
          >
            <Text style={[TextStyles.bodySmall, { color: colors.brand, fontWeight: "600" }]}>
              Back to sign in
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: 80,
    paddingBottom: Spacing[12],
    gap: Spacing[8],
  },
  hero: { gap: Spacing[3] },
  wordmarkRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: Spacing[2] },
  wordmarkDot: { width: 8, height: 8, borderRadius: 4 },
  card: {
    borderRadius: Radius["3xl"],
    borderWidth: 1,
    padding: Spacing[6],
    gap: Spacing[5],
    overflow: "hidden",
  },
  fields: { gap: Spacing[4] },
  successContainer: { alignItems: "center", paddingVertical: Spacing[2] },
  backToLogin: { alignItems: "center", marginTop: Spacing[2] },
});

export default ForgetPasswordScreen;
