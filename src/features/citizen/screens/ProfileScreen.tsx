import { Component as PremiumScreen } from "@/components/ui";

export default function CitizenProfileScreen() {
  return (
    <PremiumScreen
      badge="Profile"
      description="Review your identity, preferences, and access settings with a refined account surface."
      primaryActionLabel="Edit profile"
      secondaryActionLabel="Security settings"
      subtitle="A calm profile experience that stays readable in light or dark mode."
      title="Your profile"
    />
  );
}
