import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Spacing, TextStyles } from "@/design-system/tokens";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: W } = Dimensions.get("window");

const GRAPH_DATA: Record<
  string,
  { labels: string[]; values: number[]; stats: { label: string; value: string; color: string }[] }
> = {
  Daily: {
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    values: [40, 65, 45, 80, 60, 95, 70],
    stats: [
      { label: "Avg Response", value: "3.2 hrs", color: "#208AEF" },
      { label: "Resolution Rate", value: "89%", color: "#12B76A" },
      { label: "Satisfaction", value: "4.7★", color: "#F79009" },
    ],
  },
  Monthly: {
    labels: ["W1", "W2", "W3", "W4"],
    values: [180, 240, 210, 290],
    stats: [
      { label: "Avg Response", value: "2.8 hrs", color: "#208AEF" },
      { label: "Resolution Rate", value: "92%", color: "#12B76A" },
      { label: "Satisfaction", value: "4.8★", color: "#F79009" },
    ],
  },
  Yearly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [850, 910, 800, 1050, 1200, 1150, 980, 1020, 1100, 950, 1080, 1300],
    stats: [
      { label: "Avg Response", value: "2.4 hrs", color: "#208AEF" },
      { label: "Resolution Rate", value: "95%", color: "#12B76A" },
      { label: "Satisfaction", value: "4.9★", color: "#F79009" },
    ],
  },
};

const CATEGORIES = [
  { label: "Water & Sewage", value: 45, color: "#208AEF" },
  { label: "Roads & Traffic", value: 30, color: "#7C3AED" },
  { label: "Waste Management", value: 15, color: "#F79009" },
  { label: "Electricity", value: 10, color: "#12B76A" },
];

export default function AnalyticsScreen() {
  const { colors, isDark } = useTheme();
  
  // Enter animations
  const fadeHeader = useRef(new Animated.Value(0)).current;
  const fadeContent = useRef(new Animated.Value(0)).current;
  const slideContent = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.timing(fadeHeader, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    Animated.parallel([
      Animated.timing(fadeContent, { toValue: 1, duration: 600, delay: 150, useNativeDriver: true }),
      Animated.spring(slideContent, { toValue: 0, delay: 150, useNativeDriver: true, friction: 8, tension: 40 }),
    ]).start();
  }, []);

  return (
    <View style={[s.container, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* ── Background Elements ── */}
      <View style={s.bgGlowWrap}>
        <BlurView intensity={isDark ? 80 : 40} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill}>
          <View style={[s.glowOrb, { backgroundColor: colors.brand, top: -100, right: -50 }]} />
          <View style={[s.glowOrb, { backgroundColor: "#7C3AED", top: 200, left: -100 }]} />
        </BlurView>
      </View>

      {/* ── Header ── */}
      <Animated.View style={[s.header, { opacity: fadeHeader }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}>
          <LumenIcon name="arrowLeft" size="sm" color={colors.textPrimary} />
        </Pressable>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Analytics & Insights</Text>
        <View style={s.backBtn} />
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        <Animated.View style={{ opacity: fadeContent, transform: [{ translateY: slideContent }], gap: 24 }}>
          
          {/* Civic Score Card */}
          <CivicScoreCard colors={colors} isDark={isDark} />

          {/* Performance Graph */}
          <DynamicPerformanceGraph colors={colors} isDark={isDark} />

          {/* Breakdown by Category */}
          <CategoryBreakdownCard colors={colors} isDark={isDark} />

        </Animated.View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ── Components ───────────────────────────────────────────────────

function CivicScoreCard({ colors, isDark }: { colors: any; isDark: boolean }) {
  const scale = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 30, friction: 6, delay: 300 }).start();
  }, []);

  return (
    <Animated.View style={[s.card, { borderColor: colors.borderDefault, transform: [{ scale }] }]}>
      <LinearGradient
        colors={isDark ? ["rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"] : ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.6)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.scoreInner}>
        <View style={s.scoreInfo}>
          <Text style={[s.cardTitle, { color: colors.textPrimary }]}>Your Civic Score</Text>
          <Text style={[TextStyles.body, { color: colors.textSecondary }]}>You are in the top 5% of active citizens in your district.</Text>
        </View>
        <View style={[s.scoreBadge, { backgroundColor: "rgba(32, 138, 239, 0.15)" }]}>
          <LumenIcon name="spark" size="md" color="#208AEF" />
          <Text style={s.scoreText}>98</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function CategoryBreakdownCard({ colors, isDark }: { colors: any; isDark: boolean }) {
  return (
    <View style={[s.card, { borderColor: colors.borderDefault }]}>
      <LinearGradient
        colors={isDark ? ["rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"] : ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.6)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.cardInner}>
        <Text style={[s.cardTitle, { color: colors.textPrimary }]}>Issue Breakdown</Text>
        
        <View style={s.progressRow}>
          {CATEGORIES.map((cat, i) => (
            <AnimatedCategoryBar key={cat.label} category={cat} index={i} />
          ))}
        </View>

        <View style={s.legendGrid}>
          {CATEGORIES.map(cat => (
            <View key={cat.label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: cat.color }]} />
              <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>{cat.label} ({cat.value}%)</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function AnimatedCategoryBar({ category, index }: { category: any; index: number }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: category.value,
      duration: 800,
      delay: 400 + (index * 100),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        s.segment,
        {
          backgroundColor: category.color,
          width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
        }
      ]}
    />
  );
}


function DynamicPerformanceGraph({ colors, isDark }: { colors: any; isDark: boolean }) {
  const [timeRange, setTimeRange] = useState<"Daily" | "Monthly" | "Yearly">("Daily");
  const data = GRAPH_DATA[timeRange];
  const maxVal = Math.max(...data.values);

  return (
    <View style={[s.card, { borderColor: colors.borderDefault }]}>
      <LinearGradient
        colors={isDark ? ["rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"] : ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.6)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.cardInner}>
        <View style={s.sectionHeader}>
          <Text style={[s.cardTitle, { color: colors.textPrimary }]}>Resolution Trends</Text>
          <View style={[s.timePillRow, { backgroundColor: colors.bgSubtle, borderRadius: 20 }]}>
            {(["Daily", "Monthly", "Yearly"] as const).map((t) => (
              <Pressable
                key={t}
                style={[s.timePill, timeRange === t && { backgroundColor: colors.brand }]}
                onPress={() => setTimeRange(t)}
              >
                <Text style={[TextStyles.caption, { color: timeRange === t ? "#FFFFFF" : colors.textTertiary, fontWeight: "700" }]}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
          <View style={s.chartScrollArea}>
            {data.values.map((val, i) => (
              <AnimatedBar key={`${timeRange}-${i}`} value={val} max={maxVal} label={data.labels[i]} colors={colors} />
            ))}
          </View>
        </ScrollView>

        <View style={s.analyticsStats}>
          {data.stats.map((stat, i) => (
            <AnimatedStat key={`${timeRange}-stat-${i}`} stat={stat} colors={colors} />
          ))}
        </View>
      </View>
    </View>
  );
}

function AnimatedBar({ value, max, label, colors }: { value: number; max: number; label: string; colors: any }) {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const targetHeight = Math.max(8, (value / max) * 160);

  useEffect(() => {
    Animated.spring(heightAnim, {
      toValue: targetHeight,
      useNativeDriver: false,
      friction: 6,
      tension: 40,
    }).start();
  }, [value, max, targetHeight]);

  return (
    <View style={s.barColumn}>
      <View style={[s.barTrack, { backgroundColor: colors.bgSubtle }]}>
        <Animated.View style={[s.barFill, { backgroundColor: colors.brand, height: heightAnim }]}>
          <LinearGradient colors={[colors.brand, colors.brand + "60"]} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>
      <Text style={[TextStyles.caption, { color: colors.textTertiary, fontSize: 11, fontWeight: "600" }]}>{label}</Text>
    </View>
  );
}

function AnimatedStat({ stat, colors }: { stat: any; colors: any }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 4 }),
    ]).start();
  }, [stat.value]);

  return (
    <Animated.View style={[s.analyticsStat, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <Text style={[s.analyticsStatValue, { color: stat.color }]}>{stat.value}</Text>
      <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>{stat.label}</Text>
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  bgGlowWrap: { ...StyleSheet.absoluteFill as any, overflow: "hidden", pointerEvents: "none" },
  glowOrb: { width: 300, height: 300, borderRadius: 150, position: "absolute", opacity: 0.15, filter: "blur(50px)" as any },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, zIndex: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(150,150,150,0.1)" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10 },
  
  card: { borderRadius: 24, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  cardInner: { padding: 20 },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  
  // Civic Score
  scoreInner: { flexDirection: "row", alignItems: "center", padding: 20, gap: 16 },
  scoreInfo: { flex: 1 },
  scoreBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  scoreText: { fontSize: 24, fontWeight: "800", color: "#208AEF" },

  // Graph
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  timePillRow: { flexDirection: "row", padding: 4 },
  timePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  chartScrollArea: { flexDirection: "row", alignItems: "flex-end", height: 190, gap: 14, minWidth: "100%", justifyContent: "space-between" },
  barColumn: { alignItems: "center", justifyContent: "flex-end", height: 190, width: 34, gap: 8 },
  barTrack: { height: 160, justifyContent: "flex-end", width: "100%", borderRadius: 8, overflow: "hidden" },
  barFill: { width: "100%" },
  analyticsStats: { flexDirection: "row", justifyContent: "space-between", marginTop: 24, paddingHorizontal: 10 },
  analyticsStat: { alignItems: "center", gap: 4 },
  analyticsStatValue: { fontSize: 16, fontWeight: "800" },

  // Breakdown
  progressRow: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", marginTop: 24, marginBottom: 24 },
  segment: { height: "100%" },
  legendGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6, width: "45%" },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
});
