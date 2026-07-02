// ============================================================
// LUMEN — Navigation Screen (Engineer)
// Phase 4: Engineer Experience
// ============================================================
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { Card } from "@/design-system/components/Card";
import { Button } from "@/design-system/components/Button";
import { Badge } from "@/design-system/components/Badge";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";

const DIRECTIONS = [
  { icon: "forward", instruction: "Head north on MG Road", distance: "0.3 km", time: "2 min" },
  { icon: "chevronRight", instruction: "Turn right at City Bank signal", distance: "0.5 km", time: "4 min" },
  { icon: "forward", instruction: "Continue on 1st Main Road", distance: "0.2 km", time: "2 min" },
  { icon: "chevronLeft", instruction: "Turn left at Park Avenue", distance: "0.1 km", time: "1 min" },
  { icon: "mapPin", instruction: "Arrive at destination (Right side)", distance: "—", time: "—" },
];

export default function NavigationScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [navigating, setNavigating] = useState(false);

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bgBase} />

      <View style={[s.header, { borderBottomColor: colors.borderDefault }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <LumenIcon name="back" size="md" color={colors.textPrimary} strokeWidth={2.5} />
        </Pressable>
        <Text style={[TextStyles.title, { color: colors.textPrimary }]}>Navigation</Text>
        <Badge label={navigating ? "Live" : "Preview"} variant={navigating ? "success" : "neutral"} dot={navigating} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Map Placeholder */}
        <View style={[s.mapArea, { backgroundColor: colors.bgSubtle }]}>
          {/* Fake route line */}
          <View style={[s.routeLine, { backgroundColor: colors.brand }]} />
          {/* Origin marker */}
          <View style={[s.originMarker, { backgroundColor: "#12B76A" }]}>
            <LumenIcon name="locate" size="sm" color="#FFF" strokeWidth={2.5} />
          </View>
          {/* Destination marker */}
          <View style={[s.destMarker, { backgroundColor: colors.brand }]}>
            <LumenIcon name="mapPin" size="sm" color="#FFF" strokeWidth={2.5} />
          </View>
          {/* Overlay info */}
          <View style={[s.mapOverlay, { backgroundColor: colors.bgGlass, borderColor: colors.borderGlass }]}>
            <View style={s.etaRow}>
              <Text style={[TextStyles.heading2, { color: colors.textPrimary }]}>12 min</Text>
              <Text style={[TextStyles.body, { color: colors.textSecondary }]}>· 1.2 km away</Text>
            </View>
            <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>123 MG Road, Bangalore</Text>
          </View>
        </View>

        {/* Route Summary */}
        <Card variant="elevated" style={s.routeCard}>
          <View style={s.routeHeader}>
            <View style={s.routeInfo}>
              <Text style={[TextStyles.subtitle, { color: colors.textPrimary }]}>Route Summary</Text>
              <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Optimal route · Light traffic</Text>
            </View>
            <Badge label="Fastest" variant="success" size="sm" />
          </View>
          <View style={[s.routeStats, { borderColor: colors.borderDefault }]}>
            {[
              { label: "Distance", value: "1.2 km" },
              { label: "ETA", value: "~12 min" },
              { label: "Traffic", value: "Light" },
            ].map(({ label, value }) => (
              <View key={label} style={s.routeStat}>
                <Text style={[TextStyles.subtitle, { color: colors.textPrimary }]}>{value}</Text>
                <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>{label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Turn-by-Turn */}
        <Card variant="elevated" style={s.directionsCard}>
          <Text style={[TextStyles.subtitle, { color: colors.textPrimary, marginBottom: Spacing[4] }]}>
            Turn-by-Turn Directions
          </Text>
          {DIRECTIONS.map((d, i) => (
            <View key={i} style={s.dirRow}>
              <View style={s.dirLeft}>
                <View style={[s.dirIconWrap, { backgroundColor: i === DIRECTIONS.length - 1 ? colors.brand + "15" : colors.bgSubtle }]}>
                  <LumenIcon name={d.icon as any} size="sm" color={i === DIRECTIONS.length - 1 ? colors.brand : colors.textSecondary} strokeWidth={2} />
                </View>
                {i < DIRECTIONS.length - 1 && <View style={[s.dirLine, { backgroundColor: colors.borderDefault }]} />}
              </View>
              <View style={s.dirContent}>
                <Text style={[TextStyles.bodyMedium, { color: colors.textPrimary }]}>{d.instruction}</Text>
                {d.distance !== "—" && (
                  <View style={s.dirMeta}>
                    <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>{d.distance}</Text>
                    <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>·</Text>
                    <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>{d.time}</Text>
                  </View>
                )}
                {i < DIRECTIONS.length - 1 && <View style={{ height: Spacing[4] }} />}
              </View>
            </View>
          ))}
        </Card>

        {/* CTA */}
        <View style={s.ctaRow}>
          {navigating ? (
            <Button
              label="Stop Navigation"
              variant="danger"
              size="lg"
              fullWidth
              iconLeft="close"
              onPress={() => setNavigating(false)}
            />
          ) : (
            <Button
              label="Start Navigation"
              variant="primary"
              size="lg"
              fullWidth
              iconLeft="navigate2"
              onPress={() => setNavigating(true)}
            />
          )}
        </View>

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
  mapArea: {
    height: 240, position: "relative",
    alignItems: "center", justifyContent: "center",
  },
  routeLine: {
    position: "absolute", width: 3, height: "50%",
    top: "20%", opacity: 0.6, borderRadius: 2,
  },
  originMarker: {
    position: "absolute", top: "18%", width: 36, height: 36,
    borderRadius: 18, alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "#FFF",
  },
  destMarker: {
    position: "absolute", bottom: "16%", width: 36, height: 36,
    borderRadius: 18, alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "#FFF",
  },
  mapOverlay: {
    position: "absolute", bottom: 16, left: 16, right: 16,
    padding: Spacing[4], borderRadius: Radius["2xl"], borderWidth: 1,
  },
  etaRow: { flexDirection: "row", alignItems: "baseline", gap: Spacing[2] },
  routeCard: { marginHorizontal: Spacing[5], marginTop: Spacing[4], gap: Spacing[4] },
  routeHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  routeInfo: { gap: 2 },
  routeStats: {
    flexDirection: "row", borderTopWidth: 1, paddingTop: Spacing[4], marginTop: Spacing[2],
  },
  routeStat: { flex: 1, alignItems: "center", gap: 2 },
  directionsCard: { margin: Spacing[5], marginTop: Spacing[4] },
  dirRow: { flexDirection: "row", gap: Spacing[3] },
  dirLeft: { alignItems: "center" },
  dirIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dirLine: { width: 2, flex: 1, minHeight: 12 },
  dirContent: { flex: 1 },
  dirMeta: { flexDirection: "row", gap: 4, marginTop: 4 },
  ctaRow: { paddingHorizontal: Spacing[5] },
});
