import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../src/config/api';
import { formatName } from '../../src/utils/formatName';

const speciesData = [
  { id: '1', name: 'Perro' },
  { id: '2', name: 'Gato' },
];

export default function PetRegisterScreen({ navigation }: any) {
  const [petImage, setPetImage] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [sexo, setSexo] = useState('');
  const [color, setColor] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [peso, setPeso] = useState('');
  const [alergias, setAlergias] = useState('');
  const [enfermedades, setEnfermedades] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [showSexModal, setShowSexModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFormValid = nombre.trim() !== '' && especie.trim() !== '' && raza.trim() !== '' && sexo.trim() !== '' && fechaNacimiento.trim() !== '';

  useFocusEffect(
    React.useCallback(() => {
      validateActiveSession();
    }, [])
  );

  const validateActiveSession = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) navigation.replace('Login');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería para seleccionar una foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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
    setEspecie(speciesName);
    setShowSpeciesModal(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');

    const petData = {
      nombre,
      especie,
      raza,
      sexo,
      fecha_nacimiento: new Date(fechaNacimiento).toISOString(),
      color: color || null,
      peso: peso ? parseFloat(peso.replace(',', '.')) : null,
      foto: petImage,
      alergias: alergias || null,
      enfermedades: enfermedades || null,
      observaciones: observaciones || null,
    };

    const response = await fetch(`${API_URL}/mascotas`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(petData),
    });

    const data = await response.json();

    if (response.ok) {
      Alert.alert('Éxito', 'Mascota registrada correctamente', [{ text: 'OK', onPress: () => navigation.replace('Home') }]);
    } else {
      Alert.alert('Error', data.error || 'No se pudo registrar la mascota');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Registrar Nueva Mascota</Text>
          <Text style={styles.subtitle}>Agrega a tu compañero a PocketVet</Text>
        </View>

        {/* Sección de Foto */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            {petImage ? (
              <Image source={{ uri: petImage }} style={styles.petImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>📷</Text>
                <Text style={styles.imagePlaceholderSubtext}>Agregar Foto</Text>
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
          <TextInput style={styles.input} placeholder="Ej: Max, Luna, etc." placeholderTextColor="#999" value={nombre} onChangeText={(text) => setNombre(formatName(text))} autoCapitalize="words" />

          {/* Especie */}
          <Text style={styles.label}>Especie *</Text>
          <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowSpeciesModal(true)}>
            <Text style={especie ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>{especie || 'Selecciona una especie'}</Text>
          </TouchableOpacity>

          {/* Raza */}
          <Text style={styles.label}>Raza *</Text>
          <TextInput style={styles.input} placeholder="Ej: Labrador, Siamés, etc." placeholderTextColor="#999" value={raza} onChangeText={(text) => setRaza(formatName(text))} autoCapitalize="words" />

          {/* Sexo */}
          <Text style={styles.label}>Sexo *</Text>
          <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowSexModal(true)}>
            <Text style={sexo ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>{sexo || 'Selecciona el sexo'}</Text>
          </TouchableOpacity>

          {/* Color */}
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Negro, Blanco, Café, etc."
            placeholderTextColor="#999"
            value={color}
            onChangeText={(text) => setColor(formatName(text))}
            autoCapitalize="words"
          />

          {/* Fecha de Nacimiento */}
          <Text style={styles.label}>Fecha de Nacimiento *</Text>
          <TextInput style={styles.input} placeholder="AAAA-MM-DD (Ej: 2022-05-15)" placeholderTextColor="#999" value={fechaNacimiento} onChangeText={setFechaNacimiento} />

          {/* Peso */}
          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput style={styles.input} placeholder="Ej: 5.5" placeholderTextColor="#999" value={peso} onChangeText={setPeso} keyboardType="decimal-pad" />

          {/* Alergias */}
          <Text style={styles.label}>Alergias</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Polen, polvo, alimentos específicos..."
            placeholderTextColor="#999"
            value={alergias}
            onChangeText={setAlergias}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Enfermedades */}
          <Text style={styles.label}>Enfermedades</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Diabetes, artritis, problemas cardíacos..."
            placeholderTextColor="#999"
            value={enfermedades}
            onChangeText={setEnfermedades}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Observaciones */}
          <Text style={styles.label}>Observaciones</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Cualquier información adicional relevante..."
            placeholderTextColor="#999"
            value={observaciones}
            onChangeText={setObservaciones}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Botón de Registro */}
          <TouchableOpacity style={[styles.registerButton, (!isFormValid || loading) && styles.registerButtonDisabled]} onPress={handleRegister} disabled={!isFormValid || loading}>
            <Text style={styles.registerButtonText}>{loading ? 'Registrando...' : 'Registrar Mascota'}</Text>
          </TouchableOpacity>

          {/* Botón Cancelar */}
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* Modal para seleccionar especie */}
        <Modal visible={showSpeciesModal} animationType="slide" transparent={true} onRequestClose={() => setShowSpeciesModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona la Especie</Text>
              <FlatList
                data={speciesData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.speciesItem} onPress={() => handleSpeciesSelect(item.name)}>
                    <Text style={styles.speciesText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowSpeciesModal(false)}>
                <Text style={styles.modalCloseText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal para seleccionar sexo */}
        <Modal visible={showSexModal} animationType="slide" transparent={true} onRequestClose={() => setShowSexModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona el Sexo</Text>
              <TouchableOpacity
                style={styles.speciesItem}
                onPress={() => {
                  setSexo('Macho');
                  setShowSexModal(false);
                }}
              >
                <Text style={styles.speciesText}>Macho</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.speciesItem}
                onPress={() => {
                  setSexo('Hembra');
                  setShowSexModal(false);
                }}
              >
                <Text style={styles.speciesText}>Hembra</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowSexModal(false)}>
                <Text style={styles.modalCloseText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f8f8f8',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 40,
    marginBottom: 5,
  },
  imagePlaceholderSubtext: {
    color: '#666',
    fontSize: 14,
  },
  cameraButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  cameraButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  form: {
    marginBottom: 20,
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
    marginBottom: 18,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  dropdownButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
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
  registerButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonDisabled: {
    backgroundColor: '#99C5E8',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 17,
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
