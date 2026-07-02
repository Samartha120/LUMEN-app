// ============================================================
// LUMEN — Report Details Screen (Visual Timeline)
// Phase 3: Citizen Experience
// ============================================================
import React from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Badge } from "@/design-system/components/Badge";
import { Card } from "@/design-system/components/Card";
import { Avatar } from "@/design-system/components/Avatar";
import { LinearProgress } from "@/design-system/components/Progress";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";

const TIMELINE = [
  { step: "Report Submitted", time: "Today, 9:14 AM", done: true, desc: "Logged by Samuel K." },
  { step: "Under Review", time: "Today, 9:30 AM", done: true, desc: "Reviewed by City Works Dept." },
  { step: "Engineer Assigned", time: "Today, 10:45 AM", done: true, desc: "Rajesh Kumar assigned" },
  { step: "In Progress", time: "Today, 11:30 AM", done: true, desc: "Work commenced on site" },
  { step: "Resolved", time: "Estimated: Tomorrow", done: false, desc: "Pending completion" },
];

const ACTIVITY = [
  { time: "11:30 AM", action: "Rajesh K. started work on site", icon: "tools" },
  { time: "10:45 AM", action: "Task assigned to Rajesh Kumar", icon: "engineer" },
  { time: "9:30 AM", action: "Report reviewed by supervisor", icon: "check" },
  { time: "9:14 AM", action: "Report submitted by Samuel K.", icon: "report" },
];

export default function ReportDetailsScreen() {
  const { colors, isDark, shadows } = useTheme();

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bgBase} />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.borderDefault }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <LumenIcon name="back" size="md" color={colors.textPrimary} strokeWidth={2.5} />
        </Pressable>
        <Text style={[TextStyles.title, { color: colors.textPrimary }]}>Report #R001</Text>
        <Pressable hitSlop={12}>
          <LumenIcon name="share" size="md" color={colors.textSecondary} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero Image Placeholder */}
        <View style={[s.heroImg, { backgroundColor: colors.bgSubtle }]}>
          <LumenIcon name="road" size="2xl" color={colors.textTertiary} strokeWidth={1.5} />
          <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>Issue photo not uploaded</Text>
        </View>

        {/* Title & Status */}
        <View style={s.titleSection}>
          <View style={s.titleRow}>
            <Text style={[TextStyles.title, { color: colors.textPrimary, flex: 1 }]}>
              Large pothole on MG Road near City Bank
            </Text>
          </View>
          <View style={s.tagsRow}>
            <Badge label="In Progress" variant="info" icon="timer" />
            <Badge label="High Priority" variant="error" icon="alert" />
            <Badge label="Road Damage" variant="neutral" icon="road" />
          </View>
        </View>

        {/* Progress Card */}
        <Card variant="elevated" style={s.section}>
          <View style={s.progressHeader}>
            <Text style={[TextStyles.subtitle, { color: colors.textPrimary }]}>Resolution Progress</Text>
            <Text style={[TextStyles.title, { color: colors.brand }]}>65%</Text>
          </View>
          <LinearProgress progress={65} color={colors.brand} height={8} />
          <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
            Estimated completion: Tomorrow by 5 PM
          </Text>
        </Card>

        {/* Timeline */}
        <Card variant="elevated" style={s.section}>
          <Text style={[TextStyles.subtitle, { color: colors.textPrimary, marginBottom: Spacing[4] }]}>Status Timeline</Text>
          {TIMELINE.map((t, i) => (
            <View key={t.step} style={s.timelineRow}>
              <View style={s.timelineLeft}>
                <View style={[s.tlDot, {
                  backgroundColor: t.done ? colors.brand : colors.borderDefault,
                  borderColor: t.done ? colors.brand : colors.borderDefault,
                }]}>
                  {t.done && <LumenIcon name="check" size="xs" color="#FFF" strokeWidth={3} />}
                </View>
                {i < TIMELINE.length - 1 && (
                  <View style={[s.tlLine, { backgroundColor: i < 4 ? colors.brand : colors.borderDefault }]} />
                )}
              </View>
              <View style={s.timelineContent}>
                <Text style={[TextStyles.label, { color: t.done ? colors.textPrimary : colors.textTertiary }]}>{t.step}</Text>
                <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>{t.time}</Text>
                <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>{t.desc}</Text>
                {i < TIMELINE.length - 1 && <View style={{ height: Spacing[4] }} />}
              </View>
            </View>
          ))}
        </Card>

        {/* Engineer Card */}
        <Card variant="elevated" style={s.section}>
          <Text style={[TextStyles.subtitle, { color: colors.textPrimary, marginBottom: Spacing[4] }]}>Assigned Engineer</Text>
          <View style={s.engineerCard}>
            <Avatar name="Rajesh Kumar" size="lg" role="engineer" online />
            <View style={s.engineerInfo}>
              <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary, fontWeight: "700" }]}>Rajesh Kumar</Text>
              <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Senior Field Engineer · Zone B</Text>
              <Badge label="On Site" variant="success" size="sm" dot />
            </View>
            <Pressable style={[s.callBtn, { backgroundColor: colors.successBg }]} accessibilityLabel="Call engineer">
              <LumenIcon name="phone" size="md" color={colors.successText} strokeWidth={2} />
            </Pressable>
          </View>
        </Card>

        {/* Info Grid */}
        <Card variant="elevated" style={s.section}>
          <Text style={[TextStyles.subtitle, { color: colors.textPrimary, marginBottom: Spacing[4] }]}>Details</Text>
          {[
            { label: "Department", value: "City Works & Roads" },
            { label: "Zone", value: "Zone B — Central" },
            { label: "Filed", value: "Today, 9:14 AM" },
            { label: "SLA", value: "48 hours" },
            { label: "Tracking ID", value: "#R001-2024" },
          ].map(({ label, value }) => (
            <View key={label} style={[s.detailRow, { borderBottomColor: colors.borderDefault }]}>
              <Text style={[TextStyles.label, { color: colors.textTertiary, width: 100 }]}>{label}</Text>
              <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary }]}>{value}</Text>
            </View>
          ))}
        </Card>

        {/* Map Location */}
        <Card variant="elevated" padding={0} style={s.section}>
          <View style={[s.mapPreview, { backgroundColor: colors.bgSubtle }]}>
            <LumenIcon name="mapPin" size="xl" color={colors.brand} strokeWidth={2} />
            <Text style={[TextStyles.label, { color: colors.textPrimary }]}>MG Road, Bengaluru</Text>
            <Pressable style={[s.mapLink, { backgroundColor: colors.brandSoft }]}>
              <Text style={[TextStyles.label, { color: colors.brand }]}>Open in Maps</Text>
              <LumenIcon name="external" size="sm" color={colors.brand} strokeWidth={2} />
            </Pressable>
          </View>
        </Card>

        {/* Activity Log */}
        <Card variant="elevated" style={s.section}>
          <Text style={[TextStyles.subtitle, { color: colors.textPrimary, marginBottom: Spacing[4] }]}>Activity Log</Text>
          {ACTIVITY.map((a, i) => (
            <View key={i} style={s.activityRow}>
              <View style={[s.activityIcon, { backgroundColor: colors.bgSubtle }]}>
                <LumenIcon name={a.icon as any} size="sm" color={colors.textSecondary} strokeWidth={2} />
              </View>
              <View style={s.activityInfo}>
                <Text style={[TextStyles.bodySmall, { color: colors.textPrimary }]}>{a.action}</Text>
                <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>{a.time}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={{ height: Spacing[10] }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: Spacing[5], paddingTop: 52, paddingBottom: Spacing[4], borderBottomWidth: 1,
  },
  scroll: { paddingBottom: Spacing[10] },
  heroImg: {
    height: 200, alignItems: "center", justifyContent: "center", gap: Spacing[2],
  },
  titleSection: { padding: Spacing[5], gap: Spacing[3] },
  titleRow: { flexDirection: "row", alignItems: "flex-start" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing[2] },
  section: { marginHorizontal: Spacing[5], marginBottom: Spacing[4] },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing[3] },
  timelineRow: { flexDirection: "row", gap: Spacing[3] },
  timelineLeft: { alignItems: "center" },
  tlDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  tlLine: { width: 2, flex: 1, minHeight: 16 },
  timelineContent: { flex: 1 },
  engineerCard: { flexDirection: "row", alignItems: "center", gap: Spacing[4] },
  engineerInfo: { flex: 1, gap: Spacing[1.5] },
  callBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  detailRow: {
    flexDirection: "row", alignItems: "flex-start", paddingVertical: Spacing[3],
    borderBottomWidth: 1, gap: Spacing[4],
  },
  mapPreview: {
    height: 140, borderRadius: Radius["2xl"],
    alignItems: "center", justifyContent: "center", gap: Spacing[2],
  },
  mapLink: {
    flexDirection: "row", alignItems: "center", gap: Spacing[1.5],
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[2], borderRadius: Radius.full,
    marginTop: Spacing[1],
  },
  activityRow: { flexDirection: "row", gap: Spacing[3], alignItems: "center", marginBottom: Spacing[3] },
  activityIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  activityInfo: { flex: 1, gap: 2 },
});
