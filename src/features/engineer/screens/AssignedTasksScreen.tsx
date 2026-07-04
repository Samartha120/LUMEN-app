// ============================================================
// LUMEN — Assigned Tasks Screen (Engineer)
// Phase 4: Engineer Experience
// ============================================================
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Badge } from "@/design-system/components/Badge";
import { Chip } from "@/design-system/components/Badge";
import { Card } from "@/design-system/components/Card";
import { SearchBar } from "@/design-system/components/Extras";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";
import type { LumenIconName } from "@/design-system";

type Filter = "all" | "urgent" | "today" | "week";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "urgent", label: "Urgent" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
];

interface Task {
  id: string;
  title: string;
  address: string;
  category: LumenIconName;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "done";
  assignedAt: string;
  distance: string;
  sla: string;
}

const TASKS: Task[] = [
  {
    id: "T001",
    title: "Repair large pothole on MG Road",
    address: "123 MG Road",
    category: "road",
    priority: "high",
    status: "in_progress",
    assignedAt: "Today, 9 AM",
    distance: "1.2 km",
    sla: "6 hours",
  },
  {
    id: "T002",
    title: "Fix street light panel",
    address: "Park Ave, 2nd Block",
    category: "streetlight",
    priority: "medium",
    status: "pending",
    assignedAt: "Today, 8 AM",
    distance: "3.4 km",
    sla: "24 hours",
  },
  {
    id: "T003",
    title: "Water valve replacement",
    address: "5th Cross, Gandhi Nagar",
    category: "water",
    priority: "high",
    status: "pending",
    assignedAt: "Today, 7:30 AM",
    distance: "5.1 km",
    sla: "12 hours",
  },
  {
    id: "T004",
    title: "Garbage collection assist",
    address: "Gandhi Nagar Main St",
    category: "garbage",
    priority: "low",
    status: "pending",
    assignedAt: "Yesterday",
    distance: "6.8 km",
    sla: "48 hours",
  },
  {
    id: "T005",
    title: "Electrical sparks inspection",
    address: "Residency Road",
    category: "electricity",
    priority: "high",
    status: "done",
    assignedAt: "Yesterday",
    distance: "2.3 km",
    sla: "Completed",
  },
];

const PRIORITY_COLOR: Record<string, string> = {
  high: "#F04438",
  medium: "#F79009",
  low: "#12B76A",
};
const STATUS_BADGE: Record<string, { label: string; variant: any }> = {
  pending: { label: "Pending", variant: "warning" },
  in_progress: { label: "In Progress", variant: "info" },
  done: { label: "Completed", variant: "success" },
};

export default function AssignedTasksScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = TASKS.filter((t) => {
    const matchFilter =
      filter === "all" ||
      (filter === "urgent" && t.priority === "high") ||
      filter === "today" ||
      filter === "week";
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.bgBase}
      />

      <View style={[s.header, { borderBottomColor: colors.borderDefault }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <LumenIcon name="back" size="md" color={colors.textPrimary} strokeWidth={2.5} />
        </Pressable>
        <Text style={[TextStyles.title, { color: colors.textPrimary }]}>Assigned Tasks</Text>
        <View style={[s.badge, { backgroundColor: colors.brandSoft }]}>
          <Text style={[TextStyles.label, { color: colors.brand }]}>{TASKS.length}</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: Spacing[5], paddingVertical: Spacing[3] }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search tasks…" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filters}
      >
        {FILTERS.map((f) => (
          <Chip
            key={f.id}
            label={f.label}
            selected={filter === f.id}
            onPress={() => setFilter(f.id)}
          />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map((task) => {
          const sb = STATUS_BADGE[task.status];
          return (
            <Card
              key={task.id}
              variant="elevated"
              padding={Spacing[4]}
              onPress={() => router.push("/(engineer)/Task-details" as any)}
              style={s.card}
            >
              <View style={s.cardTop}>
                <View
                  style={[s.catIcon, { backgroundColor: PRIORITY_COLOR[task.priority] + "15" }]}
                >
                  <LumenIcon
                    name={task.category}
                    size="md"
                    color={PRIORITY_COLOR[task.priority]}
                    strokeWidth={2}
                  />
                </View>
                <View style={s.cardInfo}>
                  <Text
                    style={[TextStyles.bodyMedium, { color: colors.textPrimary }]}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>
                  <View style={s.metaRow}>
                    <LumenIcon
                      name="mapPin"
                      size="xs"
                      color={colors.textTertiary}
                      strokeWidth={2}
                    />
                    <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                      {task.address}
                    </Text>
                  </View>
                </View>
                <Badge label={sb.label} variant={sb.variant} size="sm" />
              </View>
              <View style={[s.cardFooter, { borderTopColor: colors.borderDefault }]}>
                <View style={s.footerItem}>
                  <LumenIcon name="navigate" size="xs" color={colors.brand} strokeWidth={2} />
                  <Text style={[TextStyles.caption, { color: colors.brand }]}>{task.distance}</Text>
                </View>
                <View style={s.footerItem}>
                  <LumenIcon name="clock" size="xs" color={colors.textTertiary} strokeWidth={2} />
                  <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                    SLA: {task.sla}
                  </Text>
                </View>
                <View style={s.footerItem}>
                  <LumenIcon
                    name="calendar"
                    size="xs"
                    color={colors.textTertiary}
                    strokeWidth={2}
                  />
                  <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                    {task.assignedAt}
                  </Text>
                </View>
              </View>
            </Card>
          );
        })}
        <View style={{ height: Spacing[10] }} />
      </ScrollView>
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
  badge: { paddingHorizontal: Spacing[3], paddingVertical: 4, borderRadius: Radius.full },
  filters: { paddingHorizontal: Spacing[5], paddingVertical: Spacing[2], gap: Spacing[2] },
  scroll: { paddingHorizontal: Spacing[5], paddingTop: Spacing[3], gap: Spacing[3] },
  card: { marginBottom: 0 },
  cardTop: { flexDirection: "row", gap: Spacing[3], alignItems: "flex-start" },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1, gap: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardFooter: {
    flexDirection: "row",
    gap: Spacing[4],
    marginTop: Spacing[3],
    paddingTop: Spacing[3],
    borderTopWidth: 1,
  },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
});
