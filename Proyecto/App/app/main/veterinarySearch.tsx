import React from "react";
import { View, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapScreen from "./mapScreen.tsx";
import { Marker } from "react-native-maps";
import type { Vet } from "../../src/types/index";

interface Props {
  vet: Vet;
}

export function VeterinarySearchScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      {/* Pantalla del mapa */}
      <MapScreen />
      {/* Botón para volver atrás */}
      <Button title="Volver" onPress={() => navigation.goBack()} />
    </View>
  );
}

export const VetMarker: React.FC<Props> = ({ vet }) => {
  if (!vet) return null;

  const tipo =
    vet.source === "amenity" ? "Veterinaria" :
      vet.source === "shop" ? "Tienda" :
        "Lugar";

  const titulo = vet.name?.trim() ? vet.name : tipo;

  return (
    <Marker
      coordinate={{ latitude: vet.latitude, longitude: vet.longitude }}
      pinColor="#2E86AB"
      identifier={vet.id}
      title={titulo}
      description="Ver en Google Maps"
    />
  );
};