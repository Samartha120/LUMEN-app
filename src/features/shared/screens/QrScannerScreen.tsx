import { Component as PremiumScreen } from "@/components/ui";

export default function QrScannerScreen() {
  return (
    <PremiumScreen
      badge="Scanner"
      description="Scan civic QR codes using a sleek, high-clarity scanner surface."
      primaryActionLabel="Scan"
      secondaryActionLabel="Enter code"
      subtitle="A focused scanning flow with quick confirmation and readable feedback."
      title="QR scanner"
    />
  );
}
