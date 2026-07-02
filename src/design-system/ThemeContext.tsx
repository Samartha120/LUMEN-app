import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";
import { LightColors, DarkColors, type ColorTokens } from "./tokens/Colors";
import { LightShadows, DarkShadows, type ShadowScale } from "./tokens/Shadows";
import { TextStyles, FontSize, FontWeight } from "./tokens/Typography";
import { Spacing, Radius } from "./tokens/Spacing";

export type ThemeMode = "light" | "dark" | "system";
export type ShadowTokens = ShadowScale;

export interface Theme {
  colors: ColorTokens;
  shadows: ShadowScale;
  text: typeof TextStyles;
  fontSize: typeof FontSize;
  fontWeight: typeof FontWeight;
  spacing: typeof Spacing;
  radius: typeof Radius;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";

  const theme: Theme = {
    colors: isDark ? (DarkColors as unknown as ColorTokens) : LightColors,
    shadows: isDark ? DarkShadows : LightShadows,
    text: TextStyles,
    fontSize: FontSize,
    fontWeight: FontWeight,
    spacing: Spacing,
    radius: Radius,
    isDark,
    mode,
    setMode,
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
