// ============================================================
// LUMEN — Citizen Command Center Dashboard (Award-Level Redesign)
// Premium Smart City Control Center
// ============================================================
import { useTheme } from "@/design-system/ThemeContext";
import { Avatar } from "@/design-system/components/Avatar";
import { Badge } from "@/design-system/components/Badge";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Radius, Spacing, TextStyles } from "@/design-system/tokens";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
const CARD_GAP = 12;
const H_PAD = 24;
const METRIC_W = (W - H_PAD * 2 - CARD_GAP) / 2;

// ── Helpers ──────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const getTimeString = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getDateString = () => {
  const now = new Date();
  return now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
};

// ── Mock Data ────────────────────────────────────────────────
type ReportStatus = "pending" | "in_progress" | "resolved";

interface MockReport {
  id: string;
  title: string;
  category: "road" | "water" | "streetlight" | "garbage" | "electricity";
  status: ReportStatus;
  time: string;
  priority: "low" | "medium" | "high";
  dept: string;
  progress: number;
}

const MOCK_REPORTS: MockReport[] = [
  {
    id: "1",
    title: "Pothole on MG Road",
    category: "road",
    status: "in_progress",
    time: "2h ago",
    priority: "high",
    dept: "Roads & Transport",
    progress: 65,
  },
  {
    id: "2",
    title: "Street light outage, Sector 7",
    category: "streetlight",
    status: "pending",
    time: "5h ago",
    priority: "medium",
    dept: "Electricity Board",
    progress: 10,
  },
  {
    id: "3",
    title: "Water pipeline leak near Park",
    category: "water",
    status: "resolved",
    time: "Yesterday",
    priority: "high",
    dept: "Water Authority",
    progress: 100,
  },
];

const PRIORITY_COLOR: Record<string, string> = {
  high: "#F04438",
  medium: "#F79009",
  low: "#12B76A",
};

const CATEGORY_ICON: Record<string, any> = {
  road: "road",
  streetlight: "streetlight",
  water: "water",
  garbage: "garbage",
  electricity: "electricity",
};

const CATEGORY_GRADIENT: Record<string, [string, string]> = {
  road: ["#667EEA", "#764BA2"],
  streetlight: ["#F79009", "#D97706"],
  water: ["#06B6D4", "#0E7490"],
  garbage: ["#12B76A", "#027A48"],
  electricity: ["#F04438", "#B42318"],
};

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#F79009", bg: "#FFFAEB" },
  in_progress: { label: "In Progress", color: "#208AEF", bg: "#EBF5FF" },
  resolved: { label: "Resolved", color: "#12B76A", bg: "#ECFDF3" },
};

const QUICK_ACTIONS = [
  {
    icon: "report" as const,
    label: "Report Issue",
    subtitle: "Create civic complaint",
    route: "/(citizen)/Report-issue",
    gradients: ["#F04438", "#DC2626"] as [string, string],
  },
  {
    icon: "reportList" as const,
    label: "My Reports",
    subtitle: "Track your progress",
    route: "/(citizen)/My-report",
    gradients: ["#208AEF", "#1D6FD1"] as [string, string],
  },
  {
    icon: "map" as const,
    label: "Nearby Issues",
    subtitle: "Explore live city map",
    route: "/(citizen)/Report-details",
    gradients: ["#7C3AED", "#5B21B6"] as [string, string],
  },
  {
    icon: "emergency" as const,
    label: "Emergency",
    subtitle: "Emergency services",
    route: "/(citizen)/Help",
    gradients: ["#F79009", "#D97706"] as [string, string],
  },
] as const;

const AI_INSIGHTS = [
  {
    icon: "trend",
    text: "Water complaints increased 17% this week. Suggest inspection on Hosur Rd.",
    action: "View Hotspot",
  },
  {
    icon: "activity",
    text: "3 high-priority issues near you are unresolved for over 48 hours.",
    action: "View Issues",
  },
  {
    icon: "spark",
    text: "Pothole repairs on MG Road are 70% complete. Estimated finish: 3 hrs.",
    action: "Track Progress",
  },
];

// ── Animated Counter ─────────────────────────────────────────
function AnimatedCounter({
  target,
  duration = 1200,
  suffix = "",
}: {
  target: number;
  duration?: number;
  suffix?: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    Animated.timing(anim, {
      toValue: target,
      duration,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
    anim.addListener(({ value }) => setDisplay(Math.round(value).toString()));
    return () => anim.removeAllListeners();
  }, [target]);

  return (
    <Text>
      {display}
      {suffix}
    </Text>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function CitizenDashboardScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [aiIdx, setAiIdx] = useState(0);
  const [currentTime, setCurrentTime] = useState(getTimeString());

  // Animation refs
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const statsScale = useRef(new Animated.Value(0.92)).current;
  const actionsSlide = useRef(new Animated.Value(30)).current;
  const aiOpacity = useRef(new Animated.Value(1)).current;
  const pulsAnim = useRef(new Animated.Value(1)).current;
  const alertSlide = useRef(new Animated.Value(-60)).current;

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(getTimeString()), 60000);
    return () => clearInterval(t);
  }, []);

  // Pulse animation for AI badge
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulsAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulsAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(slideUp, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 6 }),
      Animated.spring(alertSlide, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 4 }),
    ]).start();

    setTimeout(() => {
      Animated.spring(statsScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();
    }, 200);

    setTimeout(() => {
      Animated.spring(actionsSlide, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }).start();
    }, 350);

    // AI carousel
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(aiOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(aiOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
      setAiIdx((i) => (i + 1) % AI_INSIGHTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  }, []);

  // ── Sub-Components ──
  const MetricCell = ({
    label,
    value,
    icon,
    color,
    trend,
    suffix = "",
  }: {
    label: string;
    value: number;
    icon: any;
    color: string;
    trend: string;
    suffix?: string;
  }) => (
    <View style={[mc.cell, { width: METRIC_W }]}>
      <View style={[mc.iconWrap, { backgroundColor: color + "18" }]}>
        <LumenIcon name={icon} size="md" color={color} strokeWidth={2} />
      </View>
      <Text style={[mc.value, { color: colors.textPrimary }]}>
        <AnimatedCounter target={value} suffix={suffix} />
      </Text>
      <Text style={[mc.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={mc.trendRow}>
        <LumenIcon name="trend" size="xs" color={color} />
        <Text style={[mc.trendTxt, { color }]}>{trend}</Text>
      </View>
    </View>
  );

  const insight = AI_INSIGHTS[aiIdx];

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Ambient gradient backdrop */}
      <LinearGradient
        colors={isDark ? ["#0B1827", colors.bgBase] : ["#E8F4FF", "#F0F7FF", colors.bgBase]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Accent orb top-right */}
      <View pointerEvents="none" style={[s.orb, { backgroundColor: colors.brand + "18" }]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
        }
      >
        {/* ═══════════════════════════════════════════════ */}
        {/* HEADER                                          */}
        {/* ═══════════════════════════════════════════════ */}
        <Animated.View
          style={[s.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
        >
          <View style={s.headerLeft}>
            <View style={s.greetingRow}>
              <View style={[s.liveDot, { backgroundColor: "#12B76A" }]} />
              <Text
                style={[
                  TextStyles.caption,
                  { color: colors.textTertiary, fontWeight: "600", letterSpacing: 1.5 },
                ]}
              >
                LIVE DASHBOARD
              </Text>
            </View>
            <Text style={[s.greetingName, { color: colors.textPrimary }]}>
              {getGreeting()}, Samuel 👋
            </Text>
            <View style={s.locationRow}>
              <LumenIcon name="mapPin" size="xs" color={colors.textTertiary} />
              <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
                Bangalore, KA · {getDateString()}
              </Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <Pressable
              style={({ pressed }) => [
                s.iconBtn,
                {
                  backgroundColor: colors.bgSurface,
                  borderColor: colors.borderDefault,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                },
              ]}
              onPress={() => router.push("/(citizen)/Notifications" as any)}
            >
              <LumenIcon
                name="notifications"
                size="md"
                color={colors.textSecondary}
                strokeWidth={2}
              />
              <View style={[s.notifBadge, { backgroundColor: "#F04438" }]}>
                <Text style={s.notifCount}>3</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => router.push("/(citizen)/Profile" as any)}>
              <Avatar name="Samuel K." size="md" role="citizen" online />
            </Pressable>
          </View>
        </Animated.View>

        {/* ═══════════════════════════════════════════════ */}
        {/* ALERT BANNER                                    */}
        {/* ═══════════════════════════════════════════════ */}
        <Animated.View
          style={[s.section, { transform: [{ translateY: alertSlide }], opacity: fadeIn }]}
        >
          <LinearGradient
            colors={["#7F1D1D", "#991B1B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.alertBanner}
          >
            <BlurView intensity={0} style={StyleSheet.absoluteFill} />
            <View style={s.alertLeft}>
              <Animated.View
                style={[
                  s.alertDot,
                  { backgroundColor: "#FCA5A5", transform: [{ scale: pulsAnim }] },
                ]}
              />
              <LumenIcon name="alert" size="md" color="#FCA5A5" strokeWidth={2.5} />
            </View>
            <View style={s.alertBody}>
              <Text style={s.alertTitle}>ACTIVE ALERT · ZONE B</Text>
              <Text style={s.alertMsg}>Water supply disruption. ETA restoration: 4 hrs</Text>
            </View>
            <View style={[s.alertEta, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <Text style={s.alertEtaText}>4h</Text>
              <Text style={s.alertEtaLabel}>ETA</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ═══════════════════════════════════════════════ */}
        {/* STATS — 2×2 GLASS GRID                         */}
        {/* ═══════════════════════════════════════════════ */}
        <Animated.View style={[s.section, { opacity: fadeIn, transform: [{ scale: statsScale }] }]}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Your Overview</Text>
            <Badge label="Live" variant="brand" size="sm" />
          </View>
          <BlurView
            intensity={isDark ? 30 : 15}
            tint={isDark ? "dark" : "light"}
            style={[s.glassContainer, { borderColor: colors.borderDefault }]}
          >
            <LinearGradient
              colors={
                isDark
                  ? ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]
                  : ["rgba(255,255,255,0.85)", "rgba(255,255,255,0.6)"]
              }
              style={StyleSheet.absoluteFill}
            />
            <View style={s.metricsGrid}>
              <MetricCell
                label="Reports Filed"
                value={12}
                icon="reportList"
                color="#208AEF"
                trend="+3 this week"
              />
              <View style={[s.metricDivider, { backgroundColor: colors.borderDefault }]} />
              <MetricCell
                label="Resolved"
                value={7}
                icon="success"
                color="#12B76A"
                trend="+2 this week"
              />
              <View style={[s.metricHDivider, { backgroundColor: colors.borderDefault }]} />
              <MetricCell
                label="Pending"
                value={3}
                icon="timer"
                color="#F79009"
                trend="−1 vs last week"
              />
              <View style={[s.metricDivider, { backgroundColor: colors.borderDefault }]} />
              <MetricCell
                label="Civic Score"
                value={87}
                icon="star"
                color="#7C3AED"
                trend="+5 pts"
                suffix="%"
              />
            </View>
          </BlurView>
        </Animated.View>

        {/* ═══════════════════════════════════════════════ */}
        {/* QUICK ACTIONS — 2×2 GRID                       */}
        {/* ═══════════════════════════════════════════════ */}
        <Animated.View
          style={[s.section, { transform: [{ translateY: actionsSlide }], opacity: fadeIn }]}
        >
          <Text style={[s.sectionTitle, { color: colors.textPrimary, marginBottom: 16 }]}>
            Quick Actions
          </Text>
          <View style={s.actionsGrid}>
            {QUICK_ACTIONS.map((action, idx) => (
              <ActionCard
                key={action.label}
                action={action}
                colors={colors}
                isDark={isDark}
                idx={idx}
              />
            ))}
          </View>
        </Animated.View>

        {/* ═══════════════════════════════════════════════ */}
        {/* AI INSIGHT CARD                                 */}
        {/* ═══════════════════════════════════════════════ */}
        <Animated.View style={[s.section, { opacity: fadeIn }]}>
          <BlurView
            intensity={isDark ? 40 : 20}
            tint={isDark ? "dark" : "light"}
            style={[s.aiCard, { borderColor: colors.brand + "30" }]}
          >
            <LinearGradient
              colors={
                isDark
                  ? ["rgba(32,138,239,0.08)", "rgba(124,58,237,0.05)"]
                  : ["rgba(235,245,255,0.95)", "rgba(245,243,255,0.85)"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Gradient border top */}
            <LinearGradient
              colors={[colors.brand, "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.aiGradientBar}
            />
            <View style={s.aiInner}>
              <View style={s.aiHeader}>
                <View style={[s.aiAvatarRing, { borderColor: colors.brand + "40" }]}>
                  <LinearGradient colors={[colors.brand, "#7C3AED"]} style={s.aiAvatar}>
                    <LumenIcon name="spark" size="md" color="#FFFFFF" strokeWidth={2.5} />
                  </LinearGradient>
                </View>
                <View style={s.aiTitleBlock}>
                  <Text style={[s.aiLabel, { color: colors.brand }]}>LUMEN AI · INSIGHTS</Text>
                  <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
                    Updating every 5s
                  </Text>
                </View>
                <Animated.View
                  style={[
                    s.aiPulse,
                    { backgroundColor: "#12B76A", transform: [{ scale: pulsAnim }] },
                  ]}
                />
              </View>

              <Animated.Text
                style={[s.aiInsightText, { color: colors.textPrimary, opacity: aiOpacity }]}
              >
                {insight.text}
              </Animated.Text>

              <View style={s.aiActions}>
                <Pressable
                  style={[
                    s.aiActionBtn,
                    { backgroundColor: colors.brand + "15", borderColor: colors.brand + "30" },
                  ]}
                >
                  <Text style={[TextStyles.caption, { color: colors.brand, fontWeight: "700" }]}>
                    {insight.action}
                  </Text>
                  <LumenIcon name="arrowLeft" size="xs" color={colors.brand} />
                </Pressable>
                <Pressable
                  style={[
                    s.aiActionBtn,
                    { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault },
                  ]}
                >
                  <Text
                    style={[TextStyles.caption, { color: colors.textSecondary, fontWeight: "600" }]}
                  >
                    Dismiss
                  </Text>
                </Pressable>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* ═══════════════════════════════════════════════ */}
        {/* NEARBY ISSUES MAP PLACEHOLDER                   */}
        {/* ═══════════════════════════════════════════════ */}
        <Animated.View style={[s.section, { opacity: fadeIn }]}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Nearby Issues</Text>
            <Pressable style={[s.viewAllBtn, { borderColor: colors.borderDefault }]}>
              <Text style={[TextStyles.caption, { color: colors.brand, fontWeight: "700" }]}>
                View Map
              </Text>
              <LumenIcon name="arrowLeft" size="xs" color={colors.brand} />
            </Pressable>
          </View>

          <Pressable onPress={() => router.push("/(citizen)/Report-details" as any)}>
            <BlurView
              intensity={isDark ? 25 : 10}
              tint={isDark ? "dark" : "light"}
              style={[s.mapCard, { borderColor: colors.borderDefault }]}
            >
              <LinearGradient
                colors={isDark ? ["#0D1B2E", "#0B1120"] : ["#E8F4FF", "#F0F7FF"]}
                style={StyleSheet.absoluteFill}
              />
              {/* Grid lines */}
              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                {[0.25, 0.5, 0.75].map((f, i) => (
                  <View
                    key={i}
                    style={[
                      s.gridLine,
                      s.gridH,
                      { top: `${f * 100}%` as any, borderColor: colors.borderDefault + "30" },
                    ]}
                  />
                ))}
                {[0.25, 0.5, 0.75].map((f, i) => (
                  <View
                    key={i}
                    style={[
                      s.gridLine,
                      s.gridV,
                      { left: `${f * 100}%` as any, borderColor: colors.borderDefault + "30" },
                    ]}
                  />
                ))}
              </View>
              {/* Issue markers */}
              {[
                { top: "30%", left: "20%", color: "#F04438", label: "HIGH" },
                { top: "55%", left: "55%", color: "#F79009", label: "MED" },
                { top: "40%", left: "72%", color: "#12B76A", label: "LOW" },
                { top: "65%", left: "30%", color: "#F04438", label: "HIGH" },
                { top: "25%", left: "60%", color: "#F79009", label: "MED" },
              ].map((m, i) => (
                <View key={i} style={[s.mapMarker, { top: m.top as any, left: m.left as any }]}>
                  <View style={[s.markerDot, { backgroundColor: m.color }]}>
                    <LumenIcon name="mapPin" size="xs" color="#FFFFFF" strokeWidth={3} />
                  </View>
                  <View style={[s.markerLabel, { backgroundColor: m.color }]}>
                    <Text style={s.markerLabelText}>{m.label}</Text>
                  </View>
                </View>
              ))}
              {/* Overlay CTA */}
              <LinearGradient
                colors={["transparent", isDark ? "rgba(11,17,32,0.95)" : "rgba(232,244,255,0.95)"]}
                style={s.mapOverlay}
              >
                <View style={s.mapOverlayContent}>
                  <View style={s.mapStatRow}>
                    <View
                      style={[
                        s.mapStat,
                        { backgroundColor: "#F04438" + "20", borderColor: "#F04438" + "40" },
                      ]}
                    >
                      <Text style={[s.mapStatNum, { color: "#F04438" }]}>5</Text>
                      <Text style={[s.mapStatLabel, { color: "#F04438" }]}>High</Text>
                    </View>
                    <View
                      style={[
                        s.mapStat,
                        { backgroundColor: "#F79009" + "20", borderColor: "#F79009" + "40" },
                      ]}
                    >
                      <Text style={[s.mapStatNum, { color: "#F79009" }]}>8</Text>
                      <Text style={[s.mapStatLabel, { color: "#F79009" }]}>Medium</Text>
                    </View>
                    <View
                      style={[
                        s.mapStat,
                        { backgroundColor: "#12B76A" + "20", borderColor: "#12B76A" + "40" },
                      ]}
                    >
                      <Text style={[s.mapStatNum, { color: "#12B76A" }]}>3</Text>
                      <Text style={[s.mapStatLabel, { color: "#12B76A" }]}>Low</Text>
                    </View>
                  </View>
                  <Text style={[s.mapCta, { color: colors.brand }]}>Tap to open full map →</Text>
                </View>
              </LinearGradient>
            </BlurView>
          </Pressable>
        </Animated.View>

        {/* ═══════════════════════════════════════════════ */}
        {/* RECENT REPORTS                                  */}
        {/* ═══════════════════════════════════════════════ */}
        <Animated.View style={[s.section, { opacity: fadeIn }]}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Recent Reports</Text>
            <Pressable
              style={[s.viewAllBtn, { borderColor: colors.borderDefault }]}
              onPress={() => router.push("/(citizen)/My-report" as any)}
            >
              <Text style={[TextStyles.caption, { color: colors.brand, fontWeight: "700" }]}>
                View all
              </Text>
              <LumenIcon name="arrowLeft" size="xs" color={colors.brand} />
            </Pressable>
          </View>

          <View style={s.reportsList}>
            {MOCK_REPORTS.map((report) => (
              <ReportCard key={report.id} report={report} colors={colors} isDark={isDark} />
            ))}
          </View>
        </Animated.View>

        {/* ═══════════════════════════════════════════════ */}
        {/* ANALYTICS TEASER                               */}
        {/* ═══════════════════════════════════════════════ */}
        <Animated.View style={[s.section, { opacity: fadeIn }]}>
          <Pressable onPress={() => router.push("/(citizen)/Analytics" as any)}>
            <BlurView
              intensity={isDark ? 30 : 15}
              tint={isDark ? "dark" : "light"}
              style={[s.analyticsCard, { borderColor: colors.borderDefault }]}
            >
              <LinearGradient
                colors={
                  isDark
                    ? ["rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"]
                    : ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.6)"]
                }
                style={StyleSheet.absoluteFill}
              />
              <View style={s.analyticsInner}>
                <View style={[s.sectionHeader, { marginBottom: 0 }]}>
                  <View style={{ flex: 1, paddingRight: 16 }}>
                    <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
                      Analytics & Insights
                    </Text>
                    <Text
                      style={[TextStyles.caption, { color: colors.textSecondary, marginTop: 4 }]}
                    >
                      Tap to view your detailed civic performance dashboard
                    </Text>
                  </View>
                  <View style={[s.timePill, { backgroundColor: colors.brand }]}>
                    <LumenIcon name="chevronRight" size="xs" color="#FFFFFF" />
                  </View>
                </View>
              </View>
            </BlurView>
          </Pressable>
        </Animated.View>

        {/* Bottom padding for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <View style={s.fabContainer}>
        <Pressable
          style={({ pressed }) => [s.fab, { transform: [{ scale: pressed ? 0.93 : 1 }] }]}
          onPress={() => router.push("/(citizen)/Report-issue" as any)}
        >
          <LinearGradient colors={["#F04438", "#DC2626"]} style={s.fabGradient}>
            <LumenIcon name="add" size="lg" color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
          <View
            style={[
              s.fabLabel,
              { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault },
            ]}
          >
            <Text style={[TextStyles.caption, { color: colors.textPrimary, fontWeight: "700" }]}>
              Report Issue
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ── Action Card Component ─────────────────────────────────────
function ActionCard({
  action,
  colors,
  isDark,
  idx,
}: {
  action: any;
  colors: any;
  isDark: boolean;
  idx: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const ACTION_W = (W - H_PAD * 2 - CARD_GAP) / 2;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], width: ACTION_W }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push(action.route as any)}
        style={({ pressed }) => [
          ac.card,
          {
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          },
        ]}
      >
        <LinearGradient colors={action.gradients} style={ac.iconContainer}>
          <LumenIcon name={action.icon} size="lg" color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
        <View style={ac.textBlock}>
          <Text style={[ac.label, { color: colors.textPrimary }]}>{action.label}</Text>
          <Text style={[ac.subtitle, { color: colors.textTertiary }]} numberOfLines={1}>
            {action.subtitle}
          </Text>
        </View>
        <View style={[ac.arrow, { backgroundColor: colors.bgSubtle }]}>
          <LumenIcon name="chevronRight" size="xs" color={colors.textTertiary} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Report Card Component ─────────────────────────────────────
function ReportCard({
  report,
  colors,
  isDark,
}: {
  report: MockReport;
  colors: any;
  isDark: boolean;
}) {
  const statusConfig = {
    pending: { label: "Pending", color: "#C2410C", bg: "#FFEDD5" },
    in_progress: { label: "In Progress", color: "#0F766E", bg: "#CCFBF1" },
    resolved: { label: "Resolved", color: "#15803D", bg: "#DCFCE7" },
  };

  const status = statusConfig[report.status as keyof typeof statusConfig] || statusConfig.pending;
  const priorityColor = PRIORITY_COLOR[report.priority] || "#F79009";

  return (
    <Pressable
      onPress={() => router.push("/(citizen)/Report-details" as any)}
      style={({ pressed }) => [
        rc.card,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FDFDFD",
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <View style={rc.cardInner}>
        {/* Left Icon */}
        <View
          style={[rc.iconWrap, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F2F4F7" }]}
        >
          <LumenIcon
            name={CATEGORY_ICON[report.category] || "report"}
            size="sm"
            color={isDark ? "#FFFFFF" : "#1D2939"}
            strokeWidth={2}
          />
        </View>

        {/* Center Info */}
        <View style={rc.infoWrap}>
          <Text style={[rc.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {report.title}
          </Text>
          <View style={rc.metaRow}>
            <View
              style={[
                rc.statusBadge,
                { backgroundColor: isDark ? status.color + "20" : status.bg },
              ]}
            >
              <Text style={[rc.statusText, { color: isDark ? "#FFFFFF" : status.color }]}>
                {status.label}
              </Text>
            </View>
            <Text style={[rc.timeText, { color: colors.textTertiary }]}>{report.time}</Text>
          </View>
        </View>

        {/* Right Dot */}
        <View style={[rc.priorityDot, { backgroundColor: priorityColor }]} />
      </View>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  orb: { position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: 130 },
  scroll: { paddingTop: 56, paddingHorizontal: H_PAD, paddingBottom: 24 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  headerLeft: { flex: 1 },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  greetingName: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5, marginBottom: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  notifCount: { fontSize: 9, color: "#FFFFFF", fontWeight: "800" },

  // Sections
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 20,
  },

  // Alert Banner
  alertBanner: {
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  alertLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  alertDot: { width: 8, height: 8, borderRadius: 4 },
  alertBody: { flex: 1 },
  alertTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FCA5A5",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  alertMsg: { fontSize: 13, color: "#FECACA", fontWeight: "500" },
  alertEta: { borderRadius: 10, padding: 8, alignItems: "center" },
  alertEtaText: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  alertEtaLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Glass Metrics Grid
  glassContainer: { borderRadius: 24, overflow: "hidden", borderWidth: 1 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap" },
  metricDivider: { width: 1 },
  metricHDivider: { height: 1, width: "100%" },

  // Actions Grid
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: CARD_GAP },

  // AI Card
  aiCard: { borderRadius: 24, overflow: "hidden", borderWidth: 1.5 },
  aiGradientBar: { height: 3 },
  aiInner: { padding: 20, gap: 16 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  aiAvatarRing: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, padding: 2 },
  aiAvatar: { flex: 1, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  aiTitleBlock: { flex: 1 },
  aiLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  aiPulse: { width: 10, height: 10, borderRadius: 5 },
  aiInsightText: { fontSize: 15, lineHeight: 22, fontWeight: "500" },
  aiActions: { flexDirection: "row", gap: 10 },
  aiActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },

  // Map Card
  mapCard: {
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
  },
  gridLine: { position: "absolute", borderWidth: 0.5 },
  gridH: { left: 0, right: 0, height: 0 },
  gridV: { top: 0, bottom: 0, width: 0 },
  mapMarker: { position: "absolute" },
  markerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  markerLabel: { borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1, marginTop: 2 },
  markerLabelText: { fontSize: 8, color: "#FFFFFF", fontWeight: "800" },
  mapOverlay: { position: "absolute", bottom: 0, left: 0, right: 0 },
  mapOverlayContent: { padding: 16 },
  mapStatRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  mapStat: { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 8, alignItems: "center" },
  mapStatNum: { fontSize: 18, fontWeight: "800" },
  mapStatLabel: { fontSize: 10, fontWeight: "600" },
  mapCta: { fontSize: 12, fontWeight: "700", textAlign: "right" },

  // Reports
  reportsList: { gap: 12 },

  // Analytics
  analyticsCard: { borderRadius: 24, overflow: "hidden", borderWidth: 1 },
  analyticsInner: { padding: 20, gap: 20 },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    height: 140,
    paddingTop: 8,
  },
  barWrap: { flex: 1, alignItems: "center", gap: 6 },
  bar: { width: "100%" },
  barLabel: { fontSize: 10, fontWeight: "600" },
  analyticsStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  analyticsStat: { alignItems: "center", gap: 2 },
  analyticsStatValue: { fontSize: 16, fontWeight: "800" },
  timePillRow: { flexDirection: "row", padding: 3 },
  timePill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },

  // FAB
  fabContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fab: {
    shadowColor: "#F04438",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  fabLabel: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
});

// ── Action Card Styles ────────────────────────────────────────
const ACTION_W = (W - H_PAD * 2 - CARD_GAP) / 2;
const ac = StyleSheet.create({
  card: {
    width: ACTION_W,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: { gap: 2 },
  label: { fontSize: 14, fontWeight: "700" },
  subtitle: { fontSize: 11, fontWeight: "500" },
  arrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
});

// ── Report Card Styles ────────────────────────────────────────
const rc = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 12,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoWrap: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  timeText: {
    fontSize: 12,
    fontWeight: "400",
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});

// ── Metric Cell Styles ────────────────────────────────────────
const mc = StyleSheet.create({
  cell: { padding: 20, gap: 4, alignItems: "flex-start" },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  value: { fontSize: 32, fontWeight: "800", letterSpacing: -1 },
  label: { fontSize: 12, fontWeight: "600" },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  trendTxt: { fontSize: 11, fontWeight: "700" },
});
