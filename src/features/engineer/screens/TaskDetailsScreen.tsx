// ============================================================
// LUMEN — Task Details Screen (Engineer)
// Phase 4: Engineer Experience
// ============================================================
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Card } from "@/design-system/components/Card";
import { Badge } from "@/design-system/components/Badge";
import { Avatar } from "@/design-system/components/Avatar";
import { Button } from "@/design-system/components/Button";
import { LinearProgress } from "@/design-system/components/Progress";
import { StatusBanner } from "@/design-system/components/Extras";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";

const CHECKLIST_ITEMS = [
  { label: "Safety cones placed around site", done: true },
  { label: "Inspect damage extent and depth", done: true },
  { label: "Prepare bitumen mix and tools", done: false },
  { label: "Fill and compact pothole", done: false },
  { label: "Level surface with surrounding road", done: false },
  { label: "Photograph completed repair", done: false },
];

export default function TaskDetailsScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [checklist, setChecklist] = useState(CHECKLIST_ITEMS);
  const checkedCount = checklist.filter(c => c.done).length;

  const toggleItem = (i: number) => {
    setChecklist(cl => cl.map((c, idx) => idx === i ? { ...c, done: !c.done } : c));
  };

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bgBase} />

      <View style={[s.header, { borderBottomColor: colors.borderDefault }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <LumenIcon name="back" size="md" color={colors.textPrimary} strokeWidth={2.5} />
        </Pressable>
        <Text style={[TextStyles.title, { color: colors.textPrimary }]}>Task Details</Text>
        <Badge label="#T001" variant="brand" size="sm" />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Alert */}
        <StatusBanner variant="warning" title="High Priority Task" message="Complete within 6 hours of assignment." />

        {/* Header Info */}
        <Card variant="elevated" style={s.section}>
          <View style={s.taskHeader}>
            <View style={[s.taskIcon, { backgroundColor: "#F04438" + "15" }]}>
              <LumenIcon name="road" size="lg" color="#F04438" strokeWidth={2} />
            </View>
            <View style={{ flex: 1, gap: Spacing[1.5] }}>
              <Text style={[TextStyles.title, { color: colors.textPrimary }]}>Repair large pothole</Text>
              <View style={s.metaRow}>
                <LumenIcon name="mapPin" size="xs" color={colors.textTertiary} strokeWidth={2} />
                <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>123 MG Road, Bangalore</Text>
              </View>
              <View style={s.tagsRow}>
                <Badge label="In Progress" variant="info" size="sm" dot />
                <Badge label="High Priority" variant="error" size="sm" />
                <Badge label="Road Damage" variant="neutral" size="sm" />
              </View>
            </View>
          </View>

          {/* Progress */}
          <View style={[s.progressSection, { borderTopColor: colors.borderDefault }]}>
            <View style={s.progressHeader}>
              <Text style={[TextStyles.label, { color: colors.textSecondary }]}>Task Completion</Text>
              <Text style={[TextStyles.label, { color: colors.brand }]}>65%</Text>
            </View>
            <LinearProgress progress={65} color={colors.brand} height={8} />
          </View>
        </Card>

        {/* Details Grid */}
        <Card variant="elevated" style={s.section}>
          <Text style={[TextStyles.subtitle, { color: colors.textPrimary, marginBottom: Spacing[4] }]}>Task Info</Text>
          {[
            { label: "Assigned", value: "Today, 9:00 AM", icon: "calendar" },
            { label: "SLA Deadline", value: "Today, 3:00 PM", icon: "clock" },
            { label: "Department", value: "City Works & Roads", icon: "building" },
            { label: "Zone", value: "Zone B — Central", icon: "mapPin" },
            { label: "Citizen Report", value: "#R001 — Samuel K.", icon: "report" },
          ].map(({ label, value, icon }) => (
            <View key={label} style={[s.detailRow, { borderBottomColor: colors.borderDefault }]}>
              <LumenIcon name={icon as any} size="sm" color={colors.textTertiary} strokeWidth={2} />
              <Text style={[TextStyles.label, { color: colors.textTertiary, width: 90 }]}>{label}</Text>
              <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>{value}</Text>
            </View>
          ))}
        </Card>

        {/* Checklist */}
        <Card variant="elevated" style={s.section}>
          <View style={s.progressHeader}>
            <Text style={[TextStyles.subtitle, { color: colors.textPrimary }]}>Work Checklist</Text>
            <Text style={[TextStyles.label, { color: colors.brand }]}>{checkedCount}/{checklist.length}</Text>
          </View>
          <LinearProgress progress={(checkedCount / checklist.length) * 100} color="#12B76A" height={5} />
          <View style={{ marginTop: Spacing[4], gap: Spacing[3] }}>
            {checklist.map((item, i) => (
              <Pressable key={i} style={s.checkRow} onPress={() => toggleItem(i)}>
                <View style={[s.checkbox, {
                  backgroundColor: item.done ? "#12B76A" : "transparent",
                  borderColor: item.done ? "#12B76A" : colors.borderDefault,
                }]}>
                  {item.done && <LumenIcon name="check" size="xs" color="#FFF" strokeWidth={3} />}
                </View>
                <Text style={[TextStyles.body, {
                  color: item.done ? colors.textTertiary : colors.textPrimary,
                  textDecorationLine: item.done ? "line-through" : "none",
                  flex: 1,
                }]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Supervisor Contact */}
        <Card variant="elevated" style={s.section}>
          <Text style={[TextStyles.subtitle, { color: colors.textPrimary, marginBottom: Spacing[4] }]}>Supervisor</Text>
          <View style={s.supervisorRow}>
            <Avatar name="Anil Sharma" size="md" role="admin" />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary, fontWeight: "700" }]}>Anil Sharma</Text>
              <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Zone B Supervisor · Available</Text>
            </View>
            <Pressable style={[s.callBtn, { backgroundColor: colors.successBg }]} accessibilityLabel="Call supervisor">
              <LumenIcon name="phone" size="md" color={colors.successText} strokeWidth={2} />
            </Pressable>
            <Pressable style={[s.callBtn, { backgroundColor: colors.brandSoft }]} accessibilityLabel="Message supervisor">
              <LumenIcon name="comment" size="md" color={colors.brand} strokeWidth={2} />
            </Pressable>
          </View>
        </Card>

        {/* Actions */}
        <View style={s.actionsRow}>
          <Button
            label="Navigate"
            variant="secondary"
            size="md"
            iconLeft="navigate2"
            onPress={() => router.push("/(engineer)/Navigation" as any)}
          />
          <Button
            label="Update Progress"
            variant="primary"
            size="md"
            iconLeft="tools"
            onPress={() => router.push("/(engineer)/Update-progress" as any)}
          />
        </View>

        <Button
          label="Upload Proof of Completion"
          variant="ghost"
          size="md"
          fullWidth
          iconLeft="upload"
          onPress={() => router.push("/(engineer)/Upload-proof" as any)}
        />

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
  scroll: { padding: Spacing[5], gap: Spacing[4] },
  section: { gap: 0 },
  taskHeader: { flexDirection: "row", gap: Spacing[4], alignItems: "flex-start" },
  taskIcon: { width: 52, height: 52, borderRadius: Radius.xl, alignItems: "center", justifyContent: "center" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing[2] },
  progressSection: { marginTop: Spacing[4], paddingTop: Spacing[4], borderTopWidth: 1, gap: Spacing[2] },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing[2] },
  detailRow: {
    flexDirection: "row", alignItems: "center", gap: Spacing[3],
    paddingVertical: Spacing[3], borderBottomWidth: 1,
  },
  checkRow: { flexDirection: "row", alignItems: "center", gap: Spacing[3] },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  supervisorRow: { flexDirection: "row", alignItems: "center", gap: Spacing[3] },
  callBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  actionsRow: { flexDirection: "row", gap: Spacing[3] },
});
