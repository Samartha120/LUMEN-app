import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { useTheme } from "@/design-system/ThemeContext";
import { Tabs } from "expo-router";

export default function CitizenLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.bgSurface,
          borderTopColor: colors.borderDefault,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="Dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <LumenIcon name="home" size={size} color={String(color)} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="Report-issue"
        options={{
          title: "Report",
          tabBarIcon: ({ color, size }) => (
            <LumenIcon name="report" size={size} color={String(color)} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="My-report"
        options={{
          title: "My Reports",
          tabBarIcon: ({ color, size }) => (
            <LumenIcon name="reportList" size={size} color={String(color)} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="Notifications"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <LumenIcon name="notifications" size={size} color={String(color)} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <LumenIcon name="profile" size={size} color={String(color)} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
