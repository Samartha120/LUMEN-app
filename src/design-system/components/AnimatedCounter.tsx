import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { useTheme } from "../ThemeContext";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: any;
  formatValue?: (value: number) => string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  prefix = "",
  suffix = "",
  style,
  formatValue,
}: AnimatedCounterProps) {
  const { colors, fontSize, fontWeight } = useTheme();
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, { duration: 300 }),
    };
  });

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(easedProgress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  const formattedValue = formatValue ? formatValue(displayValue) : displayValue.toLocaleString();

  return (
    <Animated.Text style={[styles.counter, { color: colors.textPrimary }, style, animatedStyle]}>
      {prefix}
      {formattedValue}
      {suffix}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  counter: {
    fontVariant: ["tabular-nums"],
  },
});
