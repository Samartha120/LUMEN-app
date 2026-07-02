// ============================================================
// LUMEN — Premium OTP Verification Screen
// Phase 2: Authentication (Verification)
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

export function OtpScreen() {
  const { colors, isDark } = useTheme();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeErr, setCodeErr] = useState("");
  const [timer, setTimer] = useState(59);

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

    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (code.length < 6) {
      setCodeErr("Enter the complete 6-digit verification code");
      return;
    }
    setCodeErr("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    // Success: navigate to dashboard or login
    router.replace("/(citizen)/Dashboard" as any);
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: colors.bgBase }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bgBase} />

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
          <Text style={[TextStyles.heading1, { color: colors.textPrimary }]}>
            Verify Code
          </Text>
          <Text style={[TextStyles.body, { color: colors.textSecondary, marginTop: 4 }]}>
            Enter the 6-digit confirmation code we sent to your address.
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
          <View style={s.fields}>
            <Input
              label="Verification Code"
              value={code}
              onChangeText={(t) => { setCode(t.replace(/[^0-9]/g, "").slice(0, 6)); setCodeErr(""); }}
              placeholder="000 000"
              keyboardType="number-pad"
              autoFocus
              maxLength={6}
              iconLeft="shield"
              error={codeErr}
              style={s.codeText}
            />

            <Button
              label={loading ? "Verifying…" : "Confirm Code"}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleVerify}
            />
          </View>

          {/* Resend info */}
          <View style={s.resendContainer}>
            {timer > 0 ? (
              <Text style={[TextStyles.bodySmall, { color: colors.textTertiary }]}>
                Resend code in <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>{timer}s</Text>
              </Text>
            ) : (
              <Pressable onPress={() => setTimer(59)}>
                <Text style={[TextStyles.bodySmall, { color: colors.brand, fontWeight: "600" }]}>
                  Resend verification code
                </Text>
              </Pressable>
            )}
          </View>

          {/* Back link */}
          <Pressable style={s.backLink} onPress={() => router.replace("/Login" as any)} accessibilityLabel="Back to sign in">
            <Text style={[TextStyles.bodySmall, { color: colors.textTertiary }]}>
              Back to <Text style={{ color: colors.brand, fontWeight: "600" }}>Sign In</Text>
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
  codeText: {
    letterSpacing: 8,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },
  resendContainer: { alignItems: "center", marginTop: Spacing[2] },
  backLink: { alignItems: "center" },
});

export default OtpScreen;
