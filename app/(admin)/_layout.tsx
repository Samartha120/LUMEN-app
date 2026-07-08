import { BottomNavigation, type NavItem } from "@/design-system/components/BottomNavigation";
import { useTheme } from "@/design-system/ThemeContext";
import { router, Tabs, useSegments } from "expo-router";

export default function AdminLayout() {
  useTheme();
  const segments = useSegments() as string[];

  // Dynamically derive the current route and active tab name
  const currentPath = segments[1] || "Dashboard";

  const getActiveTab = (path: string) => {
    if (path === "Analytics") return "Analytics";
    if (path === "Users") return "Users";
    if (path === "Settings") return "Settings";
    return "Dashboard";
  };

  const activeTab = getActiveTab(currentPath);

  const navItems: NavItem[] = [
    { name: "Dashboard", icon: "home", label: "Home" },
    { name: "Analytics", icon: "trend", label: "Analytics" },
    { name: "Users", icon: "profile", label: "Users" },
    { name: "Settings", icon: "settings", label: "Settings" },
  ];

  const handleTabPress = (name: string) => {
    if (name === "Dashboard") {
      router.push("/(admin)/Dashboard" as any);
    } else if (name === "Analytics") {
      router.push("/(admin)/Analytics" as any);
    } else if (name === "Users") {
      router.push("/(admin)/Users" as any);
    } else if (name === "Settings") {
      router.push("/(admin)/Settings" as any);
    }
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
        <Tabs.Screen name="Analytics" />
        <Tabs.Screen name="Users" />
        <Tabs.Screen name="Settings" />
      </Tabs>
      <BottomNavigation items={navItems} activeTab={activeTab} onTabPress={handleTabPress} />
    </>
  );
}
