import React, { useState } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Datos para las especies
const speciesData = [
  { id: '1', name: 'Perro' },
  { id: '2', name: 'Gato' },
];

export default function UploadScreen({ navigation }: any) {

  // 🔵 TU BACKEND PARA WEB (USA localhost)
  const API_URL = "http://localhost:4000";

  const [petImage, setPetImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);

  // Función para seleccionar imagen
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso necesario',
        'Necesitamos acceso a tu galería para seleccionar una foto.'
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

  // Función para tomar foto
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu cámara para tomar una foto.');
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

  // 🔵 FUNCION EDITADA PARA ENVIAR DATOS AL BACKEND
  const handleRegister = async () => {
    if (!name || !species || !breed || !weight || !age) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      console.log("➡️ Enviando datos a:", `${API_URL}/mascotas`);

      const body = {
        id_usuario: 1, // TEMPORAL
        nombre: name,
        especie: species,
        raza: breed,
        peso: parseFloat(weight),
        edad: parseInt(age)
      };

      const response = await fetch(`${API_URL}/mascotas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      console.log("📩 Respuesta backend:", data);

      if (!response.ok) {
        Alert.alert("Error", "No se pudo registrar la mascota");
        return;
      }

      Alert.alert("Éxito", "Mascota registrada correctamente", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.log("❌ Error al conectar con backend:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrar Nueva Mascota</Text>

      {/* Sección de Foto */}
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
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowSpeciesModal(true)}>
          <Text style={species ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
            {species || 'Selecciona una especie'}
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
          placeholder="Ej: 2"
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
        />

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Registrar Mascota</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
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

const styles = StyleSheet.create({
  // (estilos igual que los tuyos, no se tocaron)
});
