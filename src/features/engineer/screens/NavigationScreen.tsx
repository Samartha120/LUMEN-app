import { Component as PremiumScreen } from "@/components/ui";

export default function EngineerNavigationScreen() {
	return (
		<PremiumScreen
			badge="Route Guidance"
			description="Navigate to assignments through a calm, map-centric surface optimized for field work."
			primaryActionLabel="Start navigation"
			secondaryActionLabel="Plan route"
			subtitle="Clear wayfinding with strong hierarchy and low visual noise."
			title="Navigation"
		/>
	);
}
export { default } from "./EngineerPlaceholderScreen";
