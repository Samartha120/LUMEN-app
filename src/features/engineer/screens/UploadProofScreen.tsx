// ============================================================
// LUMEN — Upload Proof Screen (Engineer)
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

export default function UploadProofScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [beforeCaptured, setBeforeCaptured] = useState(false);
  const [afterCaptured, setAfterCaptured] = useState(false);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const simulateUpload = async () => {
    setUploading(true);
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(r => setTimeout(r, 80));
    }
    setUploading(false);
    router.back();
  };

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bgBase} />

      <View style={[s.header, { borderBottomColor: colors.borderDefault }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <LumenIcon name="back" size="md" color={colors.textPrimary} strokeWidth={2.5} />
        </Pressable>
        <Text style={[TextStyles.title, { color: colors.textPrimary }]}>Upload Proof</Text>
        <Badge label="Required" variant="error" size="sm" />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Instructions */}
        <Card variant="flat" style={s.infoCard}>
          <View style={s.infoRow}>
            <LumenIcon name="info" size="md" color={colors.brand} strokeWidth={2} />
            <Text style={[TextStyles.bodySmall, { color: colors.textSecondary, flex: 1 }]}>
              Upload a before and after photo to complete task verification. Both photos are required.
            </Text>
          </View>
        </Card>

        {/* Before / After Photo Slots */}
        <View style={s.photoGrid}>
          {[
            { label: "Before", captured: beforeCaptured, onCapture: () => setBeforeCaptured(true), color: "#F04438" },
            { label: "After", captured: afterCaptured, onCapture: () => setAfterCaptured(true), color: "#12B76A" },
          ].map(slot => (
            <Pressable
              key={slot.label}
              style={[
                s.photoSlot,
                {
                  backgroundColor: slot.captured ? slot.color + "10" : colors.bgSubtle,
                  borderColor: slot.captured ? slot.color : colors.borderDefault,
                  borderStyle: slot.captured ? "solid" : "dashed",
                },
              ]}
              onPress={slot.onCapture}
            >
              {slot.captured ? (
                <View style={s.capturedOverlay}>
                  <View style={[s.capturedIcon, { backgroundColor: slot.color + "20" }]}>
                    <LumenIcon name="success" size="xl" color={slot.color} strokeWidth={2} />
                  </View>
                  <Text style={[TextStyles.label, { color: slot.color }]}>Captured</Text>
                  <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>Tap to retake</Text>
                </View>
              ) : (
                <>
                  <View style={[s.cameraIcon, { backgroundColor: colors.bgSubtle }]}>
                    <LumenIcon name="camera" size="xl" color={colors.textTertiary} strokeWidth={1.5} />
                  </View>
                  <Text style={[TextStyles.label, { color: colors.textPrimary }]}>{slot.label} Photo</Text>
                  <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>Tap to capture</Text>
                </>
              )}
            </Pressable>
          ))}
        </View>

        {/* Comparison Preview */}
        {beforeCaptured && afterCaptured && (
          <Card variant="elevated" style={s.comparisonCard}>
            <View style={s.comparisonHeader}>
              <LumenIcon name="success" size="md" color={colors.successText} strokeWidth={2} />
              <Text style={[TextStyles.label, { color: colors.successText }]}>Both photos captured! Ready to upload.</Text>
            </View>
            <View style={s.comparisonRow}>
              {["Before", "After"].map((label, i) => (
                <View key={label} style={[s.comparisonItem, { backgroundColor: colors.bgSubtle }]}>
                  <LumenIcon name="image" size="lg" color={colors.textTertiary} strokeWidth={1.5} />
                  <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>{label}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Caption */}
        <Input
          label="Caption (optional)"
          value={caption}
          onChangeText={setCaption}
          placeholder="Describe what was done, materials used, etc."
          multiline
          numberOfLines={3}
          style={{ height: 80 } as any}
        />

        {/* Upload Progress */}
        {uploading && (
          <Card variant="flat" style={s.uploadProgress}>
            <View style={s.uploadHeader}>
              <LumenIcon name="upload" size="sm" color={colors.brand} strokeWidth={2} />
              <Text style={[TextStyles.label, { color: colors.textPrimary }]}>Uploading…</Text>
              <Text style={[TextStyles.label, { color: colors.brand }]}>{uploadProgress}%</Text>
            </View>
            <LinearProgress progress={uploadProgress} color={colors.brand} height={6} />
          </Card>
        )}

        {/* Submit */}
        <Button
          label={uploading ? "Uploading…" : "Upload Proof"}
          variant="primary"
          size="lg"
          fullWidth
          loading={uploading}
          iconLeft="upload"
          disabled={!beforeCaptured || !afterCaptured}
          onPress={simulateUpload}
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
  infoCard: { flexDirection: "row" },
  infoRow: { flexDirection: "row", gap: Spacing[3], alignItems: "flex-start" },
  photoGrid: { flexDirection: "row", gap: Spacing[4] },
  photoSlot: {
    flex: 1, height: 180, borderRadius: Radius["2xl"], borderWidth: 2,
    alignItems: "center", justifyContent: "center", gap: Spacing[2],
  },
  capturedOverlay: { alignItems: "center", gap: Spacing[2] },
  capturedIcon: { width: 56, height: 56, borderRadius: Radius.xl, alignItems: "center", justifyContent: "center" },
  cameraIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  comparisonCard: { gap: Spacing[4] },
  comparisonHeader: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
  comparisonRow: { flexDirection: "row", gap: Spacing[3] },
  comparisonItem: {
    flex: 1, height: 100, borderRadius: Radius.xl,
    alignItems: "center", justifyContent: "center", gap: Spacing[2],
  },
  uploadProgress: { gap: Spacing[3] },
  uploadHeader: { flexDirection: "row", alignItems: "center", gap: Spacing[3] },
});
