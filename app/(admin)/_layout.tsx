import { Stack } from 'expo-router';
import { useTheme } from '@/design-system/ThemeContext';

export default function AdminLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgSurface },
        headerTintColor: colors.textPrimary,
        contentStyle: { backgroundColor: colors.bgBase },
      }}
    >
      <Stack.Screen name="Dashboard" options={{ title: 'Admin Dashboard' }} />
    </Stack>
  );
}
