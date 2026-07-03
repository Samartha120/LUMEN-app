import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { useTheme } from "@/design-system/ThemeContext";
import { Tabs } from "expo-router";

export default function EngineerLayout() {
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
        name="Assigned-tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <LumenIcon name="taskCheck" size={size} color={String(color)} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="Navigation"
        options={{
          title: "Navigate",
          tabBarIcon: ({ color, size }) => (
            <LumenIcon name="navigate2" size={size} color={String(color)} strokeWidth={2} />
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
