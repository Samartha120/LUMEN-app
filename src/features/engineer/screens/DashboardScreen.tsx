// ============================================================
// LUMEN — Engineer Dashboard (Uber-Driver Style)
// Premium Command Center
// ============================================================
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar, Dimensions, Pressable } from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon, type LumenIconName } from "@/design-system/icons/LumenIcon";
import { Avatar } from "@/design-system/components/Avatar";
import { Badge } from "@/design-system/components/Badge";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";

const { width: W } = Dimensions.get("window");

type EngStatus = "available" | "on_job" | "break";

interface Task {
  id: string;
  title: string;
  address: string;
  category: LumenIconName;
  priority: "high" | "medium" | "low";
  distance: string;
  eta: string;
  status: "pending" | "in_progress" | "done";
}

const TASKS: Task[] = [
  {
    id: "T001",
    title: "Repair large pothole",
    address: "123 MG Road, Bangalore",
    category: "navigate",
    priority: "high",
    distance: "1.2 km",
    eta: "15 min",
    status: "in_progress",
  },
  {
    id: "T002",
    title: "Fix street light panel",
    address: "Park Ave, 2nd Block",
    category: "electricity",
    priority: "medium",
    distance: "3.4 km",
    eta: "30 min",
    status: "pending",
  },
];

const PRIORITY_COLOR: Record<string, string> = {
  high: "#F04438",
  medium: "#F79009",
  low: "#12B76A",
};

const STATUS_CONF: Record<EngStatus, { label: string; color: string; bg: string }> = {
  available: { label: "Available", color: "#12B76A", bg: "#D1FAE5" },
  on_job: { label: "On Job", color: "#208AEF", bg: "#DBEAFE" },
  break: { label: "On Break", color: "#F79009", bg: "#FEF3C7" },
};

const GREET = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default function EngineerDashboardScreen() {
  const { colors, isDark } = useTheme();
  const [status, setStatus] = useState<EngStatus>("available");

  const sc = STATUS_CONF[status];
  const STATUSES: EngStatus[] = ["available", "on_job", "break"];

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Background Ambient Glow */}
      <View style={s.bgGlowWrap}>
        <LinearGradient
          colors={[colors.brand + (isDark ? "25" : "15"), "transparent"]}
          style={s.glowOrb}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.delay(100).springify().damping(20)} style={s.header}>
          <View>
            <Text
              style={[
                TextStyles.label,
                { color: colors.brand, letterSpacing: 1, textTransform: "uppercase" },
              ]}
            >
              {GREET()}
            </Text>
            <Text style={[TextStyles.heading2, { color: colors.textPrimary }]}>Rajesh Kumar</Text>
          </View>
          <Pressable onPress={() => router.push("/(engineer)/Profile" as any)}>
            <Avatar name="Rajesh Kumar" size="lg" role="engineer" online />
          </Pressable>
        </Animated.View>

        {/* ── Status Toggle ── */}
        <Animated.View entering={FadeInDown.delay(150).springify().damping(20)} style={s.section}>
          <View
            style={[
              s.statusCard,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                borderColor: colors.borderDefault,
              },
            ]}
          >
            <View style={s.statusToggleWrap}>
              {STATUSES.map((st) => {
                const c = STATUS_CONF[st];
                const active = status === st;
                return (
                  <Pressable
                    key={st}
                    style={[
                      s.statusBtn,
                      active && {
                        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : colors.bgSubtle,
                      },
                    ]}
                    onPress={() => setStatus(st)}
                  >
                    <View
                      style={[
                        s.statusDot,
                        { backgroundColor: active ? c.color : colors.textTertiary },
                      ]}
                    />
                    <Text
                      style={[TextStyles.label, { color: active ? c.color : colors.textTertiary }]}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* ── Next Task Priority Card ── */}
        {TASKS[0] && (
          <Animated.View entering={FadeInDown.delay(200).springify().damping(20)} style={s.section}>
            <Text
              style={[
                TextStyles.heading2,
                {
                  color: colors.textPrimary,
                  marginBottom: Spacing[3],
                  paddingHorizontal: Spacing[5],
                },
              ]}
            >
              Current Assignment
            </Text>

            <Pressable
              onPress={() => router.push("/(engineer)/Task-details" as any)}
              style={s.cardPressable}
            >
              <BlurView
                intensity={isDark ? 20 : 40}
                tint={isDark ? "dark" : "light"}
                style={[
                  s.taskCard,
                  { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" },
                ]}
              >
                <LinearGradient
                  colors={[
                    isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
                    isDark ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.4)",
                  ]}
                  style={StyleSheet.absoluteFill}
                />

                <View style={s.taskCardInner}>
                  {/* Task Header */}
                  <View style={s.taskHeader}>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <Badge label="HIGH PRIORITY" variant="error" size="sm" dot />
                        <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
                          {TASKS[0].distance} away
                        </Text>
                      </View>
                      <Text
                        style={[TextStyles.heading2, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {TASKS[0].title}
                      </Text>
                    </View>
                    <View
                      style={[
                        s.taskIconWrap,
                        { backgroundColor: PRIORITY_COLOR[TASKS[0].priority] + "15" },
                      ]}
                    >
                      <LumenIcon
                        name={TASKS[0].category}
                        size="lg"
                        color={PRIORITY_COLOR[TASKS[0].priority]}
                        strokeWidth={2}
                      />
                    </View>
                  </View>

                  {/* Task Details Row */}
                  <View style={s.taskDetailsRow}>
                    <View style={s.taskDetailItem}>
                      <LumenIcon name="mapPin" size="sm" color={colors.textSecondary} />
                      <Text
                        style={[TextStyles.bodyMedium, { color: colors.textSecondary, flex: 1 }]}
                        numberOfLines={1}
                      >
                        {TASKS[0].address}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={s.taskActions}>
                    <View style={s.etaWrap}>
                      <Text style={[TextStyles.label, { color: colors.textTertiary }]}>ETA</Text>
                      <Text style={[TextStyles.heading2, { color: colors.textPrimary }]}>
                        {TASKS[0].eta}
                      </Text>
                    </View>

                    <View
                      style={[s.startBtn, { backgroundColor: PRIORITY_COLOR[TASKS[0].priority] }]}
                    >
                      <Text style={[TextStyles.button, { color: "#FFF" }]}>Start Navigation</Text>
                      <LumenIcon name="chevronRight" size="sm" color="#FFF" />
                    </View>
                  </View>
                </View>
              </BlurView>
            </Pressable>
          </Animated.View>
        )}

        {/* ── Today's Performance Stats ── */}
        <Animated.View entering={FadeInDown.delay(250).springify().damping(20)} style={s.section}>
          <Text
            style={[
              TextStyles.heading2,
              {
                color: colors.textPrimary,
                marginBottom: Spacing[3],
                paddingHorizontal: Spacing[5],
              },
            ]}
          >
            Today's Performance
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.statsRow}
          >
            <SquircleStat
              label="Assigned"
              value="4"
              icon="report"
              color={colors.brand}
              isDark={isDark}
            />
            <SquircleStat
              label="Completed"
              value="2"
              icon="success"
              color="#12B76A"
              isDark={isDark}
            />
            <SquircleStat label="Rating" value="4.8" icon="star" color="#F79009" isDark={isDark} />
          </ScrollView>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ── Squircle Stat Card Component (Shared from Profile logic) ──
function SquircleStat({
  label,
  value,
  icon,
  color,
  isDark,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  isDark: boolean;
}) {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const STAT_SIZE = (W - Spacing[5] * 2 - Spacing[3] * 2) / 2.5;

  return (
    <Pressable
      onPressIn={() => (scale.value = withSpring(0.95, { damping: 15 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 15 }))}
    >
      <Animated.View style={[style, { width: STAT_SIZE }]}>
        <BlurView
          intensity={isDark ? 20 : 40}
          tint={isDark ? "dark" : "light"}
          style={[
            s.squircle,
            {
              backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.8)",
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
            },
          ]}
        >
          <View style={[s.squircleIcon, { backgroundColor: color + "15" }]}>
            <LumenIcon name={icon} size="sm" color={color} />
          </View>
          <Text
            style={[TextStyles.heading2, { color: isDark ? "#FFF" : "#111", marginVertical: 4 }]}
          >
            {value}
          </Text>
          <Text
            style={[
              TextStyles.caption,
              { color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", fontWeight: "600" },
            ]}
          >
            {label}
          </Text>
        </BlurView>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  bgGlowWrap: { ...(StyleSheet.absoluteFill as any), overflow: "hidden", pointerEvents: "none" },
  glowOrb: { width: W, height: W, position: "absolute", top: -W / 3, opacity: 0.6 },
  scroll: { paddingTop: 60 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[6],
  },
  section: {
    marginBottom: Spacing[8],
  },

  // Status Toggle
  statusCard: {
    marginHorizontal: Spacing[5],
    borderRadius: Radius["2xl"],
    padding: 6,
    borderWidth: 1,
  },
  statusToggleWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: Radius.xl,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Priority Task Card
  cardPressable: {
    marginHorizontal: Spacing[5],
  },
  taskCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  taskCardInner: {
    padding: Spacing[5],
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing[4],
  },
  taskIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  taskDetailsRow: {
    backgroundColor: "rgba(0,0,0,0.03)",
    padding: Spacing[3],
    borderRadius: Radius.lg,
    marginBottom: Spacing[5],
  },
  taskDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing[4],
  },
  etaWrap: {
    flex: 1,
  },
  startBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: Radius.xl,
    gap: Spacing[2],
  },

  // Stats
  statsRow: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
  },
  squircle: {
    borderRadius: 24,
    padding: Spacing[4],
    borderWidth: 1,
    overflow: "hidden",
  },
  squircleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
});
