import { Component as PremiumScreen } from "@/components/ui";

export default function CitizenReportDetailsScreen() {
  return (
    <PremiumScreen
      badge="Report Detail"
      description="Inspect a single issue with a clear status timeline and premium spacing for critical context."
      primaryActionLabel="Follow up"
      secondaryActionLabel="Share report"
      subtitle="Designed for confidence when reading updates or escalating a concern."
      title="Report details"
    />
  );
}
