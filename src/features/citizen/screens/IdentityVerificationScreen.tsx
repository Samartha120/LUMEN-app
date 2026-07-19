import { useTheme } from "@/design-system/ThemeContext";
import { Button } from "@/design-system/components/Button";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Radius, Spacing, TextStyles } from "@/design-system/tokens";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/AuthStore";
import { api } from "@/services/api/client";

export default function IdentityVerificationScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore((s) => s);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"UNVERIFIED" | "PENDING" | "VERIFIED">(
    ((user as any)?.verificationStatus) || "UNVERIFIED"
  );

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Mocking the document upload for Phase 2 demonstration
      await api.post("/citizen/verify-identity", {
        documentType: "PASSPORT",
        documents: { mockUrl: "https://mock.com/doc.jpg" },
      });
      setStatus("VERIFIED");
      Alert.alert("Success", "Identity verified successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to verify identity");
    } finally {
      setSubmitting(false);
    }
  };

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bgBase, padding: Spacing[6] },
    header: { marginBottom: Spacing[8], alignItems: "center" },
    title: { ...TextStyles.heading2, color: colors.textPrimary, marginTop: Spacing[4] },
    subtitle: {
      ...TextStyles.body,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: Spacing[2],
    },
    card: {
      backgroundColor: colors.bgSurfaceRaised,
      borderRadius: Radius.lg,
      padding: Spacing[6],
      borderWidth: 1,
      borderColor: colors.borderDefault,
      alignItems: "center",
      marginBottom: Spacing[8],
    },
    statusText: {
      ...TextStyles.title,
      color: colors.textPrimary,
      marginTop: Spacing[4],
    },
    buttonContainer: { marginTop: "auto" },
  });

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: status === "VERIFIED" ? colors.successBg : colors.brandSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LumenIcon
            name={status === "VERIFIED" ? "success" : "profile"}
            color={status === "VERIFIED" ? colors.successText : colors.textBrand}
            size="xl"
          />
        </View>
        <Text style={s.title}>Identity Verification</Text>
        <Text style={s.subtitle}>
          Verify your identity to unlock advanced civic features and ensure trust in the community.
        </Text>
      </View>

      <View style={s.card}>
        <LumenIcon
          name="info"
          color={
            status === "VERIFIED"
              ? colors.successText
              : status === "PENDING"
              ? colors.warningText
              : colors.textSecondary
          }
          size="2xl"
        />
        <Text style={s.statusText}>
          Status: {status}
        </Text>
        {status === "UNVERIFIED" && (
          <Text style={[s.subtitle, { marginTop: Spacing[4] }]}>
            Upload a valid government ID to get verified.
          </Text>
        )}
      </View>

      <View style={s.buttonContainer}>
        {status === "UNVERIFIED" && (
          <Button
            label="Upload Documents"
            onPress={handleSubmit}
            loading={submitting}
            variant="primary"
          />
        )}
        <View style={{ marginTop: Spacing[4] }}>
          <Button label="Back to Dashboard" onPress={() => router.back()} variant="outline" />
        </View>
      </View>
    </SafeAreaView>
  );
}
