// ============================================================
// LUMEN — Profile Screen (Engineer)
// Phase 4: Engineer Experience
// ============================================================
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Switch,
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
    title: "Duty & Schedule",
    items: [
      { icon: "calendar", label: "Shift Schedule", value: "08:00 - 17:00" },
      { icon: "mapPin", label: "Assigned Zone", value: "Zone B (Central)" },
      { icon: "tools", label: "Tool Inventory", value: "12 Assets" },
    ],
  },
  {
    title: "Account & Preferences",
    items: [
      { icon: "profile", label: "Personal Information", value: "Rajesh K." },
      { icon: "email", label: "Email Address", value: "engineer@lumen.app" },
      { icon: "phone", label: "Contact Phone", value: "+91 99887 76655" },
      { icon: "sun", label: "App Theme", value: "Dark Mode" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "help", label: "Safety Regulations" },
      { icon: "comment", label: "Report App Bug" },
    ],
  },
  {
    title: "",
    items: [
      { icon: "logout", label: "Sign Out", danger: true },
    ],
  },
];

export default function EngineerProfileScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [onDuty, setOnDuty] = useState(true);

  const handleItem = (item: MenuItem) => {
    if (item.danger) {
      router.replace("/Login" as any);
      return;
    }
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
        <Text style={[TextStyles.title, { color: colors.textPrimary }]}>Engineer Profile</Text>
        <Pressable hitSlop={12}>
          <LumenIcon name="settings" size="md" color={colors.textSecondary} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile Hero Card */}
        <View style={[s.hero, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderDefault }]}>
          <View style={s.avatarRow}>
            <Avatar name="Rajesh Kumar" size="xl" role="engineer" online={onDuty} />
            <Pressable style={[s.editAvatarBtn, { backgroundColor: colors.brand }]}>
              <LumenIcon name="camera" size="xs" color="#FFF" strokeWidth={2.5} />
            </Pressable>
          </View>
          <Text style={[TextStyles.title, { color: colors.textPrimary }]}>Rajesh Kumar</Text>
          <Text style={[TextStyles.body, { color: colors.textSecondary }]}>engineer@lumen.app</Text>
          <View style={s.heroTags}>
            <Badge label="Field Engineer" variant="neutral" dot />
            <Badge label="Zone B" variant="brand" />
            <Badge label="Senior Grade" variant="success" icon="shield" />
          </View>
        </View>

        {/* Duty Switch Card */}
        <Card variant="elevated" style={s.dutyCard}>
          <View style={s.dutyRow}>
            <View style={s.dutyInfo}>
              <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary, fontWeight: "600" }]}>
                On-Duty Dispatch Status
              </Text>
              <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                {onDuty ? "Receiving live urgent emergency reports" : "Offline / Dispatch paused"}
              </Text>
            </View>
            <Switch
              value={onDuty}
              onValueChange={setOnDuty}
              trackColor={{ false: colors.borderDefault, true: "#12B76A" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Stats Row */}
        <View style={s.statsRow}>
          <StatCard label="Tasks Completed" value="48" icon="taskCheck" variant="success" compact />
          <StatCard label="SLA Compliance" value="94%" icon="trend" variant="brand" compact />
          <StatCard label="Zone Rank" value="#4" icon="star" variant="default" compact />
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
  dutyCard: { marginHorizontal: Spacing[5], marginTop: Spacing[4], marginBottom: Spacing[2] },
  dutyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dutyInfo: { flex: 1, gap: 2 },
  statsRow: { flexDirection: "row", gap: Spacing[3], padding: Spacing[5] },
  section: { marginBottom: Spacing[4] },
  menuCard: { marginHorizontal: Spacing[5], borderRadius: Radius["2xl"], overflow: "hidden" },
  menuRow: {
    flexDirection: "row", alignItems: "center", gap: Spacing[4],
    paddingHorizontal: Spacing[5], paddingVertical: Spacing[4],
  },
  menuIcon: { width: 36, height: 36, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },
});
