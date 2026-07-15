import type { LumenIconName } from "@/design-system";
import { useTheme } from "@/design-system/ThemeContext";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { LinearProgress } from "@/design-system/components/Progress";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Radius, Spacing, TextStyles } from "@/design-system/tokens";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";

const { width: W } = Dimensions.get("window");

const CATEGORIES = [
  { id: "road", icon: "road" as LumenIconName, label: "Road Damage", color: "#F04438" },
  { id: "water", icon: "water" as LumenIconName, label: "Water Leakage", color: "#06B6D4" },
  {
    id: "streetlight",
    icon: "streetlight" as LumenIconName,
    label: "Street Light",
    color: "#F59E0B",
  },
  {
    id: "electricity",
    icon: "electricity" as LumenIconName,
    label: "Electricity",
    color: "#8B5CF6",
  },
  { id: "garbage", icon: "garbage" as LumenIconName, label: "Garbage", color: "#10B981" },
  { id: "fire", icon: "fire" as LumenIconName, label: "Fire Hazard", color: "#EF4444" },
  { id: "bridge", icon: "bridge" as LumenIconName, label: "Bridge/Road", color: "#6366F1" },
  { id: "other", icon: "other" as LumenIconName, label: "Other Issue", color: "#64748B" },
];

const PRIORITIES = [
  { id: "low", label: "Low", desc: "Non-urgent, can wait", color: "#12B76A" },
  { id: "medium", label: "Medium", desc: "Should be fixed soon", color: "#F79009" },
  { id: "high", label: "High", desc: "Urgent & dangerous", color: "#F04438" },
];

const STEPS = ["Category", "Location", "Details", "Submit"];

export default function ReportIssueScreen() {
  const { colors, shadows, isDark } = useTheme();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitted, setSubmitted] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: 20, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
    setStep((s) => s - 1);
  };

  const submit = async () => {
    setSubmitted(true);
    Alert.alert("Success", "Your report has been successfully submitted!");
    await new Promise((r) => setTimeout(r, 1200));
    router.replace("/(citizen)/Dashboard" as any);
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  if (submitted) {
    return (
      <View style={[s.root, s.centered, { backgroundColor: colors.bgBase }]}>
        <View
          style={[
            s.successRing,
            { backgroundColor: colors.successBg, borderColor: colors.successText + "40" },
          ]}
        >
          <LumenIcon name="success" size="2xl" color={colors.successText} strokeWidth={2} />
        </View>
        <Text style={[TextStyles.title, { color: colors.textPrimary, textAlign: "center" }]}>
          Report Submitted!
        </Text>
        <Text style={[TextStyles.body, { color: colors.textSecondary, textAlign: "center" }]}>
          Your issue has been logged and will be reviewed shortly.
        </Text>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.bgBase}
      />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.borderDefault }]}>
        <Pressable onPress={goBack} style={s.backBtn} hitSlop={12}>
          <LumenIcon name="back" size="md" color={colors.textPrimary} strokeWidth={2.5} />
        </Pressable>
        <View style={s.headerMid}>
          <Text style={[TextStyles.label, { color: colors.textSecondary }]}>
            Step {step + 1} of {STEPS.length}
          </Text>
          <Text style={[TextStyles.subtitle, { color: colors.textPrimary }]}>{STEPS[step]}</Text>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <LumenIcon name="close" size="md" color={colors.textTertiary} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Progress */}
      <View style={{ paddingHorizontal: Spacing[5], paddingVertical: Spacing[2] }}>
        <LinearProgress progress={progress} />
      </View>

      {/* Step Labels */}
      <View style={s.stepLabels}>
        {STEPS.map((label, i) => (
          <View key={label} style={s.stepLabel}>
            <View
              style={[
                s.stepDot,
                {
                  backgroundColor: i <= step ? colors.brand : colors.borderDefault,
                  width: i === step ? 20 : 8,
                  borderRadius: i === step ? 4 : 4,
                },
              ]}
            />
            {i < step ? (
              <Text style={[TextStyles.caption, { color: colors.brand }]}>{label}</Text>
            ) : (
              <Text
                style={[
                  TextStyles.caption,
                  { color: i === step ? colors.textPrimary : colors.textTertiary },
                ]}
              >
                {label}
              </Text>
            )}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          {/* ── Step 0: Category ── */}
          {step === 0 && (
            <View style={s.stepContent}>
              <Text style={[TextStyles.heading2, { color: colors.textPrimary }]}>
                What's the issue?
              </Text>
              <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
                Select the category that best describes the problem.
              </Text>
              <View style={s.catGrid}>
                {CATEGORIES.map((cat) => {
                  const selected = category === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      style={({ pressed }) => [
                        s.catCard,
                        {
                          backgroundColor: selected ? cat.color + "15" : colors.bgSurface,
                          borderColor: selected ? cat.color : colors.borderDefault,
                          ...shadows.sm,
                          transform: pressed ? [{ scale: 0.96 }] : [],
                        },
                      ]}
                      onPress={() => setCategory(cat.id)}
                      accessibilityLabel={cat.label}
                    >
                      <View style={[s.catIconWrap, { backgroundColor: cat.color + "15" }]}>
                        <LumenIcon name={cat.icon} size="lg" color={cat.color} strokeWidth={2} />
                      </View>
                      <Text
                        style={[
                          TextStyles.bodySmall,
                          { color: colors.textPrimary, fontWeight: "600", textAlign: "center" },
                        ]}
                      >
                        {cat.label}
                      </Text>
                      {selected && (
                        <View style={[s.catCheck, { backgroundColor: cat.color }]}>
                          <LumenIcon name="check" size="xs" color="#FFF" strokeWidth={3} />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── Step 1: Location ── */}
          {step === 1 && (
            <View style={s.stepContent}>
              <Text style={[TextStyles.heading2, { color: colors.textPrimary }]}>Where is it?</Text>
              <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
                Select your location or enter an address.
              </Text>
              {/* Map placeholder */}
              <View
                style={[
                  s.mapBox,
                  { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault },
                ]}
              >
                <View
                  style={[
                    s.mapCenter,
                    { backgroundColor: colors.brand + "20", borderColor: colors.brand },
                  ]}
                >
                  <LumenIcon name="locate" size="xl" color={colors.brand} strokeWidth={2} />
                </View>
                <Pressable style={[s.locateBtn, { backgroundColor: colors.brand }]}>
                  <LumenIcon name="locate" size="sm" color="#FFF" strokeWidth={2.5} />
                  <Text style={[TextStyles.label, { color: "#FFF" }]}>Use My Location</Text>
                </Pressable>
              </View>
              <Input
                label="Street Address"
                placeholder="e.g. 123 MG Road, Bangalore"
                iconLeft="mapPin"
              />
              <Input label="Landmark (optional)" placeholder="e.g. Near City Bank" iconLeft="map" />
            </View>
          )}

          {/* ── Step 2: Details ── */}
          {step === 2 && (
            <View style={s.stepContent}>
              <Text style={[TextStyles.heading2, { color: colors.textPrimary }]}>
                Describe the issue
              </Text>
              <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
                Add details to help engineers resolve it faster.
              </Text>
              <Input
                label="Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the problem in detail…"
                multiline
                numberOfLines={5}
                style={{ height: 120, paddingTop: 14 } as any}
              />
              {/* Photo Upload */}
              <View style={s.fieldGroup}>
                <Text style={[TextStyles.label, { color: colors.textSecondary }]}>
                  Photos (optional)
                </Text>
                <Pressable
                  style={[
                    s.photoUpload,
                    { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault },
                  ]}
                >
                  <LumenIcon
                    name="camera"
                    size="xl"
                    color={colors.textTertiary}
                    strokeWidth={1.5}
                  />
                  <Text style={[TextStyles.body, { color: colors.textTertiary }]}>
                    Tap to add photos
                  </Text>
                  <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
                    JPG, PNG · Max 10MB
                  </Text>
                </Pressable>
              </View>
              {/* Priority */}
              <View style={s.fieldGroup}>
                <Text style={[TextStyles.label, { color: colors.textSecondary }]}>
                  Priority Level
                </Text>
                <View style={s.priorityRow}>
                  {PRIORITIES.map((p) => (
                    <Pressable
                      key={p.id}
                      style={[
                        s.priorityBtn,
                        {
                          backgroundColor: priority === p.id ? p.color + "15" : colors.bgSubtle,
                          borderColor: priority === p.id ? p.color : colors.borderDefault,
                        },
                      ]}
                      onPress={() => setPriority(p.id)}
                    >
                      <View style={[s.priorityDot, { backgroundColor: p.color }]} />
                      <View>
                        <Text
                          style={[
                            TextStyles.label,
                            { color: priority === p.id ? p.color : colors.textPrimary },
                          ]}
                        >
                          {p.label}
                        </Text>
                        <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
                          {p.desc}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ── Step 3: Review & Submit ── */}
          {step === 3 && (
            <View style={s.stepContent}>
              <Text style={[TextStyles.heading2, { color: colors.textPrimary }]}>
                Review & Submit
              </Text>
              <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
                Confirm the details before submitting.
              </Text>
              <View
                style={[
                  s.reviewCard,
                  {
                    backgroundColor: colors.bgSurface,
                    borderColor: colors.borderDefault,
                    ...shadows.md,
                  },
                ]}
              >
                {[
                  {
                    label: "Category",
                    value: CATEGORIES.find((c) => c.id === category)?.label ?? "—",
                  },
                  { label: "Location", value: "MG Road, Bangalore (auto-detected)" },
                  {
                    label: "Priority",
                    value: PRIORITIES.find((p) => p.id === priority)?.label ?? "—",
                  },
                  { label: "Description", value: description || "—" },
                ].map(({ label, value }) => (
                  <View
                    key={label}
                    style={[s.reviewRow, { borderBottomColor: colors.borderDefault }]}
                  >
                    <Text style={[TextStyles.label, { color: colors.textTertiary, width: 90 }]}>
                      {label}
                    </Text>
                    <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Footer CTA */}
      <View
        style={[s.footer, { borderTopColor: colors.borderDefault, backgroundColor: colors.bgBase }]}
      >
        {step < STEPS.length - 1 ? (
          <Button
            label="Continue"
            variant="primary"
            size="lg"
            fullWidth
            iconRight="forward"
            onPress={goNext}
            disabled={step === 0 && !category}
          />
        ) : (
          <Button
            label="Submit Report"
            variant="primary"
            size="lg"
            fullWidth
            iconRight="success"
            onPress={submit}
          />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[5],
    padding: Spacing[8],
  },
  successRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing[5],
    paddingTop: 52,
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerMid: { flex: 1, alignItems: "center" },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    gap: Spacing[1],
  },
  stepLabel: { alignItems: "center", gap: 4, flex: 1 },
  stepDot: { height: 8, borderRadius: 4 },
  scroll: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },
  stepContent: { gap: Spacing[6], paddingTop: Spacing[5] },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing[3] },
  catCard: {
    width: (W - Spacing[5] * 2 - Spacing[3] * 3) / 4,
    alignItems: "center",
    padding: Spacing[3],
    borderRadius: Radius["2xl"],
    borderWidth: 1.5,
    gap: Spacing[2],
    position: "relative",
  },
  catIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  catCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  mapBox: {
    height: 200,
    borderRadius: Radius["2xl"],
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  mapCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  locateBtn: {
    position: "absolute",
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
    borderRadius: Radius.full,
  },
  fieldGroup: { gap: Spacing[2] },
  photoUpload: {
    height: 120,
    borderRadius: Radius["2xl"],
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[2],
  },
  priorityRow: { gap: Spacing[3] },
  priorityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
    padding: Spacing[4],
    borderRadius: Radius["2xl"],
    borderWidth: 1.5,
  },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  reviewCard: { borderRadius: Radius["2xl"], borderWidth: 1, overflow: "hidden" },
  reviewRow: {
    flexDirection: "row",
    gap: Spacing[4],
    padding: Spacing[4],
    borderBottomWidth: 1,
    alignItems: "flex-start",
  },
  footer: {
    padding: Spacing[5],
    borderTopWidth: 1,
    paddingBottom: 100,
  },
});
