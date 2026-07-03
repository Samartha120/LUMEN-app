// ============================================================
// LUMEN Design System — Production Bottom Navigation
// ============================================================

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { LumenIcon, type LumenIconName } from '../icons/LumenIcon';
import { Spacing } from '../tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface NavItem {
  name: string;
  icon: LumenIconName;
  label: string;
  isFAB?: boolean;
}

export interface BottomNavigationProps {
  items: NavItem[];
  activeTab: string;
  onTabPress: (name: string) => void;
  showFAB?: boolean;
  fabIcon?: LumenIconName;
  fabOnPress?: () => void;
}

export function BottomNavigation({
  items,
  activeTab,
  onTabPress,
  showFAB = false,
  fabIcon = 'add',
  fabOnPress,
}: BottomNavigationProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for FAB
  useEffect(() => {
    if (showFAB) {
      const animate = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ]).start(animate);
      };
      animate();
    }
  }, [showFAB]);

  const handleTabPress = (name: string, isFAB = false) => {
    if (isFAB) {
      fabOnPress?.();
    } else {
      onTabPress(name);
    }
  };

  const isTablet = width > 768;
  const navHeight = isTablet ? 80 : 70;
  const fabSize = isTablet ? 64 : 56;

  return (
    <View style={styles.container}>
      <BlurView
        intensity={isDark ? 40 : 30}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.navBar,
          {
            height: navHeight,
            backgroundColor: isDark ? 'rgba(15, 15, 25, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          },
        ]}
      >
        <LinearGradient
          colors={[
            isDark ? 'rgba(30, 30, 50, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            isDark ? 'rgba(20, 20, 35, 0.5)' : 'rgba(248, 248, 252, 0.5)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.content, { paddingHorizontal: isTablet ? Spacing[8] : Spacing[6] }]}>
          {items.map((item, index) => {
            const isActive = activeTab === item.name;
            const isCenterFAB = showFAB && index === Math.floor(items.length / 2);

            if (isCenterFAB) {
              // FAB in center
              return (
                <View key={item.name} style={styles.fabContainer}>
                  <Animated.View
                    style={[
                      styles.fabPulse,
                      {
                        opacity: pulseAnim,
                        transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
                      },
                    ]}
                  />
                  <AnimatedPressable
                    onPress={() => handleTabPress(item.name, true)}
                    style={({ pressed }) => [
                      styles.fab,
                      {
                        width: fabSize,
                        height: fabSize,
                        backgroundColor: colors.brand,
                        transform: [{ scale: pressed ? 0.92 : 1 }],
                        shadowColor: colors.brand,
                      },
                    ]}
                  >
                    <LumenIcon name={fabIcon} size="lg" color="#FFFFFF" strokeWidth={2.5} />
                  </AnimatedPressable>
                </View>
              );
            }

            return (
              <AnimatedPressable
                key={item.name}
                onPress={() => handleTabPress(item.name)}
                style={({ pressed }) => [
                  styles.tabItem,
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconWrapper,
                    isActive && {
                      backgroundColor: colors.brand + '15',
                    },
                  ]}
                >
                  <LumenIcon
                    name={item.icon}
                    size={isActive ? 'md' : 'sm'}
                    color={isActive ? colors.brand : colors.textTertiary}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </View>
                {isActive && (
                  <Text
                    style={[
                      styles.label,
                      {
                        color: colors.brand,
                        marginTop: 4,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                )}
              </AnimatedPressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  navBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 28,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 12,
    paddingBottom: 8,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  fab: {
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabPulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
  },
});
