// ============================================================
// LUMEN — Engineer Dashboard (Uber-Driver Style)
// Phase 4: Engineer Experience
// ============================================================
import type { LumenIconName } from "@/design-system";
import { useTheme } from "@/design-system/ThemeContext";
import { Avatar } from "@/design-system/components/Avatar";
import { Badge } from "@/design-system/components/Badge";
import { BarChart } from "@/design-system/components/BarChart";
import { StatusBanner } from "@/design-system/components/Extras";
import { FAB } from "@/design-system/components/FAB";
import { LinearProgress } from "@/design-system/components/Progress";
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
  { id: "T001", title: "Repair large pothole", address: "123 MG Road, Bangalore", category: "road", priority: "high", distance: "1.2 km", eta: "15 min", status: "in_progress" },
  { id: "T002", title: "Fix street light panel", address: "Park Ave, 2nd Block", category: "streetlight", priority: "medium", distance: "3.4 km", eta: "30 min", status: "pending" },
  { id: "T003", title: "Water valve replacement", address: "5th Cross, Gandhi Nagar", category: "water", priority: "high", distance: "5.1 km", eta: "45 min", status: "pending" },
  { id: "T004", title: "Garbage collection assist", address: "Gandhi Nagar Main St", category: "garbage", priority: "low", distance: "6.8 km", eta: "60 min", status: "pending" },
];

const PRIORITY_COLOR: Record<string, string> = { high: "#F04438", medium: "#F79009", low: "#12B76A" };

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
  const { colors, isDark, shadows } = useTheme();
  const [status, setStatus] = useState<EngStatus>("available");
  const [refreshing, setRefreshing] = useState(false);
  const headerFade = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const statusAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const taskAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  const sc = STATUS_CONF[status];
  const STATUSES: EngStatus[] = ["available", "on_job", "break"];

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 6 }),
      ]).start();
      
      setTimeout(() => {
        Animated.spring(statusAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
      }, 150);
      
      setTimeout(() => {
        Animated.spring(statsAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
      }, 300);
      
      setTimeout(() => {
        Animated.spring(taskAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
      }, 450);
      
      setTimeout(() => {
        Animated.spring(listAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
      }, 600);
    };
    animate();
  }, []);

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bgBase} />
      <LinearGradient
        colors={["#7C3AED15", "#7C3AED05", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.topAccent}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await new Promise(r => setTimeout(r, 1000)); setRefreshing(false); }} tintColor={colors.brand} />}
      >
        {/* ── Header ── */}
        <Animated.View style={[s.header, { opacity: headerFade }]}>
          <View style={s.headerContent}>
            <View style={s.greetingWrap}>
              <Text style={[TextStyles.label, { color: "#7C3AED", letterSpacing: 1 }]}>{GREET()}</Text>
              <Text style={[TextStyles.heading2, { color: colors.textPrimary, letterSpacing: -0.5 }]}>Rajesh Kumar</Text>
              <View style={s.statusRow}>
                <View style={[s.statusDot, { backgroundColor: sc.color }]} />
                <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>{sc.label}</Text>
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
              onPress={() => router.push("/(engineer)/Profile" as any)}
            >
              <Avatar name="Rajesh Kumar" size="sm" role="engineer" online />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View style={[{ transform: [{ translateY: slideAnim }], opacity: headerFade }]}>

          {/* ── Status Toggle ── */}
          <Animated.View style={[s.statusCard, { opacity: statusAnim }]}>
            <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.glassCard}>
              <LinearGradient
                colors={[isDark ? "#1a1a2e20" : "#ffffff40", isDark ? "#1a1a2e10" : "#ffffff20"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.statusContent}>
                <Text style={[TextStyles.label, { color: colors.textSecondary, marginBottom: Spacing[3] }]}>
                  Your Status
                </Text>
                <View style={[s.statusToggle, { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault }]}>
                  {STATUSES.map((st) => {
                    const c = STATUS_CONF[st];
                    const active = status === st;
                    return (
                      <Pressable
                        key={st}
                        style={[s.statusBtn, active && { backgroundColor: colors.bgSurface, borderRadius: Radius.lg, ...shadows.sm }]}
                        onPress={() => setStatus(st)}
                      >
                        <View style={[s.statusDot, { backgroundColor: active ? c.color : colors.textTertiary }]} />
                        <Text style={[TextStyles.label, { color: active ? c.color : colors.textTertiary }]}>{c.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {/* ── Priority Task Alert ── */}
          {TASKS.find(t => t.priority === "high" && t.status !== "done") && (
            <View style={s.section}>
              <StatusBanner
                variant="error"
                title="Urgent Task Assigned"
                message="Repair large pothole on MG Road — High Priority"
              />
            </View>
          )}

          {/* ── Today's Stats ── */}
          <Animated.View style={[s.section, { opacity: statsAnim }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsRow}>
              <Animated.View style={{ transform: [{ scale: statsAnim }] }}>
                <StatCard label="Assigned Today" value="4" icon="taskCheck" variant="brand" compact />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: statsAnim }] }}>
                <StatCard label="Completed" value="2" icon="success" variant="success" compact />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: statsAnim }] }}>
                <StatCard label="In Progress" value="1" icon="timer" variant="warning" compact />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: statsAnim }] }}>
                <StatCard label="Performance" value="92%" icon="trend" variant="default" compact />
              </Animated.View>
            </ScrollView>
          </Animated.View>

          {/* ── Next Task (Priority Card) ── */}
          {TASKS[0] && (
            <Animated.View style={[s.section, { opacity: taskAnim }]}>
              <Text style={[TextStyles.subtitle, { color: colors.textPrimary, marginBottom: Spacing[3], letterSpacing: -0.3 }]}>Next Task</Text>
              <Pressable onPress={() => router.push("/(engineer)/Task-details" as any)}>
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.glassCard}>
                  <LinearGradient
                    colors={[isDark ? "#1a1a2e20" : "#ffffff40", isDark ? "#1a1a2e10" : "#ffffff20"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={s.priorityCard}>
                    <View style={s.priorityHeader}>
                      <View style={[s.priorityIcon, { backgroundColor: PRIORITY_COLOR[TASKS[0].priority] + "20" }]}>
                        <LumenIcon name={TASKS[0].category} size="lg" color={PRIORITY_COLOR[TASKS[0].priority]} strokeWidth={2} />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary }]} numberOfLines={1}>{TASKS[0].title}</Text>
                        <View style={s.taskMeta}>
                          <LumenIcon name="mapPin" size="xs" color={colors.textTertiary} strokeWidth={2} />
                          <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>{TASKS[0].address}</Text>
                        </View>
                      </View>
                      <Badge label="High" variant="error" size="sm" />
                    </View>
                    <View style={s.priorityFooter}>
                      <View style={s.etaInfo}>
                        <LumenIcon name="navigate" size="sm" color={colors.brand} strokeWidth={2} />
                        <Text style={[TextStyles.label, { color: colors.brand }]}>{TASKS[0].distance} · {TASKS[0].eta}</Text>
                      </View>
                      <View style={s.priorityActions}>
                        <Pressable
                          style={({ pressed }) => [
                            s.navBtn, 
                            { 
                              backgroundColor: "#7C3AED15", 
                              borderColor: "#7C3AED40",
                              opacity: pressed ? 0.8 : 1,
                              transform: [{ scale: pressed ? 0.95 : 1 }]
                            }
                          ]}
                          onPress={() => router.push("/(engineer)/Navigation" as any)}
                        >
                          <LumenIcon name="navigate2" size="sm" color="#7C3AED" strokeWidth={2} />
                          <Text style={[TextStyles.label, { color: "#7C3AED" }]}>Navigate</Text>
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [
                            s.navBtn, 
                            { 
                              backgroundColor: colors.brand + "15", 
                              borderColor: colors.brand + "40",
                              opacity: pressed ? 0.8 : 1,
                              transform: [{ scale: pressed ? 0.95 : 1 }]
                            }
                          ]}
                          onPress={() => router.push("/(engineer)/Update-progress" as any)}
                        >
                          <LumenIcon name="tools" size="sm" color={colors.brand} strokeWidth={2} />
                          <Text style={[TextStyles.label, { color: colors.brand }]}>Update</Text>
                        </Pressable>
                      </View>
                    </View>
                    <View style={{ marginTop: Spacing[3] }}>
                      <View style={s.progressHeader}>
                        <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>Task Progress</Text>
                        <Text style={[TextStyles.label, { color: colors.brand }]}>65%</Text>
                      </View>
                      <LinearProgress progress={65} color={colors.brand} height={6} />
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>
          )}

          {/* ── Task Queue ── */}
          <Animated.View style={[s.section, { opacity: listAnim }]}>
            <View style={s.sectionHeader}>
              <Text style={[TextStyles.subtitle, { color: colors.textPrimary, letterSpacing: -0.3 }]}>Task Queue</Text>
              <Pressable onPress={() => router.push("/(engineer)/Assigned-tasks" as any)}>
                <Text style={[TextStyles.label, { color: colors.brand }]}>View all</Text>
              </Pressable>
            </View>
            {TASKS.slice(1).map((task, idx) => (
              <Animated.View
                key={task.id}
                style={{
                  transform: [{ translateX: listAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                  opacity: listAnim,
                }}
              >
                <Pressable
                  onPress={() => router.push("/(engineer)/Task-details" as any)}
                  style={({ pressed }) => [s.taskItem, { opacity: pressed ? 0.8 : 1 }]}
                >
                  <View style={[s.taskGlow, { backgroundColor: PRIORITY_COLOR[task.priority] + "08" }]} />
                  <View style={s.taskRow}>
                    <View style={[s.taskIcon, { backgroundColor: PRIORITY_COLOR[task.priority] + "15" }]}>
                      <LumenIcon name={task.category} size="sm" color={PRIORITY_COLOR[task.priority]} strokeWidth={2} />
                    </View>
                    <View style={s.taskInfo}>
                      <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary }]} numberOfLines={1}>{task.title}</Text>
                      <View style={s.taskMeta}>
                        <LumenIcon name="mapPin" size="xs" color={colors.textTertiary} strokeWidth={2} />
                        <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>{task.address}</Text>
                      </View>
                    </View>
                    <View style={s.taskRight}>
                      <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>{task.distance}</Text>
                      <View style={[s.taskPriorityDot, { backgroundColor: PRIORITY_COLOR[task.priority] }]} />
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </Animated.View>

          {/* ── Performance Chart ── */}
          <Animated.View style={[s.section, { opacity: listAnim }]}>
            <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={s.glassCard}>
              <LinearGradient
                colors={[isDark ? "#1a1a2e20" : "#ffffff40", isDark ? "#1a1a2e10" : "#ffffff20"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.chartContent}>
                <View style={s.chartHeader}>
                  <Text style={[TextStyles.subtitle, { color: colors.textPrimary, letterSpacing: -0.3 }]}>Weekly Performance</Text>
                  <Badge label="Tasks Completed" variant="brand" size="sm" />
                </View>
                <BarChart
                  data={[8, 10, 6, 9, 7, 4, 0]}
                  width={W - 80}
                  height={160}
                  color={colors.brand}
                  showGradient
                  barWidth={24}
                  spacing={12}
                />
                <View style={s.chartLegend}>
                  <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Tasks completed per day</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          <View style={{ height: 90 }} />
        </Animated.View>
      </ScrollView>

      <View style={s.fab}>
        <FAB icon="navigate2" label="Navigate to Next" onPress={() => router.push("/(engineer)/Navigation" as any)} color="#7C3AED" />
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
  statusRow: { flexDirection: "row", alignItems: "center", gap: Spacing[2], marginTop: Spacing[2] },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: Spacing[3] },
  iconBtn: { borderRadius: Radius.full, borderWidth: 1, padding: 4 },
  statusCard: { marginBottom: Spacing[6] },
  glassCard: {
    borderRadius: Radius["3xl"],
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  chartContent: { padding: Spacing[5], gap: Spacing[4] },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing[4] },
  chartLegend: { marginTop: Spacing[3] },
  statusContent: { padding: Spacing[5] },
  statusToggle: {
    flexDirection: "row", borderRadius: Radius.xl, borderWidth: 1,
    padding: 4, gap: 2,
  },
  statusBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  section: { marginBottom: Spacing[6] },
  statsRow: { gap: Spacing[3] },
  priorityCard: { padding: Spacing[5], gap: Spacing[4] },
  priorityHeader: { flexDirection: "row", gap: Spacing[3], alignItems: "center" },
  priorityIcon: { width: 48, height: 48, borderRadius: Radius.xl, alignItems: "center", justifyContent: "center" },
  taskMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  priorityFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: Spacing[4] },
  etaInfo: { flexDirection: "row", alignItems: "center", gap: Spacing[1.5] },
  priorityActions: { flexDirection: "row", gap: Spacing[2] },
  navBtn: {
    flexDirection: "row", alignItems: "center", gap: Spacing[1.5],
    paddingHorizontal: Spacing[3], paddingVertical: Spacing[2],
    borderRadius: Radius.full, borderWidth: 1,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing[1.5] },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing[3] },
  taskItem: {
    position: "relative",
    padding: Spacing[4],
    borderRadius: Radius.xl,
    overflow: "hidden",
    marginBottom: Spacing[3],
  },
  taskGlow: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: Radius.xl,
  },
  taskRow: { flexDirection: "row", gap: Spacing[3], alignItems: "center", position: "relative" },
  taskIcon: { width: 36, height: 36, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },
  taskInfo: { flex: 1, gap: 4 },
  taskRight: { alignItems: "flex-end", gap: 6 },
  taskPriorityDot: { width: 8, height: 8, borderRadius: 4 },
  perfRow: { flexDirection: "row", gap: Spacing[2], alignItems: "flex-end", height: 100 },
  barCol: { flex: 1, alignItems: "center", gap: Spacing[1.5] },
  barTrack: { flex: 1, width: "100%", borderRadius: 4, overflow: "hidden", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 4 },
  fab: { position: "absolute", bottom: Spacing[8], right: Spacing[5] },
});
