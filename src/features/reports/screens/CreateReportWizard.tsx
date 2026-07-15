import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView, AnimatePresence } from "moti";
import { useTheme, LumenIcon, Spacing, TextStyles } from "@/design-system";
import { router } from "expo-router";

// Wizard Steps
import {
  StepIssueType,
  StepAiSuggestion,
  StepLocation,
  StepMedia,
  StepDescription,
  StepPriority,
  StepReview,
} from "../components/wizard";

export type WizardData = {
  issueType: string;
  aiSuggestedCategory: string;
  location: { latitude: number; longitude: number; address: string } | null;
  media: { uri: string; type: "image" | "video" }[];
  description: { written: string; voiceUrl?: string };
  priority: "low" | "medium" | "high" | "critical";
};

const TOTAL_STEPS = 7;

export default function CreateReportWizard() {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    issueType: "",
    aiSuggestedCategory: "",
    location: null,
    media: [],
    description: { written: "" },
    priority: "medium",
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    // Backend API integration here
    console.log("Submitting:", data);
    Alert.alert(
      "Success",
      "Your report has been successfully submitted! We will notify you of any updates.",
      [{ text: "OK", onPress: () => router.replace("/(citizen)/Dashboard") }]
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepIssueType data={data} updateData={updateData} onNext={nextStep} />;
      case 2:
        return <StepAiSuggestion data={data} updateData={updateData} onNext={nextStep} />;
      case 3:
        return <StepLocation data={data} updateData={updateData} onNext={nextStep} />;
      case 4:
        return <StepMedia data={data} updateData={updateData} onNext={nextStep} />;
      case 5:
        return <StepDescription data={data} updateData={updateData} onNext={nextStep} />;
      case 6:
        return <StepPriority data={data} updateData={updateData} onNext={nextStep} />;
      case 7:
        return <StepReview data={data} onSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  const progress = currentStep / TOTAL_STEPS;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bgBase }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: Spacing[5], paddingVertical: Spacing[4] }]}>
        <TouchableOpacity
          onPress={() => (currentStep === 1 ? router.back() : prevStep())}
          style={[styles.backButton, { backgroundColor: colors.bgSurface }]}
        >
          <LumenIcon name="chevronLeft" size="md" color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[TextStyles.title, { color: colors.textPrimary }]}>
          {currentStep === TOTAL_STEPS
            ? "Review & Submit"
            : `Step ${currentStep} of ${TOTAL_STEPS}`}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View
        style={[
          styles.progressContainer,
          {
            backgroundColor: colors.bgSurface,
            marginHorizontal: Spacing[5],
            marginBottom: Spacing[5],
          },
        ]}
      >
        <MotiView
          style={[styles.progressBar, { backgroundColor: colors.brand }]}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "timing", duration: 300 }}
        />
      </View>

      {/* Form Content */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AnimatePresence exitBeforeEnter>
          <MotiView
            key={`step-${currentStep}`}
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -20 }}
            transition={{ type: "timing", duration: 300 }}
            style={styles.stepContainer}
          >
            {renderStep()}
          </MotiView>
        </AnimatePresence>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingBottom: 100, // Make room for absolute BottomNavigation
  },
  stepContainer: {
    flex: 1,
  },
});
