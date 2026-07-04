// ============================================================
// LUMEN DS — Input Component
// ============================================================
import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { LumenIcon, type LumenIconName } from "../icons/LumenIcon";
import { useTheme } from "../ThemeContext";
import { Radius, Spacing, TextStyles, TouchTarget } from "../tokens";

export interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: LumenIconName;
  iconRight?: LumenIconName;
  onIconRightPress?: () => void;
  containerStyle?: ViewStyle;
  size?: "sm" | "md" | "lg";
}

export function Input({
  label,
  hint,
  error,
  iconLeft,
  iconRight,
  onIconRightPress,
  containerStyle,
  size = "md",
  secureTextEntry,
  ...rest
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry ?? false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(borderAnim, {
      toValue: 1,
      useNativeDriver: false,
      speed: 40,
      bounciness: 0,
    }).start();
    rest.onFocus?.({} as any);
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.spring(borderAnim, {
      toValue: 0,
      useNativeDriver: false,
      speed: 40,
      bounciness: 0,
    }).start();
    rest.onBlur?.({} as any);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? colors.errorText : colors.borderDefault,
      error ? colors.errorText : colors.brand,
    ],
  });

  const heights: Record<string, number> = { sm: 40, md: TouchTarget.md, lg: TouchTarget.lg };
  const pxLeft = iconLeft ? Spacing[5] + 26 : Spacing[4];
  const pxRight = iconRight || secureTextEntry ? Spacing[5] + 26 : Spacing[4];

  return (
    <View style={[s.container, containerStyle]}>
      {label && (
        <Text
          style={[
            TextStyles.label,
            { color: error ? colors.errorText : colors.textSecondary, marginBottom: 6 },
          ]}
        >
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          s.inputWrap,
          {
            height: heights[size],
            backgroundColor: colors.bgSubtle,
            borderColor,
            borderRadius: Radius.xl,
          },
        ]}
      >
        {iconLeft && (
          <View style={s.iconLeft}>
            <LumenIcon
              name={iconLeft}
              size="sm"
              color={focused ? colors.brand : colors.textTertiary}
              strokeWidth={2}
            />
          </View>
        )}

        <TextInput
          {...rest}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={hidden}
          placeholderTextColor={colors.textTertiary}
          style={[
            TextStyles.body,
            s.input,
            {
              color: colors.textPrimary,
              paddingLeft: pxLeft,
              paddingRight: pxRight,
            },
          ]}
        />

        {secureTextEntry && (
          <Pressable style={s.iconRight} onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <LumenIcon
              name={hidden ? "eye" : "eyeOff"}
              size="sm"
              color={colors.textTertiary}
              strokeWidth={2}
            />
          </Pressable>
        )}

        {iconRight && !secureTextEntry && (
          <Pressable style={s.iconRight} onPress={onIconRightPress} hitSlop={8}>
            <LumenIcon
              name={iconRight}
              size="sm"
              color={focused ? colors.brand : colors.textTertiary}
              strokeWidth={2}
            />
          </Pressable>
        )}
      </Animated.View>

      {error ? (
        <Text style={[TextStyles.caption, { color: colors.errorText, marginTop: 4 }]}>{error}</Text>
      ) : hint ? (
        <Text style={[TextStyles.caption, { color: colors.textTertiary, marginTop: 4 }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 0 },
  inputWrap: {
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  input: { flex: 1, height: "100%" },
  iconLeft: { position: "absolute", left: Spacing[4], zIndex: 1 },
  iconRight: { position: "absolute", right: Spacing[4], zIndex: 1 },
});
