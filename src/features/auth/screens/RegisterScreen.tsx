// ============================================================
// LUMEN — Premium Registration Screen
// Phase 2: Authentication (Onboarding)
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
  const pillX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 4 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
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
            Join LUMEN
          </Text>
          <Text style={[TextStyles.body, { color: colors.textSecondary, marginTop: 4 }]}>
            Create your account to start building a smarter community.
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
  backToLogin: { alignItems: "center", marginTop: Spacing[2] },
});

export default RegisterScreen;
