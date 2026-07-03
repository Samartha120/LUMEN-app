import { BottomNavigation, type NavItem } from "@/design-system/components/BottomNavigation";
import { useTheme } from "@/design-system/ThemeContext";
import { router, Tabs } from "expo-router";
import { useState } from "react";

export default function EngineerLayout() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("Dashboard");

  const navItems: NavItem[] = [
    { name: "Dashboard", icon: "home", label: "Home" },
    { name: "Assigned-tasks", icon: "taskCheck", label: "Tasks" },
    { name: "FAB", icon: "tools", label: "", isFAB: true },
    { name: "Navigation", icon: "navigate2", label: "Navigate" },
    { name: "Profile", icon: "profile", label: "Profile" },
  ];

  const handleTabPress = (name: string) => {
    setActiveTab(name);
    if (name === "Dashboard") {
      router.push("/(engineer)/Dashboard" as any);
    } else if (name === "Assigned-tasks") {
      router.push("/(engineer)/Assigned-tasks" as any);
    } else if (name === "Navigation") {
      router.push("/(engineer)/Navigation" as any);
    } else if (name === "Profile") {
      router.push("/(engineer)/Profile" as any);
    }
  };

  const handleFABPress = () => {
    router.push("/(engineer)/Update-progress" as any);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="Dashboard" />
        <Tabs.Screen name="Assigned-tasks" />
        <Tabs.Screen name="Navigation" />
        <Tabs.Screen name="Profile" />
        <Tabs.Screen name="FAB" options={{ href: null }} />
      </Tabs>
      <BottomNavigation
        items={navItems}
        activeTab={activeTab}
        onTabPress={handleTabPress}
        showFAB
        fabIcon="tools"
        fabOnPress={handleFABPress}
      />
    </>
  );
}
