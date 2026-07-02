import { Component as PremiumScreen } from "@/components/ui";

export default function AssignedTasksScreen() {
	return (
		<PremiumScreen
			badge="Task Queue"
			description="Review assigned civic work in a crisp task surface designed for focus and quick action."
			primaryActionLabel="Open tasks"
			secondaryActionLabel="Filter"
			subtitle="A premium worklist with room for progress, proof, and routing."
			title="Assigned tasks"
		/>
	);
}
export { default } from "./EngineerPlaceholderScreen";
