import { Stack, usePathname } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, LogBox } from "react-native";
import { ThemeProvider } from "@/design-system";
import { useEffect } from "react";
import "@/i18n/i18n";

LogBox.ignoreLogs(["SafeAreaView has been deprecated", "setLayoutAnimationEnabledExperimental"]);

export default function RootLayout() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      console.log(`[NAVIGATION] Screen changed to: ${pathname}`);
    }
  }, [pathname]);

  return (
    <GestureHandlerRootView style={s.root}>
      <ThemeProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(citizen)" />
          <Stack.Screen name="(engineer)" />
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
