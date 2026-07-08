import { BottomNavigation, type NavItem } from "@/design-system/components/BottomNavigation";
import { useTheme } from "@/design-system/ThemeContext";
import { router, Tabs, useSegments } from "expo-router";

export default function EngineerLayout() {
  useTheme();
  const segments = useSegments() as string[];

  // Dynamically derive the current route and active tab name
  const currentPath = segments[1] || "Dashboard";

  const getActiveTab = (path: string) => {
    if (path === "Update-progress") return "FAB";
    if (path === "Assigned-tasks" || path === "Task-details" || path === "Upload-proof")
      return "Assigned-tasks";
    if (path === "Navigation") return "Navigation";
    if (path === "Profile") return "Profile";
    return "Dashboard";
  };

  const activeTab = getActiveTab(currentPath);

  const navItems: NavItem[] = [
    { name: "Dashboard", icon: "home", label: "Home" },
    { name: "Assigned-tasks", icon: "taskCheck", label: "Tasks" },
    { name: "FAB", icon: "tools", label: "", isFAB: true },
    { name: "Navigation", icon: "navigate2", label: "Navigate" },
    { name: "Profile", icon: "profile", label: "Profile" },
  ];

  const handleTabPress = (name: string) => {
    if (name === "Dashboard") {
      router.push("/(engineer)/Dashboard" as any);
    } else if (name === "Assigned-tasks") {
      router.push("/(engineer)/Assigned-tasks" as any);
    } else if (name === "Navigation") {
      router.push("/(engineer)/Navigation" as any);
    } else if (name === "Profile") {
      router.push("/(engineer)/Profile" as any);
    } else if (name === "FAB") {
      router.push("/(engineer)/Update-progress" as any);
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
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="Dashboard" />
        <Tabs.Screen name="Assigned-tasks" />
        <Tabs.Screen name="Navigation" />
        <Tabs.Screen name="Profile" />
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
