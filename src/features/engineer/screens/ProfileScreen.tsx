import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Switch } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import {
  Card,
  Badge,
  Avatar,
  StatCard,
  ActionModal,
  Input,
  Button,
} from "@/design-system/components";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";
import type { LumenIconName } from "@/design-system";
import { useAuthStore } from "@/store/AuthStore";

interface MenuItem {
  icon: LumenIconName;
  label: string;
  value?: string;
  route?: string;
  color?: string;
  danger?: boolean;
  onAction?: () => void;
}

export default function EngineerProfileScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [onDuty, setOnDuty] = useState(true);
  const { user, userAvatars, setAvatarUri } = useAuthStore();

  const userId = user?.id || "mock-user-id";
  const avatarUri = userAvatars[userId] || null;
  const userEmail = user?.email || "engineer@lumen.app";
  const userFullName = user?.user_metadata?.full_name || "Rajesh Kumar";
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(userId, result.assets[0].uri);
    }
  };

  const handleItem = (item: MenuItem) => {
    if (item.onAction) {
      item.onAction();
      return;
    }
    if (item.danger) {
      router.replace("/Login" as any);
      return;
    }
    if (item.route) router.push(item.route as any);
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: "Duty & Schedule",
      items: [
        {
          icon: "calendar",
          label: "Shift Schedule",
          value: "08:00 - 17:00",
          onAction: () => setActiveModal("shift"),
        },
        {
          icon: "mapPin",
          label: "Assigned Zone",
          value: "Zone B (Central)",
          onAction: () => setActiveModal("zone"),
        },
        {
          icon: "tools",
          label: "Tool Inventory",
          value: "12 Assets",
          onAction: () => setActiveModal("tools"),
        },
      ],
    },
    {
      title: "Account & Preferences",
      items: [
        {
          icon: "profile",
          label: "Personal Information",
          value: userFullName.split(" ")[0] || "Rajesh K.",
        },
        {
          icon: "email",
          label: "Email Address",
          value: userEmail,
          onAction: () => setActiveModal("email"),
        },
        {
          icon: "phone",
          label: "Contact Phone",
          value: "+91 99887 76655",
          onAction: () => setActiveModal("phone"),
        },
        { icon: "sun", label: "App Theme", value: "Dark Mode" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: "help", label: "Safety Regulations", onAction: () => setActiveModal("safety") },
        { icon: "comment", label: "Report App Bug", onAction: () => setActiveModal("bug") },
      ],
    },
    {
      title: "",
      items: [{ icon: "logout", label: "Sign Out", danger: true }],
    },
  ];

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.bgBase}
      />

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
        <View
          style={[
            s.hero,
            { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderDefault },
          ]}
        >
          <View style={s.avatarRow}>
            <Pressable onPress={pickAvatar}>
              <Avatar
                name={userFullName}
                size="xl"
                role="engineer"
                online={onDuty}
                uri={avatarUri}
              />
            </Pressable>
            <Pressable
              onPress={pickAvatar}
              style={[s.editAvatarBtn, { backgroundColor: colors.brand }]}
            >
              <LumenIcon name="camera" size="xs" color="#FFF" strokeWidth={2.5} />
            </Pressable>
          </View>
          <Text style={[TextStyles.title, { color: colors.textPrimary }]}>{userFullName}</Text>
          <Text style={[TextStyles.body, { color: colors.textSecondary }]}>{userEmail}</Text>
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
              <Text
                style={[TextStyles.bodyMedium, { color: colors.textPrimary, fontWeight: "600" }]}
              >
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
        {menuSections.map((section, si) => (
          <View key={si} style={s.section}>
            {section.title ? (
              <Text
                style={[
                  TextStyles.label,
                  {
                    color: colors.textTertiary,
                    marginBottom: Spacing[2],
                    paddingHorizontal: Spacing[5],
                  },
                ]}
              >
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
                  <View
                    style={[
                      s.menuIcon,
                      { backgroundColor: item.danger ? "#FEF3F2" : colors.bgSubtle },
                    ]}
                  >
                    <LumenIcon
                      name={item.icon}
                      size="sm"
                      color={item.danger ? "#F04438" : colors.textSecondary}
                      strokeWidth={2}
                    />
                  </View>
                  <Text
                    style={[
                      TextStyles.bodyMedium,
                      {
                        color: item.danger ? "#F04438" : colors.textPrimary,
                        flex: 1,
                        marginRight: 8,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  {item.value && (
                    <Text
                      style={[
                        TextStyles.bodySmall,
                        { color: colors.textTertiary, flexShrink: 1, textAlign: "right" },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.value}
                    </Text>
                  )}
                  {!item.danger && (
                    <LumenIcon
                      name="chevronRight"
                      size="sm"
                      color={colors.textTertiary}
                      strokeWidth={2}
                    />
                  )}
                </Pressable>
              ))}
            </Card>
          </View>
        ))}

        <View style={{ height: Spacing[10] }} />
      </ScrollView>

      {/* ── Modals ── */}
      <ActionModal
        visible={activeModal === "shift"}
        onClose={() => setActiveModal(null)}
        title="Shift Schedule"
        icon="calendar"
      >
        <Text style={[TextStyles.body, { color: colors.textSecondary, marginBottom: Spacing[4] }]}>
          Your active shift is assigned from 08:00 AM to 05:00 PM. Overtime hours will be
          automatically logged by the dispatcher.
        </Text>
        <Button
          label="Request Shift Change"
          variant="secondary"
          onPress={() => setActiveModal(null)}
        />
      </ActionModal>

      <ActionModal
        visible={activeModal === "zone"}
        onClose={() => setActiveModal(null)}
        title="Assigned Zone"
        icon="mapPin"
      >
        <Text style={[TextStyles.body, { color: colors.textSecondary, marginBottom: Spacing[4] }]}>
          You are currently assigned to Zone B (Central District). You will primarily receive issues
          reported in this geographical boundary.
        </Text>
        <Button label="Acknowledge" onPress={() => setActiveModal(null)} />
      </ActionModal>

      <ActionModal
        visible={activeModal === "tools"}
        onClose={() => setActiveModal(null)}
        title="Tool Inventory"
        icon="tools"
      >
        <Text style={[TextStyles.body, { color: colors.textSecondary, marginBottom: Spacing[4] }]}>
          You have 12 assets assigned to you (including protective gear, multimeter, and transport
          vehicle). Please ensure all assets are accounted for at the end of the shift.
        </Text>
        <Button
          label="View Full Inventory"
          variant="secondary"
          onPress={() => setActiveModal(null)}
        />
      </ActionModal>

      <ActionModal
        visible={activeModal === "email"}
        onClose={() => setActiveModal(null)}
        title="Email Address"
        icon="email"
      >
        <Text style={[TextStyles.body, { color: colors.textSecondary, marginBottom: Spacing[4] }]}>
          Update your official dispatch email address.
        </Text>
        <Input label="Email Address" placeholder={userEmail} style={{ marginBottom: Spacing[4] }} />
        <Button label="Save Email" onPress={() => setActiveModal(null)} />
      </ActionModal>

      <ActionModal
        visible={activeModal === "phone"}
        onClose={() => setActiveModal(null)}
        title="Contact Phone"
        icon="phone"
      >
        <Text style={[TextStyles.body, { color: colors.textSecondary, marginBottom: Spacing[4] }]}>
          Update your contact number. A verification code will be sent.
        </Text>
        <Input
          label="Mobile Number"
          placeholder="+91 99887 76655"
          style={{ marginBottom: Spacing[4] }}
        />
        <Button label="Update Contact" onPress={() => setActiveModal(null)} />
      </ActionModal>

      <ActionModal
        visible={activeModal === "safety"}
        onClose={() => setActiveModal(null)}
        title="Safety Regulations"
        icon="help"
      >
        <View style={{ marginBottom: Spacing[4] }}>
          <Text
            style={[TextStyles.heading2, { color: colors.textPrimary, marginBottom: Spacing[2] }]}
          >
            PPE Required
          </Text>
          <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
            Ensure all protective equipment is worn before attending to electrical or hazardous
            infrastructure issues. Failure to comply violates safety protocol.
          </Text>
        </View>
        <Button label="I Understand" onPress={() => setActiveModal(null)} />
      </ActionModal>

      <ActionModal
        visible={activeModal === "bug"}
        onClose={() => setActiveModal(null)}
        title="Report App Bug"
        icon="comment"
      >
        <Text style={[TextStyles.body, { color: colors.textSecondary, marginBottom: Spacing[4] }]}>
          Describe the issue you encountered in the app. Logs will be automatically attached.
        </Text>
        <Input
          label="Description"
          placeholder="What went wrong?"
          style={{ marginBottom: Spacing[4] }}
        />
        <Button label="Submit Bug Report" onPress={() => setActiveModal(null)} />
      </ActionModal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[5],
    paddingTop: 52,
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
  },
  scroll: { paddingBottom: Spacing[10] },
  hero: {
    alignItems: "center",
    gap: Spacing[2],
    padding: Spacing[8],
    borderBottomWidth: 1,
  },
  avatarRow: { position: "relative" },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  heroTags: { flexDirection: "row", gap: Spacing[2], marginTop: Spacing[1] },
  dutyCard: { marginHorizontal: Spacing[5], marginTop: Spacing[4], marginBottom: Spacing[2] },
  dutyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dutyInfo: { flex: 1, gap: 2 },
  statsRow: { flexDirection: "row", gap: Spacing[3], padding: Spacing[5] },
  section: { marginBottom: Spacing[4] },
  menuCard: { marginHorizontal: Spacing[5], borderRadius: Radius["2xl"], overflow: "hidden" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[4],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
