import { Component as PremiumScreen } from "@/components/ui";

export default function VerifyEmailScreen() {
  return (
    <PremiumScreen
      badge="Email Check"
      description="Finish setup by confirming your inbox with a polished, trustworthy verification step."
      primaryActionLabel="Open email"
      secondaryActionLabel="Resend email"
      subtitle="Clear next steps and strong visual hierarchy for completion."
      title="Verify your email address"
    />
  );
}
