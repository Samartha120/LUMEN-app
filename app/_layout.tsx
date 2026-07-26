import { Stack, usePathname, router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, LogBox } from "react-native";
import { ThemeProvider } from "@/design-system";
import { useEffect } from "react";
import { useAuthStore } from "@/store/AuthStore";
import "@/i18n/i18n";

LogBox.ignoreLogs(["SafeAreaView has been deprecated", "setLayoutAnimationEnabledExperimental"]);

export default function RootLayout() {
  const pathname = usePathname();
  const { user, role } = useAuthStore();

  useEffect(() => {
    if (pathname) {
      console.log(`[NAVIGATION] Screen changed to: ${pathname}`);
    }
  }, [pathname]);

  useEffect(() => {
    if (!pathname) return;

    const isAuthRoute =
      pathname === "/welcome" ||
      pathname.startsWith("/(auth)") ||
      pathname === "/onboarding" ||
      pathname === "/landing";
    const isCitizenRoute = pathname.startsWith("/(citizen)");
    const isAdminRoute = pathname.startsWith("/(admin)");

    if (user) {
      if (isAuthRoute) {
        const target =
          role === "ADMIN" || role === "SUPER_ADMIN"
            ? "/(admin)/Dashboard"
            : "/(citizen)/Dashboard";
        console.log(
          `[AUTH GUARD] Logged in user tried to access auth route ${pathname}. Redirecting to ${target}`
        );
        router.replace(target as any);
      }
    } else {
      if (isCitizenRoute || isAdminRoute) {
        console.log(
          `[AUTH GUARD] Logged-out user tried to access protected route ${pathname}. Redirecting to /Login`
        );
        router.replace("/(auth)/Login" as any);
      }
    }
  }, [pathname, user, role]);

  return (
    <GestureHandlerRootView style={s.root}>
      <ThemeProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(citizen)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(shared)" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({ root: { flex: 1 } });
