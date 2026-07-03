import { BottomNavigation, type NavItem } from '@/design-system/components/BottomNavigation';
import { useTheme } from '@/design-system/ThemeContext';
import { router, Tabs } from 'expo-router';
import { useState } from 'react';

export default function AdminLayout() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("Dashboard");

  const navItems: NavItem[] = [
    { name: "Dashboard", icon: "home", label: "Home" },
    { name: "Analytics", icon: "trend", label: "Analytics" },
    { name: "Users", icon: "profile", label: "Users" },
    { name: "Settings", icon: "settings", label: "Settings" },
  ];

  const handleTabPress = (name: string) => {
    setActiveTab(name);
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
        }}
      >
        <Tabs.Screen name="Dashboard" />
        <Tabs.Screen name="Analytics" />
        <Tabs.Screen name="Users" />
        <Tabs.Screen name="Settings" />
      </Tabs>
      <BottomNavigation
        items={navItems}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    </>
  );
}
