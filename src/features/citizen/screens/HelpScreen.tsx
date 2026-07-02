import { Component as PremiumScreen } from "@/components/ui";

export default function CitizenHelpScreen() {
  return (
    <PremiumScreen
      badge="Support"
      description="Find guidance, escalation paths, and common answers in a friendly, accessible help experience."
      primaryActionLabel="Contact support"
      secondaryActionLabel="Browse FAQs"
      subtitle="Clear assistance when a report needs extra context or follow-up."
      title="How can we help?"
    />
  );
}
