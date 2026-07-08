import { BottomNavigation, type NavItem } from "@/design-system/components/BottomNavigation";
import { useTheme } from "@/design-system/ThemeContext";
import { router, Tabs, useSegments } from "expo-router";

export default function CitizenLayout() {
  useTheme();
  const segments = useSegments() as string[];

  // Dynamically derive the current route and active tab name
  const currentPath = segments[1] || "Dashboard";

  const getActiveTab = (path: string) => {
    if (path === "Report-issue") return "FAB";
    if (path === "My-report" || path === "Report-details") return "My-report";
    if (path === "Notifications") return "Notifications";
    if (path === "Profile" || path === "Settings" || path === "Help") return "Profile";
    return "Dashboard";
  };

  const activeTab = getActiveTab(currentPath);

  const navItems: NavItem[] = [
    { name: "Dashboard", icon: "home", label: "Home" },
    { name: "My-report", icon: "reportList", label: "Reports" },
    { name: "FAB", icon: "add", label: "", isFAB: true },
    { name: "Notifications", icon: "notifications", label: "Alerts" },
    { name: "Profile", icon: "profile", label: "Profile" },
  ];

  const handleTabPress = (name: string) => {
    if (name === "Dashboard") {
      router.push("/(citizen)/Dashboard" as any);
    } else if (name === "My-report") {
      router.push("/(citizen)/My-report" as any);
    } else if (name === "Notifications") {
      router.push("/(citizen)/Notifications" as any);
    } else if (name === "Profile") {
      router.push("/(citizen)/Profile" as any);
    } else if (name === "FAB") {
      router.push("/(citizen)/Report-issue" as any);
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
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="Dashboard" />
        <Tabs.Screen name="Report-issue" />
        <Tabs.Screen name="My-report" />
        <Tabs.Screen name="Notifications" />
        <Tabs.Screen name="Profile" />
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
