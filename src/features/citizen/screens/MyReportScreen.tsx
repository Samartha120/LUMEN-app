import { Component as PremiumScreen } from "@/components/ui";

export default function CitizenMyReportScreen() {
  return (
    <PremiumScreen
      badge="My Reports"
      description="Review your submitted issues with a refined list layout and clear status hierarchy."
      primaryActionLabel="New report"
      secondaryActionLabel="Refresh"
      subtitle="Designed for quick scanability and next-step clarity."
      title="Your report history"
    />
  );
}
