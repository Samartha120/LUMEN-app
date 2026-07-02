// ============================================================
// LUMEN — Profile Screen (Citizen)
// Phase 3: Citizen Experience
// ============================================================
import React from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Card } from "@/design-system/components/Card";
import { Badge } from "@/design-system/components/Badge";
import { Avatar } from "@/design-system/components/Avatar";
import { StatCard } from "@/design-system/components/StatCard";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";
import type { LumenIconName } from "@/design-system";

interface MenuItem {
  icon: LumenIconName;
  label: string;
  value?: string;
  route?: string;
  color?: string;
  danger?: boolean;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: "Account",
    items: [
      { icon: "profile", label: "Personal Information", value: "Samuel K.", route: "/(citizen)/Settings" },
      { icon: "email", label: "Email Address", value: "citizen@lumen.app" },
      { icon: "phone", label: "Phone Number", value: "+91 98765 43210" },
      { icon: "shield", label: "Verification", value: "Verified" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: "notifications", label: "Notification Settings", route: "/(citizen)/Notifications" },
      { icon: "globe", label: "Language", value: "English" },
      { icon: "sun", label: "Theme", value: "System" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "help", label: "Help & FAQ", route: "/(citizen)/Help" },
      { icon: "comment", label: "Send Feedback" },
      { icon: "external", label: "Rate the App" },
    ],
  },
  {
    title: "",
    items: [
      { icon: "logout", label: "Sign Out", danger: true },
    ],
  },
];

export default function ProfileScreen() {
  const { colors, isDark, shadows } = useTheme();

  const handleItem = (item: MenuItem) => {
    if (item.danger) { router.replace("/Login" as any); return; }
    if (item.route) router.push(item.route as any);
  };

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bgBase} />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.borderDefault }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <LumenIcon name="back" size="md" color={colors.textPrimary} strokeWidth={2.5} />
        </Pressable>
        <Text style={[TextStyles.title, { color: colors.textPrimary }]}>Profile</Text>
        <Pressable hitSlop={12}>
          <LumenIcon name="sliders" size="md" color={colors.textSecondary} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile Hero */}
        <View style={[s.hero, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderDefault }]}>
          <View style={s.avatarRow}>
            <Avatar name="Samuel Krishnamurthy" size="xl" role="citizen" />
            <Pressable style={[s.editAvatarBtn, { backgroundColor: colors.brand }]}>
              <LumenIcon name="camera" size="xs" color="#FFF" strokeWidth={2.5} />
            </Pressable>
          </View>
          <Text style={[TextStyles.title, { color: colors.textPrimary }]}>Samuel Krishnamurthy</Text>
          <Text style={[TextStyles.body, { color: colors.textSecondary }]}>citizen@lumen.app</Text>
          <View style={s.heroTags}>
            <Badge label="Citizen" variant="brand" dot />
            <Badge label="Zone B" variant="neutral" />
            <Badge label="Verified" variant="success" icon="shield" />
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <StatCard label="Reports Filed" value="12" icon="report" variant="brand" compact />
          <StatCard label="Resolved" value="9" icon="success" variant="success" compact />
          <StatCard label="Points" value="240" icon="star" variant="default" compact />
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={s.section}>
            {section.title ? (
              <Text style={[TextStyles.label, { color: colors.textTertiary, marginBottom: Spacing[2], paddingHorizontal: Spacing[5] }]}>
                {section.title}
              </Text>
            ) : null}
            <Card variant="elevated" padding={0} style={s.menuCard}>
              {section.items.map((item, ii) => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [
                    s.menuRow,
                    {
                      borderBottomColor: colors.borderDefault,
                      borderBottomWidth: ii < section.items.length - 1 ? 1 : 0,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                  onPress={() => handleItem(item)}
                >
                  <View style={[s.menuIcon, { backgroundColor: item.danger ? "#FEF3F2" : colors.bgSubtle }]}>
                    <LumenIcon
                      name={item.icon}
                      size="sm"
                      color={item.danger ? "#F04438" : colors.textSecondary}
                      strokeWidth={2}
                    />
                  </View>
                  <Text style={[TextStyles.bodyMedium, { color: item.danger ? "#F04438" : colors.textPrimary, flex: 1 }]}>
                    {item.label}
                  </Text>
                  {item.value && (
                    <Text style={[TextStyles.bodySmall, { color: colors.textTertiary }]}>{item.value}</Text>
                  )}
                  {!item.danger && (
                    <LumenIcon name="chevronRight" size="sm" color={colors.textTertiary} strokeWidth={2} />
                  )}
                </Pressable>
              ))}
            </Card>
          </View>
        ))}

        <View style={{ height: Spacing[10] }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: Spacing[5], paddingTop: 52, paddingBottom: Spacing[4], borderBottomWidth: 1,
  },
  scroll: { paddingBottom: Spacing[10] },
  hero: {
    alignItems: "center", gap: Spacing[2],
    padding: Spacing[8], borderBottomWidth: 1,
  },
  avatarRow: { position: "relative" },
  editAvatarBtn: {
    position: "absolute", bottom: 0, right: -4,
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#FFF",
  },
  heroTags: { flexDirection: "row", gap: Spacing[2], marginTop: Spacing[1] },
  statsRow: { flexDirection: "row", gap: Spacing[3], padding: Spacing[5] },
  section: { marginBottom: Spacing[4] },
  menuCard: { marginHorizontal: Spacing[5], borderRadius: Radius["2xl"], overflow: "hidden" },
  menuRow: {
    flexDirection: "row", alignItems: "center", gap: Spacing[4],
    paddingHorizontal: Spacing[5], paddingVertical: Spacing[4],
  },
  menuIcon: { width: 36, height: 36, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },
});
