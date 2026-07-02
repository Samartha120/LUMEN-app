import { Component as PremiumScreen } from "@/components/ui";

export default function OtpScreen() {
  return (
    <PremiumScreen
      badge="Verification"
      description="Confirm your identity with a calm OTP entry surface optimized for speed and clarity."
      primaryActionLabel="Verify code"
      secondaryActionLabel="Resend code"
      subtitle="A focused checkpoint before secure access is granted."
      title="Enter your verification code"
    />
  );
}
