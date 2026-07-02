import { Component as PremiumScreen } from "@/components/ui";

export default function CitizenSettingsScreen() {
	return (
		<PremiumScreen
			badge="Settings"
			description="Adjust notification, privacy, and appearance preferences in a polished settings environment."
			primaryActionLabel="Save changes"
			secondaryActionLabel="Reset"
			subtitle="A clean control panel for the citizen experience."
			title="App settings"
		/>
	);
}
