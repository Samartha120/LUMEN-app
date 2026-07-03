import { LumenIcon } from '@/design-system/icons/LumenIcon';
import { useTheme } from '@/design-system/ThemeContext';
import { Tabs } from 'expo-router';

export default function AdminLayout() {
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
        name="Analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size }) => (
            <LumenIcon name="trend" size={size} color={String(color)} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="Users"
        options={{
          title: "Users",
          tabBarIcon: ({ color, size }) => (
            <LumenIcon name="profile" size={size} color={String(color)} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <LumenIcon name="settings" size={size} color={String(color)} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
