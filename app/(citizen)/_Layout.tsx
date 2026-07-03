import { BottomNavigation, type NavItem } from "@/design-system/components/BottomNavigation";
import { useTheme } from "@/design-system/ThemeContext";
import { router, Tabs } from "expo-router";
import { useState } from "react";

export default function CitizenLayout() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("Dashboard");

  const navItems: NavItem[] = [
    { name: "Dashboard", icon: "home", label: "Home" },
    { name: "Report-issue", icon: "report", label: "Report" },
    { name: "FAB", icon: "add", label: "", isFAB: true },
    { name: "My-report", icon: "reportList", label: "Reports" },
    { name: "Notifications", icon: "notifications", label: "Alerts" },
    { name: "Profile", icon: "profile", label: "Profile" },
  ];

  const handleTabPress = (name: string) => {
    setActiveTab(name);
    if (name === "Dashboard") {
      router.push("/(citizen)/Dashboard" as any);
    } else if (name === "Report-issue") {
      router.push("/(citizen)/Report-issue" as any);
    } else if (name === "My-report") {
      router.push("/(citizen)/My-report" as any);
    } else if (name === "Notifications") {
      router.push("/(citizen)/Notifications" as any);
    } else if (name === "Profile") {
      router.push("/(citizen)/Profile" as any);
    }
  };

  const handleFABPress = () => {
    router.push("/(citizen)/Report-issue" as any);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="Dashboard" />
        <Tabs.Screen name="Report-issue" />
        <Tabs.Screen name="My-report" />
        <Tabs.Screen name="Notifications" />
        <Tabs.Screen name="Profile" />
        <Tabs.Screen name="FAB" options={{ href: null }} />
      </Tabs>
      <BottomNavigation
        items={navItems}
        activeTab={activeTab}
        onTabPress={handleTabPress}
        showFAB
        fabIcon="add"
        fabOnPress={handleFABPress}
      />
    </>
  );
}
