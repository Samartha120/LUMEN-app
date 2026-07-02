// ============================================================
// LUMEN — Citizen Dashboard (Premium Redesign)
// Phase 3: Citizen Experience
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  StatusBar,
  Dimensions,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Badge } from "@/design-system/components/Badge";
import { Card } from "@/design-system/components/Card";
import { StatCard } from "@/design-system/components/StatCard";
import { FAB } from "@/design-system/components/FAB";
import { Avatar } from "@/design-system/components/Avatar";
import { StatusBanner } from "@/design-system/components/Extras";
import { LinearProgress } from "@/design-system/components/Progress";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";

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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(listAnim, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 4 }),
    ]).start();

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
      <View style={[s.topAccent, { backgroundColor: colors.brand + "10" }]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
      >
        {/* ── Header ── */}
        <Animated.View style={[s.header, { opacity: headerFade }]}>
          <View>
            <Text style={[TextStyles.label, { color: colors.brand }]}>{GREETING()}</Text>
            <Text style={[TextStyles.heading2, { color: colors.textPrimary }]}>Samuel K.</Text>
            <Badge label="Citizen" variant="brand" size="sm" dot />
          </View>
          <View style={s.headerRight}>
            <Pressable
              style={[s.iconBtn, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault, ...shadows.sm }]}
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
          <View style={s.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsRow}>
              <StatCard label="Reports Filed" value="12" icon="reportList" variant="brand" compact />
              <StatCard label="Resolved" value="7" icon="success" variant="success" compact />
              <StatCard label="In Review" value="3" icon="timer" variant="warning" compact />
              <StatCard label="Active Alerts" value="2" icon="alert" variant="error" compact />
            </ScrollView>
          </View>

          {/* ── Quick Actions ── */}
          <View style={s.section}>
            <Text style={[TextStyles.subtitle, { color: colors.textPrimary, marginBottom: Spacing[3] }]}>Quick Actions</Text>
            <View style={s.actionsGrid}>
              {QUICK_ACTIONS.map((action) => (
                <Pressable
                  key={action.label}
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
              ))}
            </View>
          </View>

          {/* ── AI Insight Card ── */}
          <View style={s.section}>
            <Card variant="glass" style={s.aiCard}>
              <View style={s.aiHeader}>
                <View style={[s.aiIconWrap, { backgroundColor: colors.brand + "15" }]}>
                  <LumenIcon name="spark" size="md" color={colors.brand} strokeWidth={2} />
                </View>
                <View style={s.aiTitleWrap}>
                  <Text style={[TextStyles.label, { color: colors.brand }]}>LUMEN AI</Text>
                  <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>Smart Insight</Text>
                </View>
                <View style={[s.aiPulse, { backgroundColor: colors.brand }]} />
              </View>
              <Animated.Text style={[TextStyles.body, { color: colors.textSecondary, opacity: aiAnim }]}>
                {AI_INSIGHTS[aiIdx]}
              </Animated.Text>
            </Card>
          </View>

          {/* ── Map Preview Card ── */}
          <View style={s.section}>
            <Card variant="elevated" padding={0} style={s.mapCard} onPress={() => router.push("/(citizen)/Report-details" as any)}>
              <View style={[s.mapPlaceholder, { backgroundColor: colors.bgSubtle }]}>
                <View style={[s.mapGrid, { borderColor: colors.borderDefault + "40" }]} />
                {/* Fake markers */}
                {[
                  { top: "30%", left: "25%", color: "#F04438" },
                  { top: "50%", left: "55%", color: "#F79009" },
                  { top: "65%", left: "35%", color: "#12B76A" },
                ].map((m, i) => (
                  <View key={i} style={[s.mapMarker, { top: m.top as any, left: m.left as any, backgroundColor: m.color }]}>
                    <LumenIcon name="mapPin" size="xs" color="#FFFFFF" strokeWidth={3} />
                  </View>
                ))}
                <View style={[s.mapOverlay, { backgroundColor: colors.bgBase + "66" }]}>
                  <Text style={[TextStyles.label, { color: colors.textPrimary }]}>12 active issues nearby</Text>
                  <Text style={[TextStyles.caption, { color: colors.brand }]}>Tap to view map →</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* ── Recent Reports ── */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[TextStyles.subtitle, { color: colors.textPrimary }]}>Recent Reports</Text>
              <Pressable onPress={() => router.push("/(citizen)/My-report" as any)}>
                <Text style={[TextStyles.label, { color: colors.brand }]}>View all</Text>
              </Pressable>
            </View>
            <View style={s.reportsList}>
              {MOCK_REPORTS.map((report, idx) => {
                const badge = STATUS_BADGE[report.status];
                return (
                  <Card
                    key={report.id}
                    variant="elevated"
                    padding={Spacing[4]}
                    onPress={() => router.push("/(citizen)/Report-details" as any)}
                    style={s.reportCard}
                  >
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
                  </Card>
                );
              })}
            </View>
          </View>

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
  topAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 200 },
  scroll: { paddingTop: 56, paddingHorizontal: Spacing[5] },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: Spacing[6] },
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
  aiCard: { gap: Spacing[4] },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: Spacing[3] },
  aiIconWrap: { width: 40, height: 40, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },
  aiTitleWrap: { flex: 1 },
  aiPulse: { width: 8, height: 8, borderRadius: 4, opacity: 0.9 },
  mapCard: { borderRadius: Radius["3xl"], overflow: "hidden" },
  mapPlaceholder: { height: 160, position: "relative" },
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
  reportCard: { gap: 0 },
  reportRow: { flexDirection: "row", gap: Spacing[3], alignItems: "center" },
  reportIconWrap: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },
  reportInfo: { flex: 1, gap: 6 },
  reportTitleRow: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
  reportMeta: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  fab: { position: "absolute", bottom: Spacing[8], right: Spacing[5] },
});
