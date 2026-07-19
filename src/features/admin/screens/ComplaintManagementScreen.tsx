import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";
import { Card } from "@/design-system/components/Card";
import { Badge } from "@/design-system/components/Badge";
import { useAuthStore } from "@/store/AuthStore";
import { env } from "@/config/env";

export default function ComplaintManagementScreen() {
  const { colors, isDark } = useTheme();
  const session = useAuthStore((s) => s.session);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${env.apiUrl}/admin/complaints`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        setComplaints(await res.json());
      }
    } catch (e) {
      console.warn("Failed to fetch complaints", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  };

  const overrideStatus = async (id: string, currentStatus: string) => {
    const statuses = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
    // In a real app, you'd show a modal or ActionSheet to pick status. 
    // Here we'll just toggle to RESOLVED for demo purposes if not resolved, else CLOSED.
    const newStatus = currentStatus === "RESOLVED" ? "CLOSED" : "RESOLVED";

    Alert.alert(
      "Override Status",
      `Are you sure you want to manually set this issue to ${newStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: async () => {
            try {
              const res = await fetch(`${env.apiUrl}/admin/complaints/${id}/status`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ status: newStatus }),
              });
              if (res.ok) {
                fetchComplaints();
              }
            } catch (e) {
              Alert.alert("Error", "Could not update status");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card variant="elevated" style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.titleRow}>
          <Text style={[TextStyles.subtitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Badge label={item.status} variant={item.status === "RESOLVED" ? "success" : "brand"} size="sm" />
        </View>
        <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>{item.trackingId}</Text>
      </View>

      <Text style={[TextStyles.body, { color: colors.textSecondary, marginBottom: Spacing[4] }]} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={s.cardFooter}>
        <View style={s.footerMeta}>
          <LumenIcon name="profile" size="xs" color={colors.textTertiary} />
          <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
            {item.reporter?.fullName || "Citizen"}
          </Text>
        </View>
        <Pressable
          style={[s.actionBtn, { backgroundColor: colors.brand + "20" }]}
          onPress={() => overrideStatus(item.id, item.status)}
        >
          <Text style={[TextStyles.label, { color: colors.brand }]}>Override</Text>
        </Pressable>
      </View>
    </Card>
  );

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <View style={[s.header, { borderBottomColor: colors.borderDefault }]}>
        <Text style={[TextStyles.title, { color: colors.textPrimary }]}>Complaint Logs</Text>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
          }
          ListEmptyComponent={
            <Text style={[TextStyles.body, { color: colors.textSecondary, textAlign: "center" }]}>
              No complaints found in the system.
            </Text>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: Spacing[5], gap: Spacing[4] },
  card: { padding: Spacing[4] },
  cardHeader: { marginBottom: Spacing[3] },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#333",
    paddingTop: Spacing[3],
  },
  footerMeta: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
  actionBtn: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
  },
});
