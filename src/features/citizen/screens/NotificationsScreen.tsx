import { Component as PremiumScreen } from "@/components/ui";

export default function CitizenNotificationsScreen() {
  return (
    <PremiumScreen
      badge="Updates"
      description="Stay on top of civic progress with notification surfaces that feel premium and easy to act on."
      primaryActionLabel="Mark all read"
      secondaryActionLabel="Notification settings"
      subtitle="A polished inbox for important civic alerts."
      title="Notifications"
    />
  );
}
