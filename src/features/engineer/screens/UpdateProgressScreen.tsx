// ============================================================
// LUMEN — Update Progress Screen (Engineer)
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
import { Input } from "@/design-system/components/Input";
import { Button } from "@/design-system/components/Button";
import { LinearProgress } from "@/design-system/components/Progress";
import { Badge } from "@/design-system/components/Badge";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";

const STATUSES = [
  { id: "started", label: "Started", icon: "⚡", color: "#208AEF" },
  { id: "materials", label: "Materials Collected", icon: "📦", color: "#7C3AED" },
  { id: "in_progress", label: "In Progress", icon: "🔧", color: "#F79009" },
  { id: "awaiting", label: "Awaiting Parts", icon: "⏳", color: "#64748B" },
  { id: "done", label: "Completed", icon: "✅", color: "#12B76A" },
];

const CHECKLIST = [
  "Safety cones placed",
  "Tools inspected and ready",
  "Site photo taken",
  "Road surface assessed",
  "Team notified",
];

export default function UpdateProgressScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [progress, setProgress] = useState(65);
  const [status, setStatus] = useState("in_progress");
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true, 3: false, 4: false });
  const [submitted, setSubmitted] = useState(false);

  const toggleCheck = (i: number) => setChecklist(c => ({ ...c, [i]: !c[i] }));
  const checkedCount = Object.values(checklist).filter(Boolean).length;

  const submit = async () => {
    setSubmitted(true);
    await new Promise(r => setTimeout(r, 900));
    router.back();
  };

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bgBase} />

      <View style={[s.header, { borderBottomColor: colors.borderDefault }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <LumenIcon name="back" size="md" color={colors.textPrimary} strokeWidth={2.5} />
        </Pressable>
        <Text style={[TextStyles.title, { color: colors.textPrimary }]}>Update Progress</Text>
        <Badge label="T001" variant="brand" size="sm" />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Task Summary */}
        <Card variant="flat" style={s.taskSummary}>
          <View style={s.summaryRow}>
            <View style={[s.taskIcon, { backgroundColor: "#F04438" + "15" }]}>
              <LumenIcon name="road" size="md" color="#F04438" strokeWidth={2} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary }]}>Repair large pothole on MG Road</Text>
              <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>123 MG Road, Bangalore · High Priority</Text>
            </View>
          </View>
        </Card>

        {/* Progress Slider */}
        <Card variant="elevated" style={s.section}>
          <View style={s.progressHeader}>
            <Text style={[TextStyles.subtitle, { color: colors.textPrimary }]}>Completion Progress</Text>
            <Text style={[TextStyles.heading2, { color: colors.brand }]}>{progress}%</Text>
          </View>
          <LinearProgress progress={progress} color={colors.brand} height={10} />
          {/* Manual slider steps */}
          <View style={s.sliderSteps}>
            {[0, 25, 50, 75, 100].map(v => (
              <Pressable
                key={v}
                style={[s.sliderStep, { backgroundColor: progress >= v ? colors.brand : colors.bgSubtle, borderColor: colors.borderDefault }]}
                onPress={() => setProgress(v)}
              >
                <Text style={[TextStyles.caption, { color: progress >= v ? "#FFF" : colors.textTertiary, fontWeight: "700" }]}>{v}%</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Status Picker */}
        <Card variant="elevated" style={s.section}>
          <Text style={[TextStyles.subtitle, { color: colors.textPrimary, marginBottom: Spacing[4] }]}>Current Status</Text>
          <View style={s.statusGrid}>
            {STATUSES.map(st => (
              <Pressable
                key={st.id}
                style={[
                  s.statusBtn,
                  {
                    backgroundColor: status === st.id ? st.color + "15" : colors.bgSubtle,
                    borderColor: status === st.id ? st.color : colors.borderDefault,
                  },
                ]}
                onPress={() => setStatus(st.id)}
              >
                <Text style={{ fontSize: 20 }}>{st.icon}</Text>
                <Text style={[TextStyles.bodySmall, { color: status === st.id ? st.color : colors.textSecondary, fontWeight: "600", textAlign: "center" }]}>
                  {st.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Notes */}
        <Card variant="elevated" style={s.section}>
          <Text style={[TextStyles.subtitle, { color: colors.textPrimary, marginBottom: Spacing[4] }]}>Field Notes</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Describe current situation, materials used, issues encountered…"
            multiline
            numberOfLines={4}
            style={{ height: 100 } as any}
          />
        </Card>

        {/* Checklist */}
        <Card variant="elevated" style={s.section}>
          <View style={s.progressHeader}>
            <Text style={[TextStyles.subtitle, { color: colors.textPrimary }]}>Safety Checklist</Text>
            <Text style={[TextStyles.label, { color: colors.brand }]}>{checkedCount}/{CHECKLIST.length}</Text>
          </View>
          <LinearProgress progress={(checkedCount / CHECKLIST.length) * 100} color="#12B76A" height={5} />
          <View style={{ marginTop: Spacing[4], gap: Spacing[3] }}>
            {CHECKLIST.map((item, i) => (
              <Pressable key={i} style={s.checkRow} onPress={() => toggleCheck(i)}>
                <View style={[s.checkbox, {
                  backgroundColor: checklist[i] ? "#12B76A" : "transparent",
                  borderColor: checklist[i] ? "#12B76A" : colors.borderDefault,
                }]}>
                  {checklist[i] && <LumenIcon name="check" size="xs" color="#FFF" strokeWidth={3} />}
                </View>
                <Text style={[TextStyles.body, { color: checklist[i] ? colors.textSecondary : colors.textPrimary, textDecorationLine: checklist[i] ? "line-through" : "none" }]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Button
          label={submitted ? "Saving…" : "Save Progress Update"}
          variant="primary"
          size="lg"
          fullWidth
          loading={submitted}
          onPress={submit}
          iconRight="success"
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
  taskSummary: { marginBottom: 0 },
  summaryRow: { flexDirection: "row", gap: Spacing[3], alignItems: "center" },
  taskIcon: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },
  section: { gap: 0 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing[3] },
  sliderSteps: { flexDirection: "row", gap: Spacing[2], marginTop: Spacing[4] },
  sliderStep: {
    flex: 1, height: 32, borderRadius: Radius.lg, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing[3] },
  statusBtn: {
    width: "30%", alignItems: "center", paddingVertical: Spacing[3],
    borderRadius: Radius["2xl"], borderWidth: 1.5, gap: Spacing[1.5],
  },
  checkRow: { flexDirection: "row", alignItems: "center", gap: Spacing[3] },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
});
