// ============================================================
// LUMEN — Premium Registration Screen
// Phase 2: Authentication (Onboarding)
// ============================================================
import { useTheme } from "@/design-system/ThemeContext";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Radius, Spacing, TextStyles } from "@/design-system/tokens";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");
type Role = "citizen" | "engineer";

export function RegisterScreen() {
  const { colors, isDark } = useTheme();
  const [role, setRole] = useState<Role>("citizen");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameErr, setNameErr] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [passErr, setPassErr] = useState("");

  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pillX = useRef(new Animated.Value(0)).current;
  const orbAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.parallel([
        Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 8 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 8 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Floating orb animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(orbAnim, { toValue: 0, duration: 5000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const setRoleAnimated = (r: Role) => {
    setRole(r);
    Animated.spring(pillX, {
      toValue: r === "citizen" ? 0 : 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const handleRegister = async () => {
    let valid = true;
    if (!fullName) { setNameErr("Full name is required"); valid = false; }
    if (!email) { setEmailErr("Email is required"); valid = false; }
    if (!password) { setPassErr("Password is required"); valid = false; }
    if (!valid) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    // Go to verify email
    router.replace("/Verify-email" as any);
  };

  const pillTranslateX = pillX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (SCREEN_W - 48 - 24) / 2],
  });
  const orbTranslateY = orbAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const ROLE_ICON = role === "citizen" ? "home" : "tool";

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: colors.bgBase }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bgBase} />

      {/* Decorative gradient orbs */}
      <LinearGradient
        colors={[colors.brand + "15", colors.brand + "05", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.topGradient}
      />
      <Animated.View
        style={[s.orbTopRight, { backgroundColor: colors.brand + "12", transform: [{ translateY: orbTranslateY }] }]}
      />
      <Animated.View
        style={[s.orbBottomLeft, { backgroundColor: "#7C3AED10", transform: [{ translateY: Animated.multiply(orbTranslateY, -1) }] }]}
      />
      <Animated.View
        style={[s.orbMid, { backgroundColor: "#12B76A08", transform: [{ translateY: orbTranslateY }] }]}
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
            <Text style={[TextStyles.badge, { color: colors.brand, letterSpacing: 4 }]}>LUMEN</Text>
          </View>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Text style={[TextStyles.heading1, { color: colors.textPrimary, lineHeight: 50 }]}>
              Join LUMEN
            </Text>
          </Animated.View>
          <Text style={[TextStyles.body, { color: colors.textSecondary, marginTop: 4 }]}>
            Create your account to start building a smarter community.
          </Text>
        </Animated.View>

        {/* Glass Card */}
        <Animated.View
          style={{
            transform: [{ translateY: cardAnim }],
            opacity: fadeAnim,
          }}
        >
          <BlurView intensity={25} tint={isDark ? "dark" : "light"} style={s.glassCard}>
            <LinearGradient
              colors={[isDark ? "#1a1a2e30" : "#ffffff50", isDark ? "#1a1a2e15" : "#ffffff25"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.cardContent}>
              {/* Role Selector */}
              <View style={s.roleSection}>
                <Text style={[TextStyles.label, { color: colors.textSecondary, marginBottom: Spacing[2] }]}>
                  Register as
                </Text>
                <View style={[s.roleContainer, { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault }]}>
                  <Animated.View
                    style={[s.rolePill, { backgroundColor: colors.bgSurface, transform: [{ translateX: pillTranslateX }], width: (SCREEN_W - 48 - 24) / 2 }]}
                  />
                  {(["citizen", "engineer"] as Role[]).map((r) => (
                    <Pressable
                      key={r}
                      style={s.roleBtn}
                      onPress={() => setRoleAnimated(r)}
                      accessibilityRole="button"
                      accessibilityLabel={`Register as ${r}`}
                    >
                      <View style={s.roleBtnContent}>
                        <LumenIcon name={ROLE_ICON as any} size="sm" color={role === r ? colors.brand : colors.textTertiary} strokeWidth={2} />
                        <Text style={[TextStyles.label, { color: role === r ? colors.brand : colors.textTertiary }]}>
                          {r === "citizen" ? "Citizen" : "Engineer"}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>

          {/* Fields */}
          <View style={s.fields}>
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={(t) => { setFullName(t); setNameErr(""); }}
              placeholder="Samuel Krishnamurthy"
              autoCapitalize="words"
              iconLeft="profile"
              error={nameErr}
            />
            <Input
              label="Email address"
              value={email}
              onChangeText={(t) => { setEmail(t); setEmailErr(""); }}
              placeholder="yourname@lumen.app"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              iconLeft="email"
              error={emailErr}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={(t) => { setPassword(t); setPassErr(""); }}
              placeholder="Minimum 8 characters"
              secureTextEntry
              iconLeft="lock"
              error={passErr}
            />
          </View>

          {/* Register Button */}
          <Button
            label={loading ? "Registering…" : "Create Account"}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onPress={handleRegister}
            iconRight={loading ? undefined : "forward"}
          />

              {/* Back to login */}
              <Pressable style={s.backToLogin} onPress={() => router.push("/Login" as any)} accessibilityLabel="Back to sign in">
                <Text style={[TextStyles.bodySmall, { color: colors.textTertiary }]}>
                  Already registered?{" "}
                  <Text style={{ color: colors.brand, fontWeight: "600" }}>Sign In</Text>
                </Text>
              </Pressable>
            </View>
          </BlurView>
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
    paddingTop: 60,
    paddingBottom: Spacing[12],
    gap: Spacing[8],
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  orbTopRight: {
    position: "absolute", top: -100, right: -100,
    width: 280, height: 280, borderRadius: 140,
  },
  orbBottomLeft: {
    position: "absolute", bottom: -120, left: -100,
    width: 320, height: 320, borderRadius: 160,
  },
  orbMid: {
    position: "absolute", top: "40%", right: -60,
    width: 180, height: 180, borderRadius: 90,
  },
  hero: { gap: Spacing[3] },
  wordmarkRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: Spacing[2] },
  wordmarkDot: { width: 10, height: 10, borderRadius: 5 },
  glassCard: {
    borderRadius: Radius["3xl"],
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardContent: {
    padding: Spacing[6],
    gap: Spacing[5],
  },
  roleSection: {},
  roleContainer: {
    flexDirection: "row",
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: 4,
    position: "relative",
    height: 48,
  },
  rolePill: {
    position: "absolute",
    top: 4,
    left: 4,
    height: 40,
    borderRadius: Radius.lg,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  roleBtn: { flex: 1, alignItems: "center", justifyContent: "center" },
  roleBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
  fields: { gap: Spacing[4] },
  backToLogin: { alignItems: "center", marginTop: Spacing[2] },
});

export default RegisterScreen;
