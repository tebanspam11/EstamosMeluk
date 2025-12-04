import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import MapView, { UrlTile, Marker, Region } from "react-native-maps";

import { MAPTILER_API_KEY } from "../../src/config/mapTiler";
import { useLocation } from "../../src/hooks/useLocation";
import { getVets } from "../../src/services/vetServices";
import type { Vet } from "../../src/types/index";
import { VetMarker } from "./veterinarySearch.tsx";

export default function MapScreen(): React.JSX.Element {
  const { location, loading, errorMsg } = useLocation();
  const mapRef = useRef<MapView | null>(null);

  const [vets, setVets] = useState<Vet[]>([]);
  const [loadingVets, setLoadingVets] = useState<boolean>(false);

  useEffect(() => {
    if (!location) return;

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        900
      );
    }

    setLoadingVets(true);

    getVets(location.latitude, location.longitude)
      .then((result) => {
        if (Array.isArray(result)) {
          setVets(result);
        } else {
          setVets([]);
        }
      })
      .catch(() => setVets([]))
      .finally(() => setLoadingVets(false));
  }, [location]);

  const initialRegion: Region = {
    latitude: location?.latitude ?? 4.711,
    longitude: location?.longitude ?? -74.072,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
        {/* Tiles de MapTiler */}
        <UrlTile
          urlTemplate={`https://api.maptiler.com/tiles/basic/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`}
          maximumZ={19}
          flipY={false}
        />

        {/* Marker: Ubicación del usuario */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Tu ubicación"
            description="Estás aquí"
            pinColor="blue" // <---- icono distinto
            identifier="user-location"
          />
        )}

        {/* Marker: Veterinarias */}
        {vets.map((v) => (
          <VetMarker key={v.id} vet={v} />
        ))}
      </MapView>

      {/* Overlay: cargando ubicación */}
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" />
          <Text style={styles.overlayText}>Obteniendo ubicación...</Text>
        </View>
      )}

      {/* Overlay: cargando veterinarias */}
      {!loading && loadingVets && (
        <View style={styles.overlay}>
          <ActivityIndicator size="small" />
          <Text style={styles.overlayText}>Buscando veterinarias cercanas...</Text>
        </View>
      )}

      {/* Error de permisos */}
      {errorMsg && !loading && (
        <View
          style={[
            styles.overlay,
            { backgroundColor: "rgba(255,255,255,0.95)" },
          ]}
        >
          <Text style={[styles.overlayText, { color: "red" }]}>
            {errorMsg}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 18,
    left: 20,
    right: 20,
    alignItems: "center",
    padding: 8,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 3,
  },
  overlayText: {
    marginTop: 6,
    fontSize: 14,
  },
});
