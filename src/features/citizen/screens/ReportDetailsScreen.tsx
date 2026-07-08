// ============================================================
// LUMEN — Report Details Screen
// Matches exact layout from design reference (images 2-5):
//   Header → Hero Map → Title & Status → Progress →
//   Timeline → Engineer → Details → Map Location → Activity Log
// With: real react-native-maps, premium animations, 60fps
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Badge } from "@/design-system/components/Badge";
import { Avatar } from "@/design-system/components/Avatar";
import { LinearProgress } from "@/design-system/components/Progress";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";

const { width: W } = Dimensions.get("window");

// ── Report Data (replace with API / Supabase realtime) ────────
const REPORT = {
  id: "BLR-2026-RD-ZB-000023",
  legacyId: "#R001",
  title: "Large pothole on MG Road near City Bank",
  category: "Road Damage",
  status: "in_progress",
  priority: "High Priority",
  progress: 65,
  estimatedCompletion: "Tomorrow by 5 PM",
  location: {
    address: "MG Road, Bengaluru",
    lat: 12.9753,
    lng: 77.6065,
  },
  department: "City Works & Roads",
  zone: "Zone B — Central",
  filed: "Today, 9:14 AM",
  sla: "48 hours",
  trackingId: "#R001-2024",
  engineer: {
    name: "Rajesh Kumar",
    designation: "Senior Field Engineer",
    zone: "Zone B",
    status: "On Site",
    rating: 4.8,
    phone: "+919876543210",
  },
};

const TIMELINE = [
  { step: "Report Submitted", time: "Today, 9:14 AM", done: true, desc: "Logged by Samuel K." },
  { step: "Under Review", time: "Today, 9:30 AM", done: true, desc: "Reviewed by City Works Dept." },
  { step: "Engineer Assigned", time: "Today, 10:45 AM", done: true, desc: "Rajesh Kumar assigned" },
  { step: "In Progress", time: "Today, 11:30 AM", done: true, desc: "Work commenced on site" },
  { step: "Resolved", time: "Estimated: Tomorrow", done: false, desc: "Pending completion" },
];

const ACTIVITY = [
  { time: "11:30 AM", action: "Rajesh K. started work on site", icon: "tools" as const, color: "#208AEF" },
  { time: "10:45 AM", action: "Task assigned to Rajesh Kumar", icon: "engineer" as const, color: "#7C3AED" },
  { time: "9:30 AM", action: "Report reviewed by supervisor", icon: "check" as const, color: "#12B76A" },
  { time: "9:14 AM", action: "Report submitted by Samuel K.", icon: "report" as const, color: "#F79009" },
];

const DETAILS = [
  { label: "Department", value: REPORT.department },
  { label: "Zone", value: REPORT.zone },
  { label: "Filed", value: REPORT.filed },
  { label: "SLA", value: REPORT.sla },
  { label: "Tracking ID", value: REPORT.trackingId, copyable: true },
];

// ── Animated Number Counter ───────────────────────────────────
function CounterText({
  target,
  suffix = "",
  style,
}: {
  target: number;
  suffix?: string;
  style?: any;
}) {
  const val = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(val, {
        toValue: target,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
      val.addListener(({ value }) => setDisplay(Math.round(value)));
    }, 500);
    return () => {
      clearTimeout(timer);
      val.removeAllListeners();
    };
  }, [target]);

  return <Text style={style}>{display}{suffix}</Text>;
}

// ── Timeline Step ─────────────────────────────────────────────
function TimelineStep({
  step,
  done,
  isLast,
  isCurrent,
  delay,
  colors,
}: {
  step: (typeof TIMELINE)[0];
  done: boolean;
  isLast: boolean;
  isCurrent: boolean;
  delay: number;
  colors: any;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 4 }),
      ]).start();
    }, delay);

    if (isCurrent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.35, duration: 850, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 850, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const dotColor = done ? (isCurrent ? "#F79009" : colors.brand) : colors.borderDefault;
  const dotBg = done ? dotColor : colors.bgSubtle;

  return (
    <Animated.View
      style={[tl.row, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      {/* Dot + Line column */}
      <View style={tl.leftCol}>
        <View style={[tl.dotWrap, { borderColor: dotColor, backgroundColor: dotBg }]}>
          {done && !isCurrent && (
            <LumenIcon name="check" size="xs" color="#FFFFFF" strokeWidth={3} />
          )}
          {isCurrent && (
            <Animated.View
              style={[tl.currentInner, { transform: [{ scale: pulseAnim }] }]}
            />
          )}
        </View>
        {!isLast && (
          <View
            style={[
              tl.line,
              { backgroundColor: done ? colors.brand + "70" : colors.borderDefault },
            ]}
          />
        )}
      </View>

      {/* Content column */}
      <View style={[tl.contentCol, isLast && { paddingBottom: 0 }]}>
        <Text
          style={[
            tl.stepTitle,
            {
              color: done ? colors.textPrimary : colors.textTertiary,
              fontWeight: isCurrent ? "800" : done ? "600" : "500",
            },
          ]}
        >
          {step.step}
        </Text>
        <Text style={[tl.stepTime, { color: isCurrent ? "#F79009" : colors.textTertiary }]}>
          {step.time}
        </Text>
        <Text style={[tl.stepDesc, { color: colors.textSecondary }]}>{step.desc}</Text>
        {!isLast && <View style={{ height: Spacing[3] }} />}
      </View>
    </Animated.View>
  );
}

const tl = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  leftCol: { alignItems: "center", width: 26 },
  dotWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  currentInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#F79009",
  },
  line: { width: 2, flex: 1, minHeight: 12, marginVertical: 2 },
  contentCol: { flex: 1, paddingBottom: 4 },
  stepTitle: { fontSize: 14 },
  stepTime: { fontSize: 12, marginTop: 1 },
  stepDesc: { fontSize: 12, marginTop: 2, lineHeight: 18 },
});

// ── Main Screen ───────────────────────────────────────────────
export default function ReportDetailsScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [copied, setCopied] = useState(false);

  // Entrance animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const heroScaleAnim = useRef(new Animated.Value(1.06)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    // Hero map subtle zoom-in
    Animated.timing(heroScaleAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();

    // Pulse for live status dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleCopy = () => {
    // Clipboard.setString(REPORT.trackingId); // enable after import
    setCopied(true);
    if (Platform.OS === "android") {
      ToastAndroid.show("Tracking ID copied!", ToastAndroid.SHORT);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    await Share.share({
      title: "LUMEN Report",
      message: `Track my civic complaint:\n${REPORT.title}\nTracking ID: ${REPORT.trackingId}\nStatus: In Progress`,
    });
  };

  const handleOpenMaps = () => {
    const url = `https://maps.google.com/?q=${REPORT.location.lat},${REPORT.location.lng}`;
    Linking.openURL(url);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${REPORT.engineer.phone}`);
  };

  const doneCount = TIMELINE.filter((t) => t.done).length;

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      {/* ════════════════════════════════════════ */}
      {/* HEADER                                  */}
      {/* ════════════════════════════════════════ */}
      <SafeAreaView
        edges={["top"]}
        style={[s.header, { backgroundColor: colors.bgBase, borderBottomColor: colors.borderDefault }]}
      >
        <Animated.View style={[s.headerInner, { opacity: headerAnim }]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={16}
            style={({ pressed }) => [s.iconCircle, { backgroundColor: colors.bgSubtle, opacity: pressed ? 0.6 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] }]}
          >
            <LumenIcon name="back" size="md" color={colors.textPrimary} strokeWidth={2.5} />
          </Pressable>

          <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
            Report {REPORT.legacyId}
          </Text>

          <Pressable
            onPress={handleShare}
            hitSlop={16}
            style={({ pressed }) => [s.iconCircle, { backgroundColor: colors.bgSubtle, opacity: pressed ? 0.6 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] }]}
          >
            <LumenIcon name="share" size="md" color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
        </Animated.View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ════════════════════════════════════════ */}
        {/* HERO — WORKING MAP                      */}
        {/* ════════════════════════════════════════ */}
        <Animated.View
          style={[s.heroContainer, { transform: [{ scale: heroScaleAnim }] }]}
        >
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            initialRegion={{
              latitude: REPORT.location.lat,
              longitude: REPORT.location.lng,
              latitudeDelta: 0.009,
              longitudeDelta: 0.009,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            showsBuildings
            showsTraffic
          >
            <Marker
              coordinate={{ latitude: REPORT.location.lat, longitude: REPORT.location.lng }}
              title={REPORT.title}
              description={REPORT.location.address}
            >
              {/* Custom animated marker */}
              <View style={s.markerWrapper}>
                <Animated.View
                  style={[s.markerRipple, { transform: [{ scale: pulseAnim }] }]}
                />
                <LinearGradient
                  colors={["#F04438", "#DC2626"]}
                  style={s.markerPin}
                >
                  <LumenIcon name="alert" size="xs" color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
                <View style={s.markerTip} />
              </View>
            </Marker>
          </MapView>

          {/* Live status badge + Report ID — bottom overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.72)"]}
            style={s.heroGradient}
          >
            <View style={s.heroOverlayContent}>
              <View style={s.liveChip}>
                <Animated.View
                  style={[s.liveDot, { transform: [{ scale: pulseAnim }] }]}
                />
                <Text style={s.liveText}>ENGINEER ON SITE</Text>
              </View>
              <Text style={s.heroReportId}>{REPORT.trackingId}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ════════════════════════════════════════ */}
        {/* All cards fade in after hero            */}
        {/* ════════════════════════════════════════ */}
        <Animated.View style={{ opacity: contentAnim }}>

          {/* TITLE & STATUS CHIPS */}
          <View style={s.titleSection}>
            <Text style={[s.issueTitle, { color: colors.textPrimary }]}>
              {REPORT.title}
            </Text>
            <View style={s.chipsRow}>
              <Badge label="In Progress" variant="info" icon="timer" />
              <Badge label="High Priority" variant="error" icon="alert" />
              <Badge label="Road Damage" variant="neutral" icon="road" />
            </View>
          </View>

          {/* ════════════════════════════════════════ */}
          {/* RESOLUTION PROGRESS                     */}
          {/* ════════════════════════════════════════ */}
          <View style={[s.card, { backgroundColor: colors.bgSurface, ...shadows.lg }, s.mx]}>
            <View style={s.progressHeaderRow}>
              <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
                Resolution Progress
              </Text>
              <CounterText
                target={REPORT.progress}
                suffix="%"
                style={[s.progressPct, { color: colors.brand }]}
              />
            </View>
            <View style={s.progressBarWrap}>
              <LinearProgress progress={REPORT.progress} color={colors.brand} height={8} />
            </View>
            <Text style={[TextStyles.caption, { color: colors.textTertiary, marginTop: 8 }]}>
              Estimated completion: {REPORT.estimatedCompletion}
            </Text>
          </View>

          {/* ════════════════════════════════════════ */}
          {/* STATUS TIMELINE                         */}
          {/* ════════════════════════════════════════ */}
          <View style={[s.card, { backgroundColor: colors.bgSurface, ...shadows.lg }, s.mx]}>
            <Text style={[s.cardTitle, { color: colors.textPrimary, marginBottom: Spacing[4] }]}>
              Status Timeline
            </Text>
            {TIMELINE.map((t, i) => {
              const isCurrent = t.done && i === doneCount - 1;
              return (
                <TimelineStep
                  key={t.step}
                  step={t}
                  done={t.done}
                  isLast={i === TIMELINE.length - 1}
                  isCurrent={isCurrent}
                  delay={i * 100}
                  colors={colors}
                />
              );
            })}
          </View>

          {/* ════════════════════════════════════════ */}
          {/* ASSIGNED ENGINEER                       */}
          {/* ════════════════════════════════════════ */}
          <View style={[s.card, { backgroundColor: colors.bgSurface, ...shadows.lg }, s.mx]}>
            <Text style={[s.cardTitle, { color: colors.textPrimary, marginBottom: Spacing[4] }]}>
              Assigned Engineer
            </Text>
            <View style={s.engineerRow}>
              <Avatar name={REPORT.engineer.name} size="lg" role="engineer" online />
              <View style={s.engineerInfo}>
                <Text style={[s.engineerName, { color: colors.textPrimary }]}>
                  {REPORT.engineer.name}
                </Text>
                <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                  {REPORT.engineer.designation} · {REPORT.engineer.zone}
                </Text>
                <View style={s.engineerBadgeRow}>
                  <View style={[s.onSiteBadge, { backgroundColor: colors.successBg }]}>
                    <View style={s.onSiteDot} />
                    <Text style={[TextStyles.caption, { color: colors.successText, fontWeight: "700" }]}>
                      {REPORT.engineer.status}
                    </Text>
                  </View>
                </View>
              </View>
              <Pressable
                onPress={handleCall}
                style={({ pressed }) => [
                  s.callBtn,
                  { backgroundColor: colors.successBg, opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] },
                ]}
                accessibilityLabel="Call engineer"
              >
                <LumenIcon name="phone" size="md" color={colors.successText} strokeWidth={2} />
              </Pressable>
            </View>
          </View>

          {/* ════════════════════════════════════════ */}
          {/* DETAILS GRID                            */}
          {/* ════════════════════════════════════════ */}
          <View style={[s.card, { backgroundColor: colors.bgSurface, ...shadows.lg }, s.mx]}>
            <Text style={[s.cardTitle, { color: colors.textPrimary, marginBottom: 4 }]}>
              Details
            </Text>
            {DETAILS.map(({ label, value, copyable }, i) => (
              <Pressable
                key={label}
                onPress={copyable ? handleCopy : undefined}
                style={[
                  s.detailRow,
                  {
                    borderBottomColor: colors.borderDefault,
                    borderBottomWidth: i < DETAILS.length - 1 ? 1 : 0,
                  },
                ]}
              >
                <Text style={[s.detailLabel, { color: colors.textTertiary }]}>{label}</Text>
                <View style={s.detailValueRow}>
                  <Text style={[s.detailValue, { color: colors.textPrimary }]}>
                    {copyable && copied ? "Copied!" : value}
                  </Text>
                  {copyable && (
                    <LumenIcon
                      name={copied ? "check" : "clipboard"}
                      size="xs"
                      color={copied ? "#12B76A" : colors.textTertiary}
                    />
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          {/* ════════════════════════════════════════ */}
          {/* MAP LOCATION — WORKING MAP              */}
          {/* ════════════════════════════════════════ */}
          <View style={[s.card, { backgroundColor: colors.bgSurface, ...shadows.lg }, s.mx, { padding: 0, overflow: "hidden" }]}>
            {/* Embedded working map */}
            <View style={s.inlineMapWrap}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFill}
                initialRegion={{
                  latitude: REPORT.location.lat,
                  longitude: REPORT.location.lng,
                  latitudeDelta: 0.006,
                  longitudeDelta: 0.006,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                showsBuildings
              >
                <Marker
                  coordinate={{ latitude: REPORT.location.lat, longitude: REPORT.location.lng }}
                >
                  <LinearGradient colors={["#208AEF", "#1D6FD1"]} style={s.inlineMarker}>
                    <LumenIcon name="mapPin" size="sm" color="#FFFFFF" strokeWidth={2.5} />
                  </LinearGradient>
                </Marker>
              </MapView>
              {/* gradient scrim so text is readable */}
              <LinearGradient
                colors={["transparent", isDark ? "rgba(29,41,57,0.97)" : "rgba(255,255,255,0.97)"]}
                style={s.inlineMapScrim}
              />
            </View>

            {/* Address + button */}
            <View style={s.mapCardFooter}>
              <LumenIcon name="mapPin" size="md" color={colors.brand} strokeWidth={2} />
              <Text style={[s.mapAddress, { color: colors.textPrimary }]}>
                {REPORT.location.address}
              </Text>
              <Pressable
                onPress={handleOpenMaps}
                style={({ pressed }) => [
                  s.openMapsBtn,
                  { backgroundColor: colors.brandSoft, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[s.openMapsBtnText, { color: colors.brand }]}>Open in Maps</Text>
                <LumenIcon name="external" size="sm" color={colors.brand} strokeWidth={2} />
              </Pressable>
            </View>
          </View>

          {/* ════════════════════════════════════════ */}
          {/* ACTIVITY LOG                            */}
          {/* ════════════════════════════════════════ */}
          <View style={[s.card, { backgroundColor: colors.bgSurface, ...shadows.lg }, s.mx]}>
            <Text style={[s.cardTitle, { color: colors.textPrimary, marginBottom: Spacing[4] }]}>
              Activity Log
            </Text>
            {ACTIVITY.map((a, i) => (
              <ActivityRow key={i} item={a} colors={colors} delay={i * 80} isLast={i === ACTIVITY.length - 1} />
            ))}
          </View>

          <View style={{ height: 48 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ── Activity Row ──────────────────────────────────────────────
function ActivityRow({
  item,
  colors,
  delay,
  isLast,
}: {
  item: (typeof ACTIVITY)[0];
  colors: any;
  delay: number;
  isLast: boolean;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 3 }),
      ]).start();
    }, 600 + delay);
  }, []);

  return (
    <Animated.View
      style={[
        ar.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.borderDefault },
        { opacity: fade, transform: [{ translateX: slide }] },
      ]}
    >
      <View style={[ar.iconWrap, { backgroundColor: item.color + "15" }]}>
        <LumenIcon name={item.icon} size="sm" color={item.color} strokeWidth={2} />
      </View>
      <View style={ar.body}>
        <Text style={[ar.action, { color: colors.textPrimary }]}>{item.action}</Text>
        <Text style={[ar.time, { color: colors.textTertiary }]}>{item.time}</Text>
      </View>
    </Animated.View>
  );
}

const ar = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  body: { flex: 1, gap: 2 },
  action: { fontSize: 13, fontWeight: "500", lineHeight: 18 },
  time: { fontSize: 12 },
});

// ── Styles ─────────────────────────────────────────────────────
const MX = 16;

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 32 },

  // Header
  header: { borderBottomWidth: 1 },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MX,
    paddingBottom: 12,
    paddingTop: 4,
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  // Hero map
  heroContainer: {
    height: 220,
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 40,
  },
  heroOverlayContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F79009",
  },
  liveText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FDE68A",
    letterSpacing: 0.8,
  },
  heroReportId: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
  },

  // Marker
  markerWrapper: { alignItems: "center" },
  markerRipple: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(240,68,56,0.25)",
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  markerTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#DC2626",
    marginTop: -1,
  },

  // Title section
  titleSection: {
    paddingHorizontal: MX,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 10,
  },
  issueTitle: { fontSize: 20, fontWeight: "700", lineHeight: 26 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  // Card
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  mx: { marginHorizontal: MX },
  cardTitle: { fontSize: 17, fontWeight: "700" },

  // Progress
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressPct: { fontSize: 32, fontWeight: "800", letterSpacing: -1 },
  progressBarWrap: {},

  // Engineer
  engineerRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  engineerInfo: { flex: 1, gap: 4 },
  engineerName: { fontSize: 15, fontWeight: "700" },
  engineerBadgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  onSiteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  onSiteDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#12B76A" },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // Details
  detailRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 8 },
  detailLabel: { fontSize: 13, width: 96, flexShrink: 0 },
  detailValueRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "flex-end" },
  detailValue: { fontSize: 14, fontWeight: "600", textAlign: "right" },

  // Inline map
  inlineMapWrap: { height: 140, width: "100%", position: "relative" },
  inlineMapScrim: { position: "absolute", bottom: 0, left: 0, right: 0, height: 50 },
  inlineMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  mapCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  mapAddress: { flex: 1, fontSize: 14, fontWeight: "600" },
  openMapsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  openMapsBtnText: { fontSize: 13, fontWeight: "700" },
});
