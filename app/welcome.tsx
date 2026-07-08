import React from "react";
import { View, StyleSheet, Dimensions, Text, StatusBar, Platform } from "react-native";
import { router } from "expo-router";
import { MotiView, MotiText } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTheme } from "@/design-system/ThemeContext";
import { Radius, Spacing, TextStyles } from "@/design-system/tokens";
import { Button } from "@/design-system/components/Button";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import * as AppleAuthentication from "expo-apple-authentication";

const { width: W, height: H } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[s.container, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Animated Background */}
      <LinearGradient
        colors={[colors.brand + "10", colors.bgBase, colors.brand + "15"]}
        style={StyleSheet.absoluteFill}
      />

      <MotiView
        from={{ translateY: -50, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ type: "timing", duration: 1500, loop: true, repeatReverse: true }}
        style={[s.floatingShape, { backgroundColor: colors.brand + "20", top: "10%", left: "10%" }]}
      />
      
      <MotiView
        from={{ translateY: 50, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ type: "timing", duration: 2000, loop: true, repeatReverse: true }}
        style={[s.floatingShape2, { backgroundColor: "#7C3AED20", top: "25%", right: "10%" }]}
      />

      <View style={s.content}>
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 100 }}
          style={s.header}
        >
          <View style={s.logoWrapper}>
            <View style={[s.logoDot, { backgroundColor: colors.brand }]} />
            <Text style={[TextStyles.badge, { color: colors.brand, letterSpacing: 4 }]}>LUMEN</Text>
          </View>
          <Text style={[TextStyles.heading1, { color: colors.textPrimary, fontSize: 40, lineHeight: 48 }]}>
            Smarter Cities,{"\n"}Better Lives.
          </Text>
          <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
            Join the premium platform for civic infrastructure management and community reporting.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 300 }}
          style={s.actionsContainer}
        >
          <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={s.glassCard}>
            <View style={s.actions}>
              <Button
                label="Create Account"
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => router.push("/onboarding" as any)}
                iconRight="forward"
              />
              
              <Button
                label="Sign In"
                variant="secondary"
                size="lg"
                fullWidth
                onPress={() => router.push("/(auth)/Login" as any)}
              />

              <View style={s.divider}>
                <View style={[s.line, { backgroundColor: colors.borderDefault }]} />
                <Text style={[TextStyles.caption, { color: colors.textTertiary, marginHorizontal: Spacing[2] }]}>
                  or continue with
                </Text>
                <View style={[s.line, { backgroundColor: colors.borderDefault }]} />
              </View>

              <View style={s.socialRow}>
                <Button
                  label="Google"
                  variant="outline"
                  size="md"
                  style={{ flex: 1 }}
                  // TODO: Add Google icon support in LumenIcon or SVG
                />
                
                {Platform.OS === "ios" && (
                  <Button
                    label="Apple"
                    variant="outline"
                    size="md"
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            </View>
          </BlurView>
        </MotiView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing[6],
    justifyContent: "space-between",
    paddingTop: H * 0.15,
    paddingBottom: Spacing[10],
  },
  floatingShape: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    filter: "blur(30px)",
  },
  floatingShape2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    filter: "blur(20px)",
  },
  header: {
    gap: Spacing[4],
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actionsContainer: {
    marginTop: "auto",
  },
  glassCard: {
    borderRadius: Radius["3xl"],
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  actions: {
    padding: Spacing[6],
    gap: Spacing[4],
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing[2],
  },
  line: {
    flex: 1,
    height: 1,
  },
  socialRow: {
    flexDirection: "row",
    gap: Spacing[3],
  },
});
