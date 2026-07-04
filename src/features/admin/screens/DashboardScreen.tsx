// ============================================================
// LUMEN — Admin Dashboard (Premium Analytics)
// Phase 5: Admin Experience
// ============================================================
import { useTheme } from "@/design-system/ThemeContext";
import { Avatar } from "@/design-system/components/Avatar";
import { Badge } from "@/design-system/components/Badge";
import { BarChart } from "@/design-system/components/BarChart";
import { DonutChart } from "@/design-system/components/DonutChart";
import { KPICard } from "@/design-system/components/KPICard";
import { LineChart } from "@/design-system/components/LineChart";
import { TimeFilter } from "@/design-system/components/TimeFilter";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Radius, Spacing, TextStyles } from "@/design-system/tokens";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
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

const GREET = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default function AdminDashboardScreen() {
  const { colors, isDark, shadows, fontSize, fontWeight } = useTheme();
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "year" | "all">("week");
  const [refreshing, setRefreshing] = useState(false);
  const headerFade = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const kpiAnim = useRef(new Animated.Value(0)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(headerFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 6 }),
      ]).start();

      setTimeout(() => {
        Animated.spring(kpiAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 14,
          bounciness: 8,
        }).start();
      }, 200);

      setTimeout(() => {
        Animated.spring(chartAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 14,
          bounciness: 8,
        }).start();
      }, 400);

      setTimeout(() => {
        Animated.spring(listAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 14,
          bounciness: 8,
        }).start();
      }, 600);
    };
    animate();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  };

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.bgBase}
      />
      <LinearGradient
        colors={["#D9770615", "#D9770605", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.topAccent}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
        }
      >
        {/* ── Header ── */}
        <Animated.View style={[s.header, { opacity: headerFade }]}>
          <View style={s.headerContent}>
            <View style={s.greetingWrap}>
              <Text style={[TextStyles.label, { color: "#D97706", letterSpacing: 1 }]}>
                {GREET()}
              </Text>
              <Text
                style={[TextStyles.heading2, { color: colors.textPrimary, letterSpacing: -0.5 }]}
              >
                Admin Console
              </Text>
              <View style={s.statusRow}>
                <View style={[s.statusDot, { backgroundColor: "#12B76A" }]} />
                <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                  System Online
                </Text>
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
                  ...shadows.sm,
                },
              ]}
              accessibilityLabel="Settings"
            >
              <LumenIcon name="settings" size="md" color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
            <Avatar name="Admin User" size="md" role="admin" online />
          </View>
        </Animated.View>

        <Animated.View style={[{ transform: [{ translateY: slideAnim }], opacity: headerFade }]}>
          {/* ── Time Filter ── */}
          <View style={s.section}>
            <TimeFilter value={timeFilter} onChange={setTimeFilter} />
          </View>

          {/* ── KPI Cards Row ── */}
          <Animated.View style={[s.section, { opacity: kpiAnim }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.kpiRow}
            >
              <Animated.View style={{ transform: [{ scale: kpiAnim }] }}>
                <KPICard
                  title="Total Reports"
                  value={1247}
                  previousValue={1156}
                  icon={
                    <LumenIcon name="reportList" size="lg" color={colors.brand} strokeWidth={2} />
                  }
                  style={{ width: 200 }}
                  gradient={colors.gradientBrand}
                />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: kpiAnim }] }}>
                <KPICard
                  title="Resolved"
                  value={892}
                  previousValue={823}
                  icon={
                    <LumenIcon
                      name="success"
                      size="lg"
                      color={colors.successText}
                      strokeWidth={2}
                    />
                  }
                  style={{ width: 200 }}
                  gradient={colors.gradientBrand}
                />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: kpiAnim }] }}>
                <KPICard
                  title="Active Engineers"
                  value={48}
                  previousValue={42}
                  icon={<LumenIcon name="engineer" size="lg" color="#7C3AED" strokeWidth={2} />}
                  style={{ width: 200 }}
                  gradient={colors.gradientAccent}
                />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: kpiAnim }] }}>
                <KPICard
                  title="Avg Resolution"
                  value={4.2}
                  previousValue={5.1}
                  suffix="h"
                  icon={
                    <LumenIcon name="timer" size="lg" color={colors.warningText} strokeWidth={2} />
                  }
                  style={{ width: 200 }}
                  gradient={colors.gradientBrand}
                />
              </Animated.View>
            </ScrollView>
          </Animated.View>

          {/* ── Analytics Charts ── */}
          <Animated.View style={[s.section, { opacity: chartAnim }]}>
            <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.glassCard}>
              <LinearGradient
                colors={[isDark ? "#1a1a2e20" : "#ffffff40", isDark ? "#1a1a2e10" : "#ffffff20"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.chartCard}>
                <View style={s.chartHeader}>
                  <Text
                    style={[
                      TextStyles.subtitle,
                      { color: colors.textPrimary, letterSpacing: -0.3 },
                    ]}
                  >
                    Reports Trend
                  </Text>
                  <Badge label="This Week" variant="brand" size="sm" />
                </View>
                <LineChart
                  data={[65, 78, 90, 81, 95, 110, 125]}
                  width={W - 80}
                  height={180}
                  color={colors.brand}
                  showGradient
                  showPoints
                />
                <View style={s.chartLegend}>
                  <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: colors.brand }]} />
                    <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                      Reports
                    </Text>
                  </View>
                  <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: colors.successText }]} />
                    <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                      Resolved
                    </Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {/* ── Category Distribution ── */}
          <Animated.View style={[s.chartRow, { opacity: chartAnim }]}>
            <BlurView
              intensity={20}
              tint={isDark ? "dark" : "light"}
              style={[s.glassCard, { flex: 1 }]}
            >
              <LinearGradient
                colors={[isDark ? "#1a1a2e20" : "#ffffff40", isDark ? "#1a1a2e10" : "#ffffff20"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.chartCard}>
                <Text
                  style={[
                    TextStyles.subtitle,
                    { color: colors.textPrimary, marginBottom: Spacing[4], letterSpacing: -0.3 },
                  ]}
                >
                  By Category
                </Text>
                <DonutChart
                  data={[
                    { value: 35, color: "#208AEF", label: "Roads" },
                    { value: 25, color: "#12B76A", label: "Water" },
                    { value: 20, color: "#F79009", label: "Lighting" },
                    { value: 15, color: "#7C3AED", label: "Garbage" },
                    { value: 5, color: "#F04438", label: "Other" },
                  ]}
                  size={140}
                  showLabels
                />
              </View>
            </BlurView>
            <BlurView
              intensity={20}
              tint={isDark ? "dark" : "light"}
              style={[s.glassCard, { flex: 1 }]}
            >
              <LinearGradient
                colors={[isDark ? "#1a1a2e20" : "#ffffff40", isDark ? "#1a1a2e10" : "#ffffff20"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.chartCard}>
                <Text
                  style={[
                    TextStyles.subtitle,
                    { color: colors.textPrimary, marginBottom: Spacing[4], letterSpacing: -0.3 },
                  ]}
                >
                  By Priority
                </Text>
                <BarChart
                  data={[45, 30, 25]}
                  width={140}
                  height={140}
                  color={colors.brand}
                  showGradient
                />
                <View style={s.priorityLegend}>
                  <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: "#F04438" }]} />
                    <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>High</Text>
                  </View>
                  <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: "#F79009" }]} />
                    <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                      Medium
                    </Text>
                  </View>
                  <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: "#12B76A" }]} />
                    <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Low</Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {/* ── Department Performance ── */}
          <Animated.View style={[s.section, { opacity: listAnim }]}>
            <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.glassCard}>
              <LinearGradient
                colors={[isDark ? "#1a1a2e20" : "#ffffff40", isDark ? "#1a1a2e10" : "#ffffff20"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.chartCard}>
                <Text
                  style={[
                    TextStyles.subtitle,
                    { color: colors.textPrimary, marginBottom: Spacing[4], letterSpacing: -0.3 },
                  ]}
                >
                  Department Performance
                </Text>
                {[
                  { dept: "Roads", completed: 92, pending: 8, color: "#208AEF" },
                  { dept: "Water", completed: 88, pending: 12, color: "#12B76A" },
                  { dept: "Lighting", completed: 95, pending: 5, color: "#F79009" },
                  { dept: "Sanitation", completed: 85, pending: 15, color: "#7C3AED" },
                ].map((dept, idx) => {
                  const deptKey = dept.dept;
                  return (
                    <Animated.View
                      key={deptKey}
                      style={{
                        transform: [
                          {
                            translateX: listAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0],
                            }),
                          },
                        ],
                        opacity: listAnim,
                      }}
                    >
                      <View style={s.deptRow}>
                        <View style={s.deptInfo}>
                          <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary }]}>
                            {dept.dept}
                          </Text>
                          <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                            {dept.completed} completed · {dept.pending} pending
                          </Text>
                        </View>
                        <View style={s.deptProgress}>
                          <View style={[s.deptBar, { backgroundColor: colors.bgSubtle }]}>
                            <Animated.View
                              style={[
                                s.deptBarFill,
                                {
                                  width: listAnim
                                    .interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [0, dept.completed],
                                    })
                                    .interpolate({
                                      inputRange: [0, 100],
                                      outputRange: ["0%", `${dept.completed}%`],
                                    }),
                                  backgroundColor: dept.color,
                                },
                              ]}
                            />
                          </View>
                          <Text style={[TextStyles.label, { color: dept.color }]}>
                            {dept.completed}%
                          </Text>
                        </View>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            </BlurView>
          </Animated.View>

          {/* ── Recent Activity ── */}
          <Animated.View style={[s.section, { opacity: listAnim }]}>
            <View style={s.sectionHeader}>
              <Text
                style={[TextStyles.subtitle, { color: colors.textPrimary, letterSpacing: -0.3 }]}
              >
                Recent Activity
              </Text>
              <Pressable>
                <Text style={[TextStyles.label, { color: colors.brand }]}>View all</Text>
              </Pressable>
            </View>
            <View style={s.activityList}>
              {[
                {
                  action: "New report submitted",
                  user: "Citizen #1247",
                  time: "2m ago",
                  icon: "report",
                  color: colors.brand,
                },
                {
                  action: "Task completed",
                  user: "Engineer #42",
                  time: "5m ago",
                  icon: "success",
                  color: colors.successText,
                },
                {
                  action: "Priority escalated",
                  user: "System",
                  time: "12m ago",
                  icon: "alert",
                  color: colors.errorText,
                },
                {
                  action: "Engineer assigned",
                  user: "Admin",
                  time: "25m ago",
                  icon: "engineer",
                  color: "#7C3AED",
                },
              ].map((activity, idx) => {
                const activityKey = idx;
                return (
                  <Animated.View
                    key={activityKey}
                    style={{
                      transform: [
                        {
                          translateX: listAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                      opacity: listAnim,
                    }}
                  >
                    <Pressable
                      style={({ pressed }) => [s.activityItem, { opacity: pressed ? 0.8 : 1 }]}
                    >
                      <View style={[s.activityGlow, { backgroundColor: activity.color + "08" }]} />
                      <View style={s.activityRow}>
                        <View style={[s.activityIcon, { backgroundColor: activity.color + "15" }]}>
                          <LumenIcon
                            name={activity.icon as any}
                            size="sm"
                            color={activity.color}
                            strokeWidth={2}
                          />
                        </View>
                        <View style={s.activityInfo}>
                          <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary }]}>
                            {activity.action}
                          </Text>
                          <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                            {activity.user}
                          </Text>
                        </View>
                        <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
                          {activity.time}
                        </Text>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>

          <View style={{ height: 90 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  topAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 280 },
  scroll: { paddingTop: 56, paddingHorizontal: Spacing[5] },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing[6],
  },
  headerContent: { flex: 1 },
  greetingWrap: {},
  statusRow: { flexDirection: "row", alignItems: "center", gap: Spacing[2], marginTop: Spacing[2] },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: Spacing[3] },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  section: { marginBottom: Spacing[6] },
  kpiRow: { gap: Spacing[4], paddingHorizontal: 2 },
  glassCard: {
    borderRadius: Radius["3xl"],
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  chartCard: { padding: Spacing[5] },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing[4],
  },
  chartLegend: { flexDirection: "row", gap: Spacing[4], marginTop: Spacing[2] },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  chartRow: { flexDirection: "row", gap: Spacing[4] },
  priorityLegend: {
    flexDirection: "row",
    gap: Spacing[3],
    marginTop: Spacing[4],
    justifyContent: "center",
  },
  deptRow: { gap: Spacing[3], marginBottom: Spacing[4] },
  deptInfo: { flex: 1 },
  deptProgress: { flexDirection: "row", alignItems: "center", gap: Spacing[3], flex: 1 },
  deptBar: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  deptBarFill: { height: "100%", borderRadius: 4 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing[3],
  },
  activityList: { gap: Spacing[3] },
  activityItem: {
    position: "relative",
    padding: Spacing[4],
    borderRadius: Radius.xl,
    overflow: "hidden",
  },
  activityGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.xl,
  },
  activityRow: {
    flexDirection: "row",
    gap: Spacing[3],
    alignItems: "center",
    position: "relative",
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: { flex: 1, gap: 2 },
});
