import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Modal,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const speciesData = [
  { id: "1", name: "Perro" },
  { id: "2", name: "Gato" },
];

export default function PetRegister({ navigation }: any) {
  const [petImage, setPetImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);

  // Seleccionar imagen
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tu galería para seleccionar una foto."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPetImage(result.assets[0].uri);
    }
  };

  // Tomar foto
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tu cámara para tomar una foto."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPetImage(result.assets[0].uri);
    }
  };

  const handleSpeciesSelect = (speciesName: string) => {
    setSpecies(speciesName);
    setShowSpeciesModal(false);
  };

  const handleRegister = () => {
    if (!petImage || !name || !species || !breed || !weight || !age) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    const petData = {
      name,
      species,
      breed,
      weight,
      age,
      image: petImage,
    };

    Alert.alert("Éxito", "Mascota registrada correctamente", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);

    console.log("Datos de la mascota:", petData);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrar Nueva Mascota</Text>

      {/* Foto */}
      <View style={styles.imageSection}>
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {petImage ? (
            <Image source={{ uri: petImage }} style={styles.petImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>+ Agregar Foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.cameraButtons}>
          <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
            <Text style={styles.cameraButtonText}>Galería</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
            <Text style={styles.cameraButtonText}>Cámara</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Formulario */}
      <View style={styles.form}>
        <Text style={styles.label}>Nombre de la Mascota *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Max, Luna, etc."
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Especie *</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowSpeciesModal(true)}
        >
          <Text
            style={
              species ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder
            }
          >
            {species || "Selecciona una especie"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Raza *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Labrador, Siames, etc."
          value={breed}
          onChangeText={setBreed}
        />

        <Text style={styles.label}>Peso (kg) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 5.5"
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Edad *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 2 años, 6 meses"
          value={age}
          onChangeText={setAge}
        />

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Registrar Mascota</Text>
        </TouchableOpacity>
      </View>

      {/* Modal especie */}
      <Modal
        visible={showSpeciesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSpeciesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona la Especie</Text>

            <FlatList
              data={speciesData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.speciesItem}
                  onPress={() => handleSpeciesSelect(item.name)}
                >
                  <Text style={styles.speciesText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSpeciesModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A90E2",
    textAlign: "center",
    marginBottom: 20,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#f8f8f8",
    borderWidth: 2,
    borderColor: "#e1e1e1",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  petImage: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: "#666",
    fontSize: 16,
  },
  cameraButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },
  cameraButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cameraButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },
  dropdownButton: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    justifyContent: "center",
  },
  dropdownTextSelected: {
    fontSize: 16,
    color: "#333",
  },
  dropdownTextPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  registerButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  speciesItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  speciesText: {
    fontSize: 16,
    color: "#333",
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
  },
  modalCloseText: {
    color: "#666",
    fontSize: 16,
  },
});
