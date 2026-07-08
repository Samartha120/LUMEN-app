import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../ThemeContext";
import { LumenIcon } from "../icons/LumenIcon";
import { Radius, Spacing, TextStyles } from "../tokens";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

interface AnimatedRoleCardProps {
  role: "citizen" | "engineer";
  selected: boolean;
  onSelect: () => void;
}

const ROLE_INFO = {
  citizen: {
    title: "Citizen",
    description: "Report civic issues, track progress, and improve your community.",
    icon: "home",
    features: ["Report Issues", "Live Tracking", "Community Alerts"],
    color: "#208AEF",
  },
  engineer: {
    title: "Engineer",
    description: "Manage assigned tasks, update statuses, and coordinate field work.",
    icon: "tools",
    features: ["Task Management", "Field Updates", "Performance Analytics"],
    color: "#F79009",
  },
};

export function AnimatedRoleCard({ role, selected, onSelect }: AnimatedRoleCardProps) {
  const { colors, isDark } = useTheme();
  const info = ROLE_INFO[role];

  const handlePress = () => {
    Haptics.selectionAsync();
    onSelect();
  };

  return (
    <Pressable onPress={handlePress} style={s.pressable}>
      <MotiView
        animate={{
          scale: selected ? 1 : 0.95,
          opacity: selected ? 1 : 0.7,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        style={[s.card, { borderColor: selected ? info.color : "transparent" }]}
      >
        {selected && (
          <LinearGradient
            colors={[info.color + "40", info.color + "10", "transparent"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <BlurView
          intensity={isDark ? 20 : 40}
          tint={isDark ? "dark" : "light"}
          style={[
            s.glass,
            { backgroundColor: isDark ? "rgba(26,26,46,0.5)" : "rgba(255,255,255,0.7)" },
          ]}
        >
          <View style={s.content}>
            <View style={[s.header]}>
              <View style={[s.iconWrapper, { backgroundColor: info.color + "20" }]}>
                <LumenIcon name={info.icon as any} size="md" color={info.color} />
              </View>
              {selected && (
                <MotiView
                  from={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring" }}
                >
                  <LumenIcon name="checkCircle" size="md" color={info.color} />
                </MotiView>
              )}
            </View>
            <View style={s.textContainer}>
              <Text style={[TextStyles.heading2, { color: colors.textPrimary }]}>{info.title}</Text>
              <Text
                style={[TextStyles.body, { color: colors.textSecondary, marginTop: Spacing[1] }]}
              >
                {info.description}
              </Text>
            </View>
            <View style={s.featuresList}>
              {info.features.map((feat, idx) => (
                <View key={idx} style={s.featureItem}>
                  <LumenIcon name="check" size="sm" color={info.color} />
                  <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>{feat}</Text>
                </View>
              ))}
            </View>
          </View>
        </BlurView>
      </MotiView>
    </Pressable>
  );
}

const s = StyleSheet.create({
  pressable: {
    flex: 1,
    marginBottom: Spacing[4],
  },
  card: {
    borderRadius: Radius["2xl"],
    borderWidth: 2,
    overflow: "hidden",
  },
  glass: {
    flex: 1,
  },
  content: {
    padding: Spacing[6],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing[4],
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginBottom: Spacing[4],
  },
  featuresList: {
    gap: Spacing[2],
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
});
