import { Component as PremiumScreen } from "@/components/ui";

export default function ForgetPasswordScreen() {
  return (
    <PremiumScreen
      badge="Account Recovery"
      description="Reset access with a reassuring, minimal flow that keeps the next step obvious at every stage."
      primaryActionLabel="Send reset link"
      secondaryActionLabel="Back to sign in"
      subtitle="Guided recovery for secure re-entry without friction."
      title="Recover your account"
    />
  );
}
