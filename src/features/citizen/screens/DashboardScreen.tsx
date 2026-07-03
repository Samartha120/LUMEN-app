// ============================================================
// LUMEN — Citizen Dashboard (Premium Redesign)
// Phase 3: Citizen Experience
// ============================================================
import { useTheme } from "@/design-system/ThemeContext";
import { Avatar } from "@/design-system/components/Avatar";
import { Badge } from "@/design-system/components/Badge";
import { DonutChart } from "@/design-system/components/DonutChart";
import { StatusBanner } from "@/design-system/components/Extras";
import { FAB } from "@/design-system/components/FAB";
import { LineChart } from "@/design-system/components/LineChart";
import { StatCard } from "@/design-system/components/StatCard";
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
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width: W } = Dimensions.get("window");

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

type ReportStatus = "pending" | "in_progress" | "resolved";
interface Report {
  id: string;
  title: string;
  category: string;
  status: ReportStatus;
  time: string;
  priority: "low" | "medium" | "high";
}

const MOCK_REPORTS: Report[] = [
  { id: "1", title: "Pothole on MG Road", category: "road", status: "in_progress", time: "2h ago", priority: "high" },
  { id: "2", title: "Street light outage", category: "streetlight", status: "pending", time: "5h ago", priority: "medium" },
  { id: "3", title: "Water pipeline leak", category: "water", status: "resolved", time: "Yesterday", priority: "high" },
  { id: "4", title: "Garbage overflow", category: "garbage", status: "pending", time: "3h ago", priority: "low" },
];

const STATUS_BADGE: Record<ReportStatus, { label: string; variant: "warning" | "info" | "success" }> = {
  pending: { label: "Pending", variant: "warning" },
  in_progress: { label: "In Progress", variant: "info" },
  resolved: { label: "Resolved", variant: "success" },
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "#F04438",
  medium: "#F79009",
  low: "#12B76A",
};

const CATEGORY_ICON: Record<string, "road" | "streetlight" | "water" | "garbage" | "electricity" | "fire" | "bridge" | "other"> = {
  road: "road",
  streetlight: "streetlight",
  water: "water",
  garbage: "garbage",
  electricity: "electricity",
  fire: "fire",
  bridge: "bridge",
  other: "other",
};

const QUICK_ACTIONS = [
  { icon: "report", label: "Report Issue", route: "/(citizen)/Report-issue", color: "#F04438" },
  { icon: "reportList", label: "My Reports", route: "/(citizen)/My-report", color: "#208AEF" },
  { icon: "map", label: "Nearby Issues", route: "/(citizen)/Report-details", color: "#7C3AED" },
  { icon: "emergency", label: "Emergency", route: "/(citizen)/Help", color: "#D97706" },
] as const;

const AI_INSIGHTS = [
  "3 high-priority issues near you need community attention.",
  "MG Road pothole repairs are 70% complete this week.",
  "Water supply restoration estimated within 4 hours.",
];

export default function CitizenDashboardScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [aiIdx, setAiIdx] = useState(0);
  const headerFade = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(30)).current;
  const aiAnim = useRef(new Animated.Value(1)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const reportsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.spring(listAnim, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 6 }),
      ]).start();
      
      setTimeout(() => {
        Animated.spring(statsAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
      }, 150);
      
      setTimeout(() => {
        Animated.spring(actionsAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
      }, 300);
      
      setTimeout(() => {
        Animated.spring(reportsAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
      }, 450);
    };
    animate();

    // Rotate AI insight every 5s
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(aiAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(aiAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setAiIdx((i) => (i + 1) % AI_INSIGHTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  };

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bgBase} />

      {/* Gradient accent top */}
      <LinearGradient
        colors={[colors.brand + "15", colors.brand + "05", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.topAccent}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
      >
        {/* ── Header ── */}
        <Animated.View style={[s.header, { opacity: headerFade }]}>
          <View style={s.headerContent}>
            <View style={s.greetingWrap}>
              <Text style={[TextStyles.label, { color: colors.brand, letterSpacing: 1 }]}>{GREETING()}</Text>
              <Text style={[TextStyles.heading2, { color: colors.textPrimary, letterSpacing: -0.5 }]}>Samuel K.</Text>
              <View style={s.locationRow}>
                <LumenIcon name="mapPin" size="xs" color={colors.textTertiary} strokeWidth={2} />
                <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Bangalore, KA</Text>
              </View>
            </View>
          </View>
          <View style={s.headerRight}>
            <Pressable
              style={({ pressed }) => [
                s.iconBtn,
                { 
                  backgroundColor: colors.bgSurface, 
                  borderColor: colors.borderDefault, 
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  ...shadows.sm 
                }
              ]}
              onPress={() => router.push("/(citizen)/Notifications" as any)}
              accessibilityLabel="Notifications"
            >
              <LumenIcon name="notifications" size="md" color={colors.textSecondary} strokeWidth={2} />
              <View style={[s.notifDot, { backgroundColor: colors.brand }]} />
            </Pressable>
            <Pressable onPress={() => router.push("/(citizen)/Profile" as any)}>
              <Avatar name="Samuel K." size="md" role="citizen" online />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View style={[{ transform: [{ translateY: listAnim }], opacity: headerFade }]}>

          {/* ── Alert Banner ── */}
          <View style={s.section}>
            <StatusBanner
              variant="warning"
              title="Active Alert: Water supply disruption in Zone B"
              message="Estimated restoration: 4 hours"
            />
          </View>

          {/* ── Stats Row ── */}
          <Animated.View style={[s.section, { opacity: statsAnim }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsRow}>
              <Animated.View style={{ transform: [{ scale: statsAnim }] }}>
                <StatCard label="Reports Filed" value="12" icon="reportList" variant="brand" compact />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: statsAnim }] }}>
                <StatCard label="Resolved" value="7" icon="success" variant="success" compact />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: statsAnim }] }}>
                <StatCard label="In Review" value="3" icon="timer" variant="warning" compact />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: statsAnim }] }}>
                <StatCard label="Active Alerts" value="2" icon="alert" variant="error" compact />
              </Animated.View>
            </ScrollView>
          </Animated.View>

          {/* ── Quick Actions ── */}
          <Animated.View style={[s.section, { opacity: actionsAnim }]}>
            <Text style={[TextStyles.subtitle, { color: colors.textPrimary, marginBottom: Spacing[3], letterSpacing: -0.3 }]}>Quick Actions</Text>
            <View style={s.actionsGrid}>
              {QUICK_ACTIONS.map((action, idx) => (
                <Animated.View
                  key={action.label}
                  style={{
                    transform: [{ translateY: actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                    opacity: actionsAnim,
                  }}
                >
                  <Pressable
                    style={({ pressed }) => [
                      s.actionBtn,
                      {
                        backgroundColor: colors.bgSurface,
                        borderColor: colors.borderDefault,
                        opacity: pressed ? 0.85 : 1,
                        transform: pressed ? [{ scale: 0.97 }] : [],
                        ...shadows.sm,
                      },
                    ]}
                    onPress={() => router.push(action.route as any)}
                    accessibilityLabel={action.label}
                  >
                    <View style={[s.actionIcon, { backgroundColor: action.color + "15" }]}>
                      <LumenIcon name={action.icon as any} size="lg" color={action.color} strokeWidth={2} />
                    </View>
                    <Text style={[TextStyles.bodySmall, { color: colors.textPrimary, fontWeight: "600", textAlign: "center", marginTop: 6 }]}>
                      {action.label}
                    </Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* ── AI Insight Card ── */}
          <Animated.View style={[s.section, { opacity: actionsAnim }]}>
            <BlurView intensity={25} tint={isDark ? "dark" : "light"} style={s.glassCard}>
              <LinearGradient
                colors={[isDark ? "#1a1a2e30" : "#ffffff50", isDark ? "#1a1a2e15" : "#ffffff25"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.aiCard}>
                <View style={s.aiHeader}>
                  <View style={[s.aiIconWrap, { backgroundColor: colors.brand + "20" }]}>
                    <LumenIcon name="spark" size="md" color={colors.brand} strokeWidth={2} />
                  </View>
                  <View style={s.aiTitleWrap}>
                    <Text style={[TextStyles.label, { color: colors.brand, letterSpacing: 0.5 }]}>LUMEN AI</Text>
                    <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>Smart Insight</Text>
                  </View>
                  <Animated.View 
                    style={[
                      s.aiPulse, 
                      { 
                        backgroundColor: colors.brand,
                        opacity: aiAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
                        transform: [{ scale: aiAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }]
                      }
                    ]} 
                  />
                </View>
                <Animated.Text style={[TextStyles.body, { color: colors.textSecondary, opacity: aiAnim }]}>
                  {AI_INSIGHTS[aiIdx]}
                </Animated.Text>
              </View>
            </BlurView>
          </Animated.View>

          {/* ── Map Preview Card ── */}
          <Animated.View style={[s.section, { opacity: actionsAnim }]}>
            <Pressable onPress={() => router.push("/(citizen)/Report-details" as any)}>
              <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.mapCard}>
                <LinearGradient
                  colors={[isDark ? "#1a1a2e20" : "#ffffff40", isDark ? "#1a1a2e10" : "#ffffff20"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[s.mapPlaceholder, { backgroundColor: colors.bgSubtle }]}>
                  <View style={[s.mapGrid, { borderColor: colors.borderDefault + "40" }]} />
                  {/* Fake markers */}
                  {[
                    { top: "30%", left: "25%", color: "#F04438" },
                    { top: "50%", left: "55%", color: "#F79009" },
                    { top: "65%", left: "35%", color: "#12B76A" },
                  ].map((m, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        s.mapMarker, 
                        { 
                          top: m.top as any, 
                          left: m.left as any, 
                          backgroundColor: m.color,
                          transform: [{ scale: actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }]
                        }
                      ]}
                    >
                      <LumenIcon name="mapPin" size="xs" color="#FFFFFF" strokeWidth={3} />
                    </Animated.View>
                  ))}
                  <View style={[s.mapOverlay, { backgroundColor: colors.bgBase + "66" }]}>
                    <Text style={[TextStyles.label, { color: colors.textPrimary }]}>12 active issues nearby</Text>
                    <Text style={[TextStyles.caption, { color: colors.brand }]}>Tap to view map →</Text>
                  </View>
                </View>
              </BlurView>
            </Pressable>
          </Animated.View>

          {/* ── Reports Trend Chart ── */}
          <Animated.View style={[s.section, { opacity: reportsAnim }]}>
            <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.glassCard}>
              <LinearGradient
                colors={[isDark ? "#1a1a2e30" : "#ffffff50", isDark ? "#1a1a2e15" : "#ffffff25"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.chartContent}>
                <View style={s.chartHeader}>
                  <Text style={[TextStyles.subtitle, { color: colors.textPrimary, letterSpacing: -0.3 }]}>Your Reports Trend</Text>
                  <Badge label="This Month" variant="brand" size="sm" />
                </View>
                <LineChart
                  data={[2, 4, 3, 5, 7, 6, 8, 9, 7, 10, 11, 12]}
                  width={W - 80}
                  height={180}
                  color={colors.brand}
                  showGradient
                  showPoints
                />
                <View style={s.chartLegend}>
                  <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Reports filed over time</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {/* ── Category Distribution ── */}
          <Animated.View style={[s.section, { opacity: reportsAnim }]}>
            <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.glassCard}>
              <LinearGradient
                colors={[isDark ? "#1a1a2e30" : "#ffffff50", isDark ? "#1a1a2e15" : "#ffffff25"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.chartContent}>
                <Text style={[TextStyles.subtitle, { color: colors.textPrimary, marginBottom: Spacing[4], letterSpacing: -0.3 }]}>By Category</Text>
                <DonutChart
                  data={[
                    { value: 5, color: "#208AEF", label: "Roads" },
                    { value: 3, color: "#12B76A", label: "Water" },
                    { value: 2, color: "#F79009", label: "Streetlight" },
                    { value: 2, color: "#F04438", label: "Garbage" },
                  ]}
                  size={140}
                  strokeWidth={16}
                  showLabels
                />
              </View>
            </BlurView>
          </Animated.View>

          {/* ── Recent Reports ── */}
          <Animated.View style={[s.section, { opacity: reportsAnim }]}>
            <View style={s.sectionHeader}>
              <Text style={[TextStyles.subtitle, { color: colors.textPrimary, letterSpacing: -0.3 }]}>Recent Reports</Text>
              <Pressable onPress={() => router.push("/(citizen)/My-report" as any)}>
                <Text style={[TextStyles.label, { color: colors.brand }]}>View all</Text>
              </Pressable>
            </View>
            <View style={s.reportsList}>
              {MOCK_REPORTS.map((report, idx) => {
                const badge = STATUS_BADGE[report.status];
                return (
                  <Animated.View
                    key={report.id}
                    style={{
                      transform: [{ translateX: reportsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                      opacity: reportsAnim,
                    }}
                  >
                    <Pressable
                      onPress={() => router.push("/(citizen)/Report-details" as any)}
                      style={({ pressed }) => [s.reportItem, { opacity: pressed ? 0.8 : 1 }]}
                    >
                      <View style={[s.reportGlow, { backgroundColor: PRIORITY_COLOR[report.priority] + "08" }]} />
                      <View style={s.reportRow}>
                        <View style={[s.reportIconWrap, { backgroundColor: colors.bgSubtle }]}>
                          <LumenIcon
                            name={CATEGORY_ICON[report.category] ?? "other"}
                            size="md"
                            color={colors.textSecondary}
                            strokeWidth={2}
                          />
                        </View>
                        <View style={s.reportInfo}>
                          <View style={s.reportTitleRow}>
                            <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                              {report.title}
                            </Text>
                            <View style={[s.priorityDot, { backgroundColor: PRIORITY_COLOR[report.priority] }]} />
                          </View>
                          <View style={s.reportMeta}>
                            <Badge label={badge.label} variant={badge.variant} size="sm" />
                            <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>{report.time}</Text>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>

          {/* ── Bottom Padding for FAB ── */}
          <View style={{ height: 90 }} />
        </Animated.View>
      </ScrollView>

      {/* FAB */}
      <View style={s.fab}>
        <FAB icon="add" label="Report Issue" onPress={() => router.push("/(citizen)/Report-issue" as any)} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  topAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 280 },
  scroll: { paddingTop: 56, paddingHorizontal: Spacing[5] },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: Spacing[6] },
  headerContent: { flex: 1 },
  greetingWrap: {},
  locationRow: { flexDirection: "row", alignItems: "center", gap: Spacing[1.5], marginTop: Spacing[2] },
  headerRight: { flexDirection: "row", alignItems: "center", gap: Spacing[3] },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, position: "relative",
  },
  notifDot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4 },
  section: { marginBottom: Spacing[6] },
  statsRow: { gap: Spacing[3], paddingHorizontal: 2 },
  actionsGrid: { flexDirection: "row", gap: Spacing[3], flexWrap: "wrap" },
  actionBtn: {
    width: (W - Spacing[5] * 2 - Spacing[3] * 3) / 4,
    alignItems: "center",
    paddingVertical: Spacing[4],
    borderRadius: Radius["2xl"],
    borderWidth: 1,
  },
  actionIcon: { width: 48, height: 48, borderRadius: Radius.xl, alignItems: "center", justifyContent: "center" },
  glassCard: {
    borderRadius: Radius["3xl"],
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  chartContent: { padding: Spacing[5], gap: Spacing[4] },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing[4] },
  chartLegend: { marginTop: Spacing[3] },
  aiCard: { padding: Spacing[5], gap: Spacing[4] },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: Spacing[3] },
  aiIconWrap: { width: 40, height: 40, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },
  aiTitleWrap: { flex: 1 },
  aiPulse: { width: 8, height: 8, borderRadius: 4 },
  mapCard: { borderRadius: Radius["3xl"], overflow: "hidden", height: 160 },
  mapPlaceholder: { height: "100%", position: "relative" },
  mapGrid: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderWidth: 0.5 },
  mapMarker: {
    position: "absolute",
    width: 24, height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -12, marginTop: -12,
  },
  mapOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: Spacing[4], gap: 2,
  },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing[3] },
  reportsList: { gap: Spacing[3] },
  reportItem: {
    position: "relative",
    padding: Spacing[4],
    borderRadius: Radius.xl,
    overflow: "hidden",
  },
  reportGlow: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: Radius.xl,
  },
  reportRow: { flexDirection: "row", gap: Spacing[3], alignItems: "center", position: "relative" },
  reportIconWrap: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },
  reportInfo: { flex: 1, gap: 6 },
  reportTitleRow: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
  reportMeta: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  fab: { position: "absolute", bottom: Spacing[8], right: Spacing[5] },
});
