// ============================================================
// LUMEN — My Reports Screen
// Phase 3: Citizen Experience
// ============================================================
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  StatusBar, RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Badge } from "@/design-system/components/Badge";
import { Chip } from "@/design-system/components/Badge";
import { Card } from "@/design-system/components/Card";
import { EmptyState } from "@/design-system/components/Extras";
import { SearchBar } from "@/design-system/components/Extras";
import { Avatar } from "@/design-system/components/Avatar";
import { LinearProgress } from "@/design-system/components/Progress";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";
import type { LumenIconName } from "@/design-system";

type Status = "all" | "pending" | "in_progress" | "resolved";

const FILTERS: { id: Status; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "resolved", label: "Resolved" },
];

interface ReportItem {
  id: string;
  title: string;
  category: LumenIconName;
  status: Exclude<Status, "all">;
  time: string;
  priority: "high" | "medium" | "low";
  progress: number;
  engineer?: string;
}

const REPORTS: ReportItem[] = [
  { id: "R001", title: "Large pothole on MG Road near City Bank", category: "road", status: "in_progress", time: "2h ago", priority: "high", progress: 65, engineer: "Rajesh K." },
  { id: "R002", title: "Street light not working near Park Ave", category: "streetlight", status: "pending", time: "5h ago", priority: "medium", progress: 0 },
  { id: "R003", title: "Water pipeline leakage on 5th Cross", category: "water", status: "resolved", time: "Yesterday", priority: "high", progress: 100, engineer: "Priya S." },
  { id: "R004", title: "Garbage overflow at Gandhi Nagar", category: "garbage", status: "pending", time: "3h ago", priority: "low", progress: 0 },
  { id: "R005", title: "Electrical sparks near residential area", category: "electricity", status: "in_progress", time: "1 day ago", priority: "high", progress: 40, engineer: "Suresh M." },
];

const STATUS_CONFIG: Record<Exclude<Status,"all">, { label: string; variant: any; progress: string }> = {
  pending: { label: "Pending", variant: "warning", progress: "#F79009" },
  in_progress: { label: "In Progress", variant: "info", progress: "#208AEF" },
  resolved: { label: "Resolved", variant: "success", progress: "#12B76A" },
};

const PRIORITY_COLOR: Record<string, string> = { high: "#F04438", medium: "#F79009", low: "#12B76A" };

export default function MyReportScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [filter, setFilter] = useState<Status>("all");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filtered = REPORTS.filter((r) => {
    const matchFilter = filter === "all" || r.status === filter;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bgBase} />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.borderDefault }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <LumenIcon name="back" size="md" color={colors.textPrimary} strokeWidth={2.5} />
        </Pressable>
        <Text style={[TextStyles.title, { color: colors.textPrimary }]}>My Reports</Text>
        <View style={[s.countBadge, { backgroundColor: colors.brandSoft }]}>
          <Text style={[TextStyles.label, { color: colors.brand }]}>{REPORTS.length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: Spacing[5], paddingVertical: Spacing[3] }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search your reports…" />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
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

      {/* Report List */}
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await new Promise(r => setTimeout(r, 1000)); setRefreshing(false); }} tintColor={colors.brand} />}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="reportList"
            title="No reports found"
            description="You haven't filed any reports in this category yet."
            actionLabel="Report an Issue"
            onAction={() => router.push("/(citizen)/Report-issue" as any)}
          />
        ) : (
          filtered.map((report) => {
            const sc = STATUS_CONFIG[report.status];
            return (
              <Card
                key={report.id}
                variant="elevated"
                padding={Spacing[4]}
                onPress={() => router.push("/(citizen)/Report-details" as any)}
                style={s.card}
              >
                {/* Top row */}
                <View style={s.cardTop}>
                  <View style={[s.catIcon, { backgroundColor: PRIORITY_COLOR[report.priority] + "15" }]}>
                    <LumenIcon name={report.category} size="md" color={PRIORITY_COLOR[report.priority]} strokeWidth={2} />
                  </View>
                  <View style={s.cardInfo}>
                    <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary }]} numberOfLines={2}>
                      {report.title}
                    </Text>
                    <View style={s.cardMeta}>
                      <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>#{report.id}</Text>
                      <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>·</Text>
                      <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>{report.time}</Text>
                    </View>
                  </View>
                  <Badge label={sc.label} variant={sc.variant} size="sm" />
                </View>

                {/* Progress */}
                {report.progress > 0 && (
                  <View style={s.progressSection}>
                    <View style={s.progressHeader}>
                      <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>Completion</Text>
                      <Text style={[TextStyles.label, { color: sc.progress }]}>{report.progress}%</Text>
                    </View>
                    <LinearProgress progress={report.progress} color={sc.progress} height={5} />
                  </View>
                )}

                {/* Engineer */}
                {report.engineer && (
                  <View style={s.engineerRow}>
                    <Avatar name={report.engineer} size="xs" role="engineer" />
                    <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                      Assigned to <Text style={{ fontWeight: "600" }}>{report.engineer}</Text>
                    </Text>
                  </View>
                )}
              </Card>
            );
          })
        )}
        <View style={{ height: Spacing[10] }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: Spacing[5], paddingTop: 52, paddingBottom: Spacing[4],
    borderBottomWidth: 1,
  },
  countBadge: { paddingHorizontal: Spacing[3], paddingVertical: 4, borderRadius: Radius.full },
  filters: { paddingHorizontal: Spacing[5], paddingVertical: Spacing[2], gap: Spacing[2] },
  scroll: { paddingHorizontal: Spacing[5], paddingTop: Spacing[3], gap: Spacing[3] },
  card: { marginBottom: 0 },
  cardTop: { flexDirection: "row", gap: Spacing[3], alignItems: "flex-start" },
  catIcon: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1, gap: 4 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  progressSection: { gap: Spacing[1.5], marginTop: Spacing[2] },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  engineerRow: { flexDirection: "row", alignItems: "center", gap: Spacing[2], marginTop: Spacing[2] },
});
