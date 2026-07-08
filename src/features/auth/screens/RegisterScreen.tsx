import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnimatePresence, MotiView } from "moti";
import { useTheme } from "@/design-system/ThemeContext";
import { Radius, Spacing, TextStyles } from "@/design-system/tokens";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { PasswordStrengthMeter } from "@/design-system/components/PasswordStrengthMeter";
import { AnimatedRoleCard } from "@/design-system/components/AnimatedRoleCard";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { AuthService } from "@/services/auth.service";
import * as Haptics from "expo-haptics";

// --- Validation Schemas ---
const stepSchemas = [
  z.object({ role: z.enum(["citizen", "engineer"]) }),
  z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    phone: z.string().min(10, "Valid phone number required"),
  }),
  z.object({
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    pincode: z.string().min(4, "Pincode is required"),
  }),
  z
    .object({
      email: z.string().email("Invalid email address"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Requires an uppercase letter")
        .regex(/[a-z]/, "Requires a lowercase letter")
        .regex(/[0-9]/, "Requires a number")
        .regex(/[^A-Za-z0-9]/, "Requires a special character"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }),
  z.object({
    bio: z.string().optional(),
    department: z.string().optional(), // Only for engineer
  }),
  z.object({
    theme: z.enum(["light", "dark", "system"]),
    language: z.string(),
  }),
  z.object({
    locationPerm: z.boolean(),
    cameraPerm: z.boolean(),
    notificationPerm: z.boolean(),
  }),
];

const registerSchema = z
  .object({
    role: z.enum(["citizen", "engineer"]),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    phone: z.string().min(10, "Valid phone number required"),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    pincode: z.string().min(4, "Pincode is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Requires an uppercase letter")
      .regex(/[a-z]/, "Requires a lowercase letter")
      .regex(/[0-9]/, "Requires a number")
      .regex(/[^A-Za-z0-9]/, "Requires a special character"),
    confirmPassword: z.string(),
    bio: z.string().optional(),
    department: z.string().optional(),
    theme: z.enum(["light", "dark", "system"]),
    language: z.string(),
    locationPerm: z.boolean(),
    cameraPerm: z.boolean(),
    notificationPerm: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const TOTAL_STEPS = 8;

export function RegisterScreen() {
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Determine current schema for partial validation
  const currentSchema = stepSchemas[step] || z.object({});

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: step < 7 ? zodResolver(currentSchema as any) : zodResolver(registerSchema as any),
    mode: "onChange",
    defaultValues: {
      role: "citizen",
      theme: "system",
      language: "en",
      locationPerm: false,
      cameraPerm: false,
      notificationPerm: false,
    },
  });

  const formData = watch();

  const nextStep = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isStepValid = await trigger();
    if (isStepValid) {
      setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    }
  };

  const prevStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      // 1. Create account via Auth Service (Supabase)
      // await AuthService.signUp(data.email, data.password);

      // 2. Save complete profile initialization
      await AuthService.saveUserProfile(data);

      // 3. Show success animation then navigate
      // Navigation is handled in authStore listener usually, but we can force it:
      router.replace(
        data.role === "citizen" ? ("/(citizen)/Dashboard" as any) : ("/(engineer)/Dashboard" as any)
      );
    } catch (err) {
      console.error(err);
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0: // Role
        return (
          <View style={s.stepContainer}>
            <Text
              style={[TextStyles.heading2, { color: colors.textPrimary, marginBottom: Spacing[6] }]}
            >
              How will you use LUMEN?
            </Text>
            <Controller
              control={control}
              name="role"
              render={({ field: { onChange, value } }) => (
                <>
                  <AnimatedRoleCard
                    role="citizen"
                    selected={value === "citizen"}
                    onSelect={() => onChange("citizen")}
                  />
                  <AnimatedRoleCard
                    role="engineer"
                    selected={value === "engineer"}
                    onSelect={() => onChange("engineer")}
                  />
                </>
              )}
            />
          </View>
        );
      case 1: // Personal
        return (
          <View style={s.stepContainer}>
            <Text
              style={[TextStyles.heading2, { color: colors.textPrimary, marginBottom: Spacing[6] }]}
            >
              Personal Information
            </Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={value}
                  onChangeText={onChange}
                  error={errors.fullName?.message}
                  iconLeft="profile"
                />
              )}
            />
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Username"
                  placeholder="johndoe"
                  value={value}
                  onChangeText={onChange}
                  error={errors.username?.message}
                  iconLeft="profile"
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="+1 234 567 8900"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  error={errors.phone?.message}
                  iconLeft="spark"
                />
              )}
            />
          </View>
        );
      case 2: // Location
        return (
          <View style={s.stepContainer}>
            <Text
              style={[TextStyles.heading2, { color: colors.textPrimary, marginBottom: Spacing[6] }]}
            >
              Where are you located?
            </Text>
            <Controller
              control={control}
              name="country"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Country"
                  placeholder="United States"
                  value={value}
                  onChangeText={onChange}
                  error={errors.country?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="City"
                  placeholder="New York"
                  value={value}
                  onChangeText={onChange}
                  error={errors.city?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="pincode"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Pincode / Zip Code"
                  placeholder="10001"
                  value={value}
                  onChangeText={onChange}
                  error={errors.pincode?.message}
                />
              )}
            />
          </View>
        );
      case 3: // Account
        return (
          <View style={s.stepContainer}>
            <Text
              style={[TextStyles.heading2, { color: colors.textPrimary, marginBottom: Spacing[6] }]}
            >
              Secure Your Account
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  iconLeft="email"
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Input
                    label="Password"
                    placeholder="Create a strong password"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    error={errors.password?.message}
                    iconLeft="lock"
                  />
                  <PasswordStrengthMeter password={value || ""} />
                </View>
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                  iconLeft="lock"
                  containerStyle={{ marginTop: Spacing[4] }}
                />
              )}
            />
          </View>
        );
      case 4: // Profile
        return (
          <View style={s.stepContainer}>
            <Text
              style={[TextStyles.heading2, { color: colors.textPrimary, marginBottom: Spacing[6] }]}
            >
              Profile Setup
            </Text>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Short Bio (Optional)"
                  placeholder="Tell us about yourself"
                  value={value}
                  onChangeText={onChange}
                  error={errors.bio?.message}
                  multiline
                  containerStyle={{ height: 100 }}
                />
              )}
            />
            {formData.role === "engineer" && (
              <Controller
                control={control}
                name="department"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Department"
                    placeholder="e.g. Public Works, Transportation"
                    value={value}
                    onChangeText={onChange}
                    error={errors.department?.message}
                    containerStyle={{ marginTop: Spacing[4] }}
                  />
                )}
              />
            )}
          </View>
        );
      case 5: // Preferences
        return (
          <View style={s.stepContainer}>
            <Text
              style={[TextStyles.heading2, { color: colors.textPrimary, marginBottom: Spacing[6] }]}
            >
              App Preferences
            </Text>
            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
              Theme & Language settings will go here (UI pending).
            </Text>
            {/* For now we use the default values initialized in the form */}
          </View>
        );
      case 6: // Permissions
        return (
          <View style={s.stepContainer}>
            <Text
              style={[TextStyles.heading2, { color: colors.textPrimary, marginBottom: Spacing[4] }]}
            >
              Required Permissions
            </Text>
            <Text
              style={[TextStyles.body, { color: colors.textSecondary, marginBottom: Spacing[6] }]}
            >
              LUMEN needs certain permissions to provide you with the best experience.
            </Text>

            <View style={s.permissionItem}>
              <View style={[s.permIcon, { backgroundColor: colors.brand + "20" }]}>
                <LumenIcon name="map" size="md" color={colors.brand} />
              </View>
              <View style={s.permText}>
                <Text style={[TextStyles.label, { color: colors.textPrimary }]}>
                  Location Access
                </Text>
                <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
                  Used to accurately pin the location of civic issues.
                </Text>
              </View>
            </View>

            <View style={s.permissionItem}>
              <View style={[s.permIcon, { backgroundColor: colors.brand + "20" }]}>
                <LumenIcon name="camera" size="md" color={colors.brand} />
              </View>
              <View style={s.permText}>
                <Text style={[TextStyles.label, { color: colors.textPrimary }]}>
                  Camera & Gallery
                </Text>
                <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
                  Required to attach evidence photos to your reports.
                </Text>
              </View>
            </View>

            <View style={s.permissionItem}>
              <View style={[s.permIcon, { backgroundColor: colors.brand + "20" }]}>
                <LumenIcon name="notifications" size="md" color={colors.brand} />
              </View>
              <View style={s.permText}>
                <Text style={[TextStyles.label, { color: colors.textPrimary }]}>
                  Push Notifications
                </Text>
                <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
                  Stay updated on the resolution status of your reports.
                </Text>
              </View>
            </View>
          </View>
        );
      case 7: // Review
        return (
          <View style={s.stepContainer}>
            <Text
              style={[TextStyles.heading2, { color: colors.textPrimary, marginBottom: Spacing[6] }]}
            >
              Review Information
            </Text>
            <View
              style={[
                s.reviewCard,
                { backgroundColor: colors.bgSubtle, borderColor: colors.borderDefault },
              ]}
            >
              <ReviewRow label="Role" value={formData.role} />
              <ReviewRow label="Name" value={formData.fullName} />
              <ReviewRow label="Email" value={formData.email} />
              <ReviewRow label="Location" value={`${formData.city}, ${formData.country}`} />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: colors.bgBase }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={s.header}>
        {step > 0 ? (
          <Pressable onPress={prevStep} hitSlop={12} style={s.backBtn}>
            <LumenIcon name="arrowLeft" size="md" color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={s.backBtn} />
        )}

        <View style={s.progressContainer}>
          <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
            Step {step + 1} of {TOTAL_STEPS}
          </Text>
          <View style={[s.progressBar, { backgroundColor: colors.borderDefault }]}>
            <MotiView
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={[s.progressFill, { backgroundColor: colors.brand }]}
            />
          </View>
        </View>

        <View style={s.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AnimatePresence exitBeforeEnter custom={step}>
          <MotiView
            key={`step-${step}`}
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -20 }}
            transition={{ type: "timing", duration: 300 }}
          >
            {renderStepContent()}
          </MotiView>
        </AnimatePresence>
      </ScrollView>

      <View style={[s.footer, { borderTopColor: colors.borderDefault }]}>
        {step === TOTAL_STEPS - 1 ? (
          <Button
            label={loading ? "Creating Account..." : "Complete Registration"}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onPress={handleSubmit(onSubmit)}
          />
        ) : (
          <Button label="Continue" variant="primary" size="lg" fullWidth onPress={nextStep} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={s.reviewRow}>
      <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[TextStyles.body, { color: colors.textPrimary, fontWeight: "500" }]}>
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[4],
    paddingTop: 60,
    paddingBottom: Spacing[4],
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  progressBar: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
  },
  stepContainer: {
    flex: 1,
  },
  footer: {
    padding: Spacing[6],
    paddingBottom: Spacing[10],
    borderTopWidth: 1,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[4],
    marginBottom: Spacing[6],
  },
  permIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  permText: {
    flex: 1,
    gap: 2,
  },
  reviewCard: {
    borderRadius: Radius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    gap: Spacing[4],
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default RegisterScreen;
