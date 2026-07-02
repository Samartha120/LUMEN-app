// ============================================================
// LUMEN — Premium Login Screen
// Phase 2: Authentication
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
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/design-system/ThemeContext";
import { Input } from "@/design-system/components/Input";
import { Button } from "@/design-system/components/Button";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";

const { width: SCREEN_W } = Dimensions.get("window");
type Role = "citizen" | "engineer";

const DEMO = {
  citizen: { email: "citizen@lumen.app", password: "demo1234" },
  engineer: { email: "engineer@lumen.app", password: "demo1234" },
};

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const [role, setRole] = useState<Role>("citizen");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [passErr, setPassErr] = useState("");

  // Entrance animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Orb float
  const orbAnim = useRef(new Animated.Value(0)).current;
  // Role pill indicator
  const pillX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance sequence
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 4 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Floating orb loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orbAnim, { toValue: 0, duration: 4000, useNativeDriver: true }),
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
    setEmailErr("");
    setPassErr("");
    setEmail("");
    setPassword("");
  };

  const fillDemo = () => {
    setEmail(DEMO[role].email);
    setPassword(DEMO[role].password);
    setEmailErr("");
    setPassErr("");
  };

  const handleSignIn = async () => {
    let valid = true;
    if (!email) { setEmailErr("Email is required"); valid = false; }
    if (!password) { setPassErr("Password is required"); valid = false; }
    if (!valid) return;

    const cred = DEMO[role];
    if (email.trim().toLowerCase() !== cred.email || password !== cred.password) {
      setEmailErr("Invalid credentials. Tap ✦ Fill Demo to auto-fill.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    router.replace((role === "citizen" ? "/(citizen)/Dashboard" : "/(engineer)/Dashboard") as any);
  };

  const orbTranslateY = orbAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -24] });
  const pillTranslateX = pillX.interpolate({ inputRange: [0, 1], outputRange: [0, (SCREEN_W - 48 - 24) / 2] });

  const ROLE_ICON = role === "citizen" ? "🏘️" : "⚙️";

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: colors.bgBase }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bgBase} />

      {/* Decorative orbs */}
      <Animated.View
        style={[s.orbTopRight, { backgroundColor: colors.brand + "1A", transform: [{ translateY: orbTranslateY }] }]}
      />
      <Animated.View
        style={[s.orbBottomLeft, { backgroundColor: colors.brand + "0D", transform: [{ translateY: Animated.multiply(orbTranslateY, -1) }] }]}
      />
      <View style={[s.orbMid, { backgroundColor: colors.brand + "08" }]} />

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
            Welcome{"\n"}back.
          </Text>
          <Text style={[TextStyles.body, { color: colors.textSecondary, marginTop: 4 }]}>
            Civic infrastructure, intelligently managed.
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
          {/* Role Selector */}
          <View style={s.roleSection}>
            <Text style={[TextStyles.label, { color: colors.textSecondary, marginBottom: Spacing[2] }]}>
              Sign in as
            </Text>
            <View style={[s.roleContainer, { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault }]}>
              {/* Animated pill */}
              <Animated.View
                style={[s.rolePill, { backgroundColor: colors.bgSurface, transform: [{ translateX: pillTranslateX }], width: (SCREEN_W - 48 - 24) / 2 }]}
              />
              {(["citizen", "engineer"] as Role[]).map((r) => (
                <Pressable
                  key={r}
                  style={s.roleBtn}
                  onPress={() => setRoleAnimated(r)}
                  accessibilityRole="button"
                  accessibilityLabel={`Sign in as ${r}`}
                >
                  <Text style={[TextStyles.label, { color: role === r ? colors.brand : colors.textTertiary }]}>
                    {r === "citizen" ? "🏘 Citizen" : "⚙️ Engineer"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Fields */}
          <View style={s.fields}>
            <Input
              label="Email address"
              value={email}
              onChangeText={(t) => { setEmail(t); setEmailErr(""); }}
              placeholder={`${role}@lumen.app`}
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
              placeholder="••••••••"
              secureTextEntry
              iconLeft="lock"
              error={passErr}
            />
          </View>

          {/* Demo Fill */}
          <Pressable
            style={[s.demoBtn, { backgroundColor: colors.brandSoft, borderColor: colors.brandBorder }]}
            onPress={fillDemo}
            accessibilityLabel="Fill demo credentials"
          >
            <LumenIcon name="spark" size="sm" color={colors.brand} strokeWidth={2} />
            <Text style={[TextStyles.label, { color: colors.brand }]}>
              Fill demo credentials · {role}
            </Text>
          </Pressable>

          {/* Sign In */}
          <Button
            label={loading ? "Signing in…" : "Sign in"}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onPress={handleSignIn}
            iconRight={loading ? undefined : "forward"}
          />

          {/* Forgot */}
          <Pressable style={s.forgot} accessibilityLabel="Forgot password">
            <Text style={[TextStyles.bodySmall, { color: colors.textTertiary }]}>
              Forgot password?{" "}
              <Text style={{ color: colors.brand, fontWeight: "600" }}>Reset</Text>
            </Text>
          </Pressable>
        </Animated.View>

        {/* Footer */}
        <Text style={[TextStyles.caption, { color: colors.textTertiary, textAlign: "center", marginTop: Spacing[6] }]}>
          Demo mode · LUMEN v1.0 · No real data used
        </Text>
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
  wordmarkRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: Spacing[2] },
  wordmarkDot: { width: 8, height: 8, borderRadius: 4 },
  card: {
    borderRadius: Radius["3xl"],
    borderWidth: 1,
    padding: Spacing[6],
    gap: Spacing[5],
    overflow: "hidden",
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
  fields: { gap: Spacing[4] },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[2],
    paddingVertical: Spacing[2.5],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  forgot: { alignItems: "center" },
});
