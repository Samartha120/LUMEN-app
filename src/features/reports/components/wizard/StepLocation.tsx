import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useTheme, Button, Spacing, Radius, TextStyles } from "@/design-system";
import { WizardData } from "../../screens/CreateReportWizard";
import * as Location from "expo-location";

interface StepProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
  onNext: () => void;
}

const DEFAULT_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export function StepLocation({ data, updateData, onNext }: StepProps) {
  const { colors } = useTheme();
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission denied");
        setLoading(false);
        return;
      }
      try {
        let location = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setRegion(newRegion);
        updateData({
          location: {
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
            address: "Fetching...",
          },
        });
      } catch (err) {
        setErrorMsg("Failed to get location");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRegionChangeComplete = async (newRegion: Region) => {
    setRegion(newRegion);
    updateData({
      location: {
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
        address: "123 Smart City Blvd, Tech District", // Mock Address
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          TextStyles.heading2,
          { color: colors.textPrimary, paddingHorizontal: Spacing[5], marginTop: Spacing[4] },
        ]}
      >
        Where is the issue?
      </Text>
      <Text
        style={[
          TextStyles.body,
          {
            color: colors.textSecondary,
            paddingHorizontal: Spacing[5],
            marginTop: Spacing[2],
            marginBottom: Spacing[4],
          },
        ]}
      >
        Drag the map to pin the exact location.
      </Text>

      <View
        style={[
          styles.mapContainer,
          {
            marginHorizontal: Spacing[5],
            borderRadius: Radius.lg,
            borderColor: colors.borderDefault,
          },
        ]}
      >
        {loading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.bgSurface }]}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={[TextStyles.body, { color: colors.textSecondary, marginTop: Spacing[4] }]}>
              Finding your location...
            </Text>
          </View>
        ) : (
          <>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={region}
              onRegionChangeComplete={handleRegionChangeComplete}
              showsUserLocation
              showsMyLocationButton
            />
            <View style={styles.centerPinContainer} pointerEvents="none">
              <View
                style={[
                  styles.centerPin,
                  { backgroundColor: "#F04438", borderColor: colors.bgBase },
                ]}
              />
              <View style={styles.centerPinShadow} />
            </View>
          </>
        )}
      </View>

      <View style={{ padding: Spacing[5] }}>
        <Text
          style={[
            TextStyles.bodySmall,
            { color: colors.textSecondary, textTransform: "uppercase" },
          ]}
        >
          Selected Location
        </Text>
        <Text
          style={[
            TextStyles.bodyMedium,
            { color: colors.textPrimary, marginTop: Spacing[1], fontWeight: "500" },
          ]}
        >
          {data.location?.address || (errorMsg ? errorMsg : "Locating...")}
        </Text>
      </View>

      <View style={[styles.footer, { padding: Spacing[5], borderTopColor: colors.borderDefault }]}>
        <Button
          label="Confirm Location"
          onPress={onNext}
          disabled={!data.location || !!errorMsg}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1, overflow: "hidden", borderWidth: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerPinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -30,
    alignItems: "center",
  },
  centerPin: { width: 30, height: 30, borderWidth: 3, borderRadius: 15 },
  centerPinShadow: {
    width: 10,
    height: 4,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 2,
    marginTop: 2,
  },
  footer: { borderTopWidth: 1 },
});
