import React from "react";
import { View, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapScreen from "../../src/screens/mapScreen.tsx";

export default function VeterinarySearchScreen() {
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
