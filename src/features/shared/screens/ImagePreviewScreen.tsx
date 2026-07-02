import { Component as PremiumScreen } from "@/components/ui";

export default function ImagePreviewScreen() {
  return (
    <PremiumScreen
      badge="Preview"
      description="Inspect captured media in a premium preview surface before attaching it to a report or task."
      primaryActionLabel="Use image"
      secondaryActionLabel="Retake"
      subtitle="Large visuals, clear actions, and a refined modal feel."
      title="Image preview"
    />
  );
}
