import React from "react";
import { Marker } from "react-native-maps";
import type { Vet } from "../types/vet";

interface Props {
  vet: Vet;
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
