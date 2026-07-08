// ============================================================
// LUMEN — Report Details Screen (Premium Government-Grade Redesign)
// Preserves exact section order. Enhanced UI & functionality only.
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Clipboard,
  Dimensions,
  Easing,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Badge } from "@/design-system/components/Badge";
import { Avatar } from "@/design-system/components/Avatar";
import { LinearProgress } from "@/design-system/components/Progress";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";

const { width: W } = Dimensions.get("window");

// ── Structured Report ID ──────────────────────────────────────
// Format: CITY-YEAR-DEPT-ZONE-SEQUENCE
const TRACKING_ID = "BLR-2026-RD-ZB-000023";
const REPORT_COORDS = { latitude: 12.9716, longitude: 77.5946 };

// ── Mock data (replace with backend API) ─────────────────────
const TIMELINE = [
  {
    step: "Report Submitted",
    time: "Today, 9:14 AM",
    done: true,
    desc: "Logged by Samuel K. via LUMEN App",
    dept: "Citizens Portal",
    actor: "Samuel K.",
  },
  {
    step: "Under Review",
    time: "Today, 9:30 AM",
    done: true,
    desc: "Verified by City Works Dept. AI pre-classified as Road Damage.",
    dept: "AI Verification Engine",
    actor: "System AI",
  },
  {
    step: "Engineer Assigned",
    time: "Today, 10:45 AM",
    done: true,
    desc: "Rajesh Kumar assigned by supervisor Anitha M.",
    dept: "Roads & Transport",
    actor: "Anitha M.",
  },
  {
    step: "In Progress",
    time: "Today, 11:30 AM",
    done: true,
    desc: "Engineer commenced work on site. Materials deployed.",
    dept: "Roads & Transport",
    actor: "Rajesh Kumar",
  },
  {
    step: "Resolved",
    time: "Estimated: Tomorrow, 5 PM",
    done: false,
    desc: "Pending final inspection and citizen verification.",
    dept: "Quality Control",
    actor: "Pending",
  },
];

const ACTIVITY = [
  {
    time: "11:30 AM",
    date: "Today",
    action: "Rajesh K. started work on site. Pothole filling in progress.",
    icon: "tools" as const,
    actor: "Rajesh Kumar",
    color: "#208AEF",
  },
  {
    time: "10:45 AM",
    date: "Today",
    action: "Task assigned to Rajesh Kumar by supervisor Anitha M.",
    icon: "engineer" as const,
    actor: "Anitha M.",
    color: "#7C3AED",
  },
  {
    time: "9:30 AM",
    date: "Today",
    action: "Report reviewed and verified by Dept. Supervisor.",
    icon: "check" as const,
    actor: "Anitha M.",
    color: "#12B76A",
  },
  {
    time: "9:14 AM",
    date: "Today",
    action: "Report submitted by Samuel K. via LUMEN Citizen App.",
    icon: "report" as const,
    actor: "Samuel K.",
    color: "#F79009",
  },
];

const DETAILS = [
  { label: "Department", value: "Roads & Transport", icon: "building" },
  { label: "Zone", value: "Zone B — Central Bangalore", icon: "mapPin" },
  { label: "Ward", value: "Ward 76 — Shivajinagar", icon: "locate" },
  { label: "Municipality", value: "BBMP — Bruhat Bengaluru", icon: "globe" },
  { label: "SLA", value: "48 Hours (Expires Tomorrow 9 AM)", icon: "timer" },
  { label: "Tracking ID", value: TRACKING_ID, icon: "clipboard", copyable: true },
  { label: "Filed", value: "8 July 2026, 9:14 AM", icon: "calendar" },
  { label: "Expected By", value: "9 July 2026, 5:00 PM", icon: "clock" },
  { label: "Priority", value: "High Priority", icon: "alert", highlight: "#F04438" },
  { label: "Category", value: "Road Damage — Pothole", icon: "road" },
  { label: "Reported Via", value: "LUMEN Mobile App", icon: "phone" },
  { label: "Citizen", value: "Samuel K.", icon: "profile" },
];

// ── Helper: Animated Progress Counter ────────────────────────
function AnimatedPercent({ target }: { target: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: target,
      duration: 1400,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
    anim.addListener(({ value }) => setDisplay(Math.round(value)));
    return () => anim.removeAllListeners();
  }, [target]);

  return <Text>{display}%</Text>;
}

// ── Helper: SLA Countdown ─────────────────────────────────────
function SlaCountdown({ totalHours, remainingHours }: { totalHours: number; remainingHours: number }) {
  const pct = Math.round((remainingHours / totalHours) * 100);
  const color = pct > 50 ? "#12B76A" : pct > 25 ? "#F79009" : "#F04438";
  const h = Math.floor(remainingHours);
  const m = Math.round((remainingHours - h) * 60);
  return { label: `${h}h ${m}m remaining`, color, pct };
}

// ── Main Screen ───────────────────────────────────────────────
export default function ReportDetailsScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [copied, setCopied] = useState(false);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [expandedTimeline, setExpandedTimeline] = useState<number | null>(null);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 6 }),
    ]).start();

    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: 65,
        duration: 1400,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }).start();
    }, 400);

    // Live pulse for on-site status
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleCopyId = () => {
    Clipboard.setString(TRACKING_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMaps = () => {
    const url = `https://maps.google.com/?q=${REPORT_COORDS.latitude},${REPORT_COORDS.longitude}`;
    Linking.openURL(url);
  };

  const sla = SlaCountdown({ totalHours: 48, remainingHours: 21.5 });

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── HEADER ── */}
      <SafeAreaView edges={["top"]} style={[s.header, { backgroundColor: colors.bgBase, borderBottomColor: colors.borderDefault }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [s.headerIconBtn, { opacity: pressed ? 0.6 : 1, backgroundColor: colors.bgSubtle }]}
        >
          <LumenIcon name="back" size="md" color={colors.textPrimary} strokeWidth={2.5} />
        </Pressable>

        <View style={s.headerCenter}>
          <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Report Details</Text>
          <View style={s.trackingPill}>
            <View style={[s.liveGreen, { backgroundColor: "#12B76A" }]} />
            <Text style={[s.trackingText, { color: colors.brand }]}>{TRACKING_ID}</Text>
          </View>
        </View>

        <Pressable
          onPress={handleCopyId}
          hitSlop={12}
          style={({ pressed }) => [s.headerIconBtn, { opacity: pressed ? 0.6 : 1, backgroundColor: colors.bgSubtle }]}
        >
          <LumenIcon name={copied ? "check" : "share"} size="md" color={copied ? "#12B76A" : colors.textSecondary} strokeWidth={2} />
        </Pressable>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════════════════════════════════ */}
        {/* HERO IMAGE / MAP                               */}
        {/* ═══════════════════════════════════════════════ */}
        <View style={s.heroMapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            mapType={mapType}
            initialRegion={{
              latitude: REPORT_COORDS.latitude,
              longitude: REPORT_COORDS.longitude,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
            scrollEnabled
            zoomEnabled
            showsUserLocation
            showsTraffic
          >
            <Marker coordinate={REPORT_COORDS}>
              <View style={s.markerOuter}>
                <Animated.View style={[s.markerPulse, { transform: [{ scale: pulseAnim }], backgroundColor: "#F04438" + "30" }]} />
                <LinearGradient colors={["#F04438", "#DC2626"]} style={s.markerInner}>
                  <LumenIcon name="alert" size="sm" color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </View>
            </Marker>
          </MapView>

          {/* Map type toggle */}
          <View style={s.mapToggle}>
            {(["standard", "satellite"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setMapType(t)}
                style={[s.mapToggleBtn, mapType === t && { backgroundColor: colors.brand }]}
              >
                <Text style={[s.mapToggleText, { color: mapType === t ? "#FFF" : colors.textSecondary }]}>
                  {t === "standard" ? "Map" : "Sat"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Hero overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)"]}
            style={s.heroOverlay}
          >
            <View style={s.heroLeft}>
              <View style={s.statusPill}>
                <Animated.View style={[s.statusPillDot, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={s.statusPillText}>ENGINEER ON SITE</Text>
              </View>
              <Text style={s.heroId}>{TRACKING_ID}</Text>
              <Text style={s.heroAddress}>MG Road, Bengaluru · Zone B</Text>
            </View>
            <Pressable onPress={handleOpenMaps} style={s.heroMapBtn}>
              <LumenIcon name="external" size="sm" color="#FFFFFF" />
            </Pressable>
          </LinearGradient>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ═══════════════════════════════════════════════ */}
          {/* ISSUE SUMMARY                                   */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={[s.sectionCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault, marginTop: -24 }]}>
            <View style={s.issueHeader}>
              <LinearGradient colors={["#F04438", "#DC2626"]} style={s.issueCategoryBadge}>
                <LumenIcon name="road" size="sm" color="#FFFFFF" />
              </LinearGradient>
              <View style={s.issueMeta}>
                <Text style={[TextStyles.caption, { color: colors.textTertiary, textTransform: "uppercase", letterSpacing: 1 }]}>
                  Road Damage · High Priority
                </Text>
                <Text style={[s.issueTitle, { color: colors.textPrimary }]}>
                  Large Pothole on MG Road near City Bank
                </Text>
              </View>
            </View>
          </View>

          {/* STATUS CHIPS */}
          <View style={s.chipsRow}>
            <Badge label="In Progress" variant="info" icon="timer" />
            <Badge label="High Priority" variant="error" icon="alert" />
            <Badge label="Road Damage" variant="neutral" icon="road" />
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* RESOLUTION PROGRESS                            */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={s.px}>
            <BlurView intensity={isDark ? 30 : 15} tint={isDark ? "dark" : "light"} style={[s.glassCard, { borderColor: colors.borderDefault }]}>
              <LinearGradient
                colors={isDark ? ["rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"] : ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.6)"]}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient colors={[colors.brand, "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.glassAccentBar} />
              <View style={s.progressCardInner}>
                <View style={s.progressHeaderRow}>
                  <View>
                    <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Resolution Progress</Text>
                    <Text style={[TextStyles.caption, { color: colors.textTertiary, marginTop: 2 }]}>
                      Estimated completion: Tomorrow by 5 PM
                    </Text>
                  </View>
                  <Text style={[s.progressPct, { color: colors.brand }]}>
                    <AnimatedPercent target={65} />
                  </Text>
                </View>

                <View style={s.progressBarWrap}>
                  <LinearProgress progress={65} color={colors.brand} height={8} />
                </View>

                {/* SLA countdown */}
                <View style={[s.slaRow, { backgroundColor: sla.color + "12", borderColor: sla.color + "30" }]}>
                  <View style={[s.slaDot, { backgroundColor: sla.color }]} />
                  <Text style={[TextStyles.caption, { color: sla.color, fontWeight: "700" }]}>SLA: {sla.label}</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>48h total</Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* STATUS TIMELINE                                 */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={s.px}>
            <View style={[s.sectionCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
              <Text style={[s.sectionTitle, { color: colors.textPrimary, marginBottom: 20 }]}>Status Timeline</Text>

              {TIMELINE.map((t, i) => {
                const isLast = i === TIMELINE.length - 1;
                const isExpanded = expandedTimeline === i;
                const isCurrent = t.done && (i === TIMELINE.filter(x => x.done).length - 1);

                return (
                  <Pressable key={t.step} onPress={() => setExpandedTimeline(isExpanded ? null : i)}>
                    <View style={s.timelineRow}>
                      {/* Left — dot + line */}
                      <View style={s.tlLeft}>
                        <View style={[
                          s.tlDot,
                          t.done
                            ? { backgroundColor: isCurrent ? "#F79009" : colors.brand, borderColor: isCurrent ? "#F79009" : colors.brand }
                            : { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault },
                        ]}>
                          {t.done && !isCurrent && <LumenIcon name="check" size="xs" color="#FFFFFF" strokeWidth={3} />}
                          {isCurrent && (
                            <Animated.View style={[s.currentDotInner, { transform: [{ scale: pulseAnim }] }]} />
                          )}
                        </View>
                        {!isLast && (
                          <View style={[s.tlLine, { backgroundColor: t.done ? colors.brand + "60" : colors.borderDefault }]} />
                        )}
                      </View>

                      {/* Right — content */}
                      <View style={[s.tlContent, !isLast && { marginBottom: 8 }]}>
                        <View style={s.tlHeader}>
                          <Text style={[s.tlStep, { color: t.done ? colors.textPrimary : colors.textTertiary, fontWeight: isCurrent ? "800" : "600" }]}>
                            {t.step}
                          </Text>
                          <Text style={[TextStyles.caption, { color: isCurrent ? "#F79009" : colors.textTertiary }]}>
                            {t.time}
                          </Text>
                        </View>
                        <Text style={[TextStyles.caption, { color: colors.textSecondary, marginTop: 2 }]}>{t.desc}</Text>

                        {/* Expandable details */}
                        {isExpanded && (
                          <View style={[s.tlExpanded, { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault }]}>
                            <View style={s.tlExpandedRow}>
                              <LumenIcon name="building" size="xs" color={colors.textTertiary} />
                              <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>{t.dept}</Text>
                            </View>
                            <View style={s.tlExpandedRow}>
                              <LumenIcon name="profile" size="xs" color={colors.textTertiary} />
                              <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>{t.actor}</Text>
                            </View>
                          </View>
                        )}

                        {!isLast && <View style={{ height: 12 }} />}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* ASSIGNED ENGINEER                               */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={s.px}>
            <View style={[s.sectionCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
              <Text style={[s.sectionTitle, { color: colors.textPrimary, marginBottom: 16 }]}>Assigned Engineer</Text>
              <View style={s.engineerRow}>
                <Avatar name="Rajesh Kumar" size="lg" role="engineer" online />
                <View style={s.engineerInfo}>
                  <Text style={[s.engineerName, { color: colors.textPrimary }]}>Rajesh Kumar</Text>
                  <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Senior Field Engineer · Zone B</Text>
                  <View style={s.engineerMeta}>
                    <Badge label="On Site" variant="success" size="sm" dot />
                    <View style={s.ratingRow}>
                      <LumenIcon name="star" size="xs" color="#F79009" />
                      <Text style={[TextStyles.caption, { color: colors.textSecondary, fontWeight: "700" }]}>4.8</Text>
                    </View>
                    <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>· 0.8 km away</Text>
                  </View>
                </View>
                <View style={s.engineerActions}>
                  <Pressable
                    style={[s.actionCircle, { backgroundColor: colors.successBg }]}
                    onPress={() => Linking.openURL("tel:+919876543210")}
                  >
                    <LumenIcon name="phone" size="md" color={colors.successText} strokeWidth={2} />
                  </Pressable>
                  <Pressable
                    style={[s.actionCircle, { backgroundColor: colors.brand + "15" }]}
                    onPress={() => handleOpenMaps()}
                  >
                    <LumenIcon name="navigate" size="md" color={colors.brand} strokeWidth={2} />
                  </Pressable>
                </View>
              </View>

              {/* ETA strip */}
              <View style={[s.etaStrip, { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault }]}>
                <LumenIcon name="timer" size="sm" color={colors.brand} />
                <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Estimated arrival on site:</Text>
                <Text style={[TextStyles.caption, { color: colors.brand, fontWeight: "800" }]}>Already on site</Text>
              </View>
            </View>
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* DEPARTMENT DETAILS                              */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={s.px}>
            <View style={[s.sectionCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
              <View style={s.sectionHeaderRow}>
                <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Details</Text>
                <Pressable
                  onPress={handleCopyId}
                  style={[s.copyBtn, { backgroundColor: colors.brand + "15", borderColor: colors.brand + "30" }]}
                >
                  <LumenIcon name={copied ? "check" : "clipboard"} size="xs" color={colors.brand} />
                  <Text style={[TextStyles.caption, { color: colors.brand, fontWeight: "700" }]}>
                    {copied ? "Copied!" : "Copy ID"}
                  </Text>
                </Pressable>
              </View>

              {DETAILS.map(({ label, value, icon, copyable, highlight }, i) => (
                <Pressable
                  key={label}
                  onPress={copyable ? handleCopyId : undefined}
                  style={[s.detailRow, { borderBottomColor: colors.borderDefault, borderBottomWidth: i < DETAILS.length - 1 ? 1 : 0 }]}
                >
                  <View style={[s.detailIconWrap, { backgroundColor: (highlight ?? colors.brand) + "12" }]}>
                    <LumenIcon name={icon as any} size="xs" color={highlight ?? colors.brand} />
                  </View>
                  <Text style={[s.detailLabel, { color: colors.textTertiary }]}>{label}</Text>
                  <Text
                    style={[s.detailValue, { color: highlight ?? colors.textPrimary, flex: 1, textAlign: "right" }]}
                    numberOfLines={copyable ? 1 : undefined}
                  >
                    {value}
                  </Text>
                  {copyable && <LumenIcon name="clipboard" size="xs" color={colors.textTertiary} />}
                </Pressable>
              ))}
            </View>
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* INTERACTIVE MAP                                 */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={s.px}>
            <View style={[s.sectionCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault, padding: 0, overflow: "hidden" }]}>
              <View style={{ padding: 20, paddingBottom: 12 }}>
                <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Location</Text>
                <Text style={[TextStyles.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  MG Road, Bengaluru · 12.9716°N 77.5946°E
                </Text>
              </View>

              <View style={s.inlineMapContainer}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={StyleSheet.absoluteFill}
                  initialRegion={{
                    latitude: REPORT_COORDS.latitude,
                    longitude: REPORT_COORDS.longitude,
                    latitudeDelta: 0.006,
                    longitudeDelta: 0.006,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  showsTraffic
                >
                  <Marker coordinate={REPORT_COORDS}>
                    <LinearGradient colors={["#F04438", "#DC2626"]} style={s.inlineMarker}>
                      <LumenIcon name="mapPin" size="sm" color="#FFFFFF" strokeWidth={2.5} />
                    </LinearGradient>
                  </Marker>
                </MapView>
              </View>

              <View style={s.mapActionsRow}>
                <Pressable onPress={handleOpenMaps} style={[s.mapActionBtn, { backgroundColor: colors.brand, flex: 1 }]}>
                  <LumenIcon name="external" size="sm" color="#FFFFFF" />
                  <Text style={[TextStyles.caption, { color: "#FFFFFF", fontWeight: "700" }]}>Open in Maps</Text>
                </Pressable>
                <Pressable
                  onPress={() => Linking.openURL(`google.navigation:q=${REPORT_COORDS.latitude},${REPORT_COORDS.longitude}`)}
                  style={[s.mapActionBtn, { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault, borderWidth: 1 }]}
                >
                  <LumenIcon name="navigate" size="sm" color={colors.brand} />
                  <Text style={[TextStyles.caption, { color: colors.brand, fontWeight: "700" }]}>Navigate</Text>
                </Pressable>
                <Pressable
                  style={[s.mapActionBtn, { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault, borderWidth: 1 }]}
                >
                  <LumenIcon name="share" size="sm" color={colors.brand} />
                  <Text style={[TextStyles.caption, { color: colors.brand, fontWeight: "700" }]}>Share</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* ACTIVITY LOG                                    */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={s.px}>
            <View style={[s.sectionCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
              <View style={s.sectionHeaderRow}>
                <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Activity Log</Text>
                <View style={[s.liveBadge, { backgroundColor: "#12B76A" + "15", borderColor: "#12B76A" + "30" }]}>
                  <View style={[s.liveDot, { backgroundColor: "#12B76A" }]} />
                  <Text style={[TextStyles.caption, { color: "#12B76A", fontWeight: "700" }]}>Live</Text>
                </View>
              </View>

              {ACTIVITY.map((a, i) => (
                <View key={i} style={[s.activityRow, i < ACTIVITY.length - 1 && { borderBottomColor: colors.borderDefault, borderBottomWidth: 1 }]}>
                  <View style={[s.activityIconWrap, { backgroundColor: a.color + "15" }]}>
                    <LumenIcon name={a.icon} size="sm" color={a.color} strokeWidth={2} />
                  </View>
                  <View style={s.activityBody}>
                    <Text style={[TextStyles.bodySmall, { color: colors.textPrimary, fontWeight: "600" }]} numberOfLines={2}>
                      {a.action}
                    </Text>
                    <View style={s.activityMeta}>
                      <LumenIcon name="profile" size="xs" color={colors.textTertiary} />
                      <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>{a.actor}</Text>
                      <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>·</Text>
                      <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>{a.date}, {a.time}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* CITIZEN FEEDBACK                                */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={s.px}>
            <View style={[s.sectionCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
              <Text style={[s.sectionTitle, { color: colors.textPrimary, marginBottom: 12 }]}>Citizen Feedback</Text>
              <Text style={[TextStyles.caption, { color: colors.textSecondary, marginBottom: 16 }]}>
                Once resolved, you can rate and provide feedback on this report.
              </Text>
              <View style={s.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} style={s.starBtn}>
                    <LumenIcon name="star" size="lg" color={colors.borderDefault} />
                  </Pressable>
                ))}
              </View>
              <View style={[s.feedbackDisabled, { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault }]}>
                <LumenIcon name="lock" size="sm" color={colors.textTertiary} />
                <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
                  Feedback available after resolution
                </Text>
              </View>
            </View>
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* ATTACHMENTS                                     */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={s.px}>
            <View style={[s.sectionCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
              <Text style={[s.sectionTitle, { color: colors.textPrimary, marginBottom: 12 }]}>Attachments</Text>
              <View style={[s.emptyAttachments, { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault }]}>
                <LumenIcon name="image" size="lg" color={colors.textTertiary} />
                <Text style={[TextStyles.caption, { color: colors.textTertiary, textAlign: "center" }]}>
                  No attachments uploaded.{"\n"}Photos will appear here once added by the engineer.
                </Text>
              </View>
            </View>
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* COMMENTS                                        */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={s.px}>
            <View style={[s.sectionCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
              <Text style={[s.sectionTitle, { color: colors.textPrimary, marginBottom: 12 }]}>Comments</Text>
              <View style={[s.emptyAttachments, { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault }]}>
                <LumenIcon name="comment" size="lg" color={colors.textTertiary} />
                <Text style={[TextStyles.caption, { color: colors.textTertiary, textAlign: "center" }]}>
                  No comments yet. Department updates will appear here.
                </Text>
              </View>
            </View>
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* RESOLUTION                                      */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={s.px}>
            <LinearGradient
              colors={["#052E16", "#065F46"]}
              style={[s.resolutionCard, { borderColor: "#14532D" }]}
            >
              <View style={s.resolutionHeader}>
                <View style={[s.resolutionIcon, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                  <LumenIcon name="clock" size="md" color="#4ADE80" strokeWidth={2} />
                </View>
                <View style={s.resolutionText}>
                  <Text style={s.resolutionTitle}>Expected Resolution</Text>
                  <Text style={s.resolutionDate}>9 July 2026, 5:00 PM</Text>
                </View>
              </View>
              <Text style={s.resolutionNote}>
                You will be notified automatically when this issue is resolved. You can verify the resolution and provide feedback.
              </Text>
            </LinearGradient>
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────
const H_PAD = 20;

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerIconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center", gap: 2 },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  trackingPill: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveGreen: { width: 6, height: 6, borderRadius: 3 },
  trackingText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  // Hero Map
  heroMapContainer: { height: 260, width: "100%", position: "relative" },
  heroOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 20, paddingBottom: 16, paddingTop: 40,
  },
  heroLeft: { flex: 1, gap: 3 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  statusPillDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#F79009" },
  statusPillText: { fontSize: 10, fontWeight: "800", color: "#FDE68A", letterSpacing: 1.2 },
  heroId: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },
  heroAddress: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
  heroMapBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  mapToggle: {
    position: "absolute", top: 16, right: 16,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8, padding: 3, gap: 3,
  },
  mapToggleBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  mapToggleText: { fontSize: 11, fontWeight: "700" },

  // Marker
  markerOuter: { alignItems: "center", justifyContent: "center" },
  markerPulse: { position: "absolute", width: 40, height: 40, borderRadius: 20 },
  markerInner: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },

  // Section card
  px: { paddingHorizontal: H_PAD, marginBottom: 16 },
  sectionCard: { borderRadius: 20, borderWidth: 1, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },

  // Issue summary
  issueHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  issueCategoryBadge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 2, flexShrink: 0 },
  issueMeta: { flex: 1, gap: 4 },
  issueTitle: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: H_PAD, marginBottom: 16 },

  // Glass card (Progress)
  glassCard: { borderRadius: 20, overflow: "hidden", borderWidth: 1 },
  glassAccentBar: { height: 3 },
  progressCardInner: { padding: 20, gap: 12 },
  progressHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  progressPct: { fontSize: 32, fontWeight: "800", letterSpacing: -1 },
  progressBarWrap: { marginVertical: 4 },
  slaRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  slaDot: { width: 7, height: 7, borderRadius: 4 },

  // Timeline
  timelineRow: { flexDirection: "row", gap: 12 },
  tlLeft: { alignItems: "center", width: 24 },
  tlDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center", zIndex: 2 },
  currentDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#F79009" },
  tlLine: { width: 2, flex: 1, marginVertical: 2, minHeight: 20 },
  tlContent: { flex: 1 },
  tlHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tlStep: { fontSize: 13, flex: 1 },
  tlExpanded: { marginTop: 8, borderRadius: 10, borderWidth: 1, padding: 10, gap: 6 },
  tlExpandedRow: { flexDirection: "row", alignItems: "center", gap: 6 },

  // Engineer
  engineerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  engineerInfo: { flex: 1, gap: 4 },
  engineerName: { fontSize: 15, fontWeight: "700" },
  engineerMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  engineerActions: { flexDirection: "row", gap: 8 },
  actionCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  etaStrip: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, marginTop: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },

  // Details
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  detailIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  detailLabel: { fontSize: 12, fontWeight: "500", width: 95, flexShrink: 0 },
  detailValue: { fontSize: 13, fontWeight: "600" },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },

  // Inline map
  inlineMapContainer: { height: 160, width: "100%" },
  inlineMarker: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  mapActionsRow: { flexDirection: "row", gap: 8, padding: 12 },
  mapActionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12 },

  // Activity
  activityRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", paddingVertical: 12 },
  activityIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  activityBody: { flex: 1, gap: 4 },
  activityMeta: { flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },

  // Feedback
  ratingStars: { flexDirection: "row", gap: 8, marginBottom: 12 },
  starBtn: { padding: 4 },
  feedbackDisabled: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", padding: 12 },

  // Attachments / Comments
  emptyAttachments: { borderRadius: 12, borderWidth: 1, borderStyle: "dashed", padding: 24, alignItems: "center", gap: 8 },

  // Resolution
  resolutionCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 12 },
  resolutionHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  resolutionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  resolutionText: { flex: 1 },
  resolutionTitle: { fontSize: 12, fontWeight: "700", color: "#4ADE80", letterSpacing: 0.5, textTransform: "uppercase" },
  resolutionDate: { fontSize: 16, fontWeight: "800", color: "#FFFFFF", marginTop: 2 },
  resolutionNote: { fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 20 },
});
