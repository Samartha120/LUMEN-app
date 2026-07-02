import { Component as PremiumScreen } from "@/components/ui";

export default function CitizenDashboardScreen() {
  return (
    <PremiumScreen
      badge="Citizen Overview"
      description="Track civic activity, recent reports, and live updates with a premium overview that feels calm and actionable."
      primaryActionLabel="Report an issue"
      secondaryActionLabel="View reports"
      subtitle="An elegant command center for everyday civic participation."
      title="Your civic dashboard"
    />
  );
}
