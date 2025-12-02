// app/pet/edit_pet_profile.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

interface Pet {
  name: string;
  species: string;
  breed: string;
  weight: string;
  age: string;
  image: string | null;
}

interface Species {
  id: string;
  name: string;
}

const speciesData: Species[] = [
  { id: '1', name: 'Perro' },
  { id: '2', name: 'Gato' },
];

export default function EditPetProfileScreen() {
  const route = useRoute() as { params?: { pet?: Pet } };
  const navigation = useNavigation();
  
  const initialPet = (route.params?.pet as Pet) || {
    name: '',
    species: '',
    breed: '',
    weight: '',
    age: '',
    image: null,
  };

  const [petImage, setPetImage] = useState<string | null>(initialPet.image);
  const [name, setName] = useState(initialPet.name);
  const [species, setSpecies] = useState(initialPet.species);
  const [breed, setBreed] = useState(initialPet.breed);
  const [weight, setWeight] = useState(initialPet.weight);
  const [age, setAge] = useState(initialPet.age);
  
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);

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

  const handleSave = () => {
    if (!name || !species || !breed || !weight || !age) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const updatedPet: Pet = {
      ...initialPet,
      name,
      species,
      breed,
      weight,
      age,
      image: petImage,
    };

    Alert.alert('¡Éxito!', 'Información de la mascota actualizada', [
      {
        text: 'OK',
        onPress: () => {
          navigation.navigate('PetProfile', { pet: updatedPet });
        },
      },
    ]);

    console.log('Datos actualizados:', updatedPet);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar edición',
      '¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí', onPress: () => navigation.goBack() },
      ]
    );
  };

  const getPetIcon = (speciesName: string) => {
    switch (speciesName.toLowerCase()) {
      case 'perro': return '🐶';
      case 'gato': return '🐱';
      case 'conejo': return '🐰';
      case 'ave': return '🐦';
      case 'hamster': return '🐹';
      case 'pez': return '🐠';
      case 'reptil': return '🦎';
      default: return '🐾';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.backButton}>← Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Mascota</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Guardar</Text>
          </TouchableOpacity>
        </View>

        {/* Sección de Foto */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            {petImage ? (
              <Image source={{ uri: petImage }} style={styles.petImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>
                  {species ? getPetIcon(species) : '🐾'}
                </Text>
                <Text style={styles.imagePlaceholderText}>Cambiar Foto</Text>
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
          {/* Nombre */}
          <Text style={styles.label}>Nombre de la Mascota *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Max, Luna, etc."
            value={name}
            onChangeText={setName}
          />

          {/* Especie */}
          <Text style={styles.label}>Especie *</Text>
          <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowSpeciesModal(true)}>
            <Text style={species ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
              {species ? `${getPetIcon(species)} ${species}` : 'Selecciona una especie'}
            </Text>
          </TouchableOpacity>

          {/* Raza */}
          <Text style={styles.label}>Raza *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Labrador, Siames, etc."
            value={breed}
            onChangeText={setBreed}
          />

          {/* Peso */}
          <Text style={styles.label}>Peso (kg) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 5.5"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />

          {/* Edad */}
          <Text style={styles.label}>Edad *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 2 años, 6 meses"
            value={age}
            onChangeText={setAge}
          />

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.saveButtonLarge} onPress={handleSave}>
              <Text style={styles.saveButtonLargeText}>Guardar Cambios</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButtonLarge} onPress={handleCancel}>
              <Text style={styles.cancelButtonLargeText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal para seleccionar especie */}
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
                    <Text style={styles.speciesText}>
                      {getPetIcon(item.name)} {item.name}
                    </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f8f9fa',
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePlaceholderIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  imagePlaceholderText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  cameraButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  cameraButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  dropdownButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    justifyContent: 'center',
  },
  dropdownTextSelected: {
    fontSize: 16,
    color: '#333',
  },
  dropdownTextPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  actionButtons: {
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonLarge: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonLargeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonLarge: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  cancelButtonLargeText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  speciesItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  speciesText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  modalCloseText: {
    color: '#666',
    fontSize: 16,
  },
});