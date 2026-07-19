import { Tabs } from "expo-router";
import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Platform } from "react-native";

export default function AdminLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#0A0A0A" : "#FFFFFF",
          borderTopColor: colors.borderDefault,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          paddingTop: 12,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: "Inter-Medium",
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="Dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <LumenIcon name="home" size="md" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="Complaints"
        options={{
          title: "Complaints",
          tabBarIcon: ({ color }) => <LumenIcon name="report" size="md" color={color as string} />,
        }}
      />
    </Tabs>
  );
}
