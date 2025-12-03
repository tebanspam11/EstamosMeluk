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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../src/config/api';
import { formatName } from '../../src/utils/formatName';

interface Pet {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  fecha_nacimiento: Date;
  color?: string;
  sexo: 'Macho' | 'Hembra';
  foto?: string;
  peso?: number;
  alergias?: string;
  enfermedades?: string;
  notas_adicionales?: string;
}

export default function EditPetProfileScreen() {
  const route = useRoute() as { params?: { pet?: Pet } };
  const navigation = useNavigation();
  
  const petFromRoute = route.params?.pet;

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
  
  const [originalNombre, setOriginalNombre] = useState('');
  const [originalEspecie, setOriginalEspecie] = useState('');
  const [originalRaza, setOriginalRaza] = useState('');
  const [originalSexo, setOriginalSexo] = useState('');
  const [originalColor, setOriginalColor] = useState('');
  const [originalFechaNacimiento, setOriginalFechaNacimiento] = useState('');
  const [originalPeso, setOriginalPeso] = useState('');
  const [originalAlergias, setOriginalAlergias] = useState('');
  const [originalEnfermedades, setOriginalEnfermedades] = useState('');
  const [originalObservaciones, setOriginalObservaciones] = useState('');
  const [originalFoto, setOriginalFoto] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [showSexModal, setShowSexModal] = useState(false);

  const speciesData = [
    { id: '1', name: 'Perro' },
    { id: '2', name: 'Gato' },
  ];

  useFocusEffect(
    React.useCallback(() => {
      validateActiveSession();
      if (petFromRoute) cargarDatosMascota();
    }, [petFromRoute])
  );

  const validateActiveSession = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' as never }],
      });
    }
  };

  const cargarDatosMascota = async () => {
    setLoading(true);
    
    if (petFromRoute) {
      const fechaStr = petFromRoute.fecha_nacimiento 
        ? new Date(petFromRoute.fecha_nacimiento).toISOString().split('T')[0]
        : '';
      
      setNombre(petFromRoute.nombre || '');
      setEspecie(petFromRoute.especie || '');
      setRaza(petFromRoute.raza || '');
      setSexo(petFromRoute.sexo || '');
      setColor(petFromRoute.color || '');
      setFechaNacimiento(fechaStr);
      setPeso(petFromRoute.peso?.toString() || '');
      setAlergias(petFromRoute.alergias || '');
      setEnfermedades(petFromRoute.enfermedades || '');
      setObservaciones(petFromRoute.notas_adicionales || '');
      setPetImage(petFromRoute.foto || null);
      
      setOriginalNombre(petFromRoute.nombre || '');
      setOriginalEspecie(petFromRoute.especie || '');
      setOriginalRaza(petFromRoute.raza || '');
      setOriginalSexo(petFromRoute.sexo || '');
      setOriginalColor(petFromRoute.color || '');
      setOriginalFechaNacimiento(fechaStr);
      setOriginalPeso(petFromRoute.peso?.toString() || '');
      setOriginalAlergias(petFromRoute.alergias || '');
      setOriginalEnfermedades(petFromRoute.enfermedades || '');
      setOriginalObservaciones(petFromRoute.notas_adicionales || '');
      setOriginalFoto(petFromRoute.foto || null);
    }
    
    setLoading(false);
  };

  const isFormValid = () => {
    if (!nombre.trim() || !especie.trim() || !raza.trim() || !sexo.trim() || !fechaNacimiento.trim()) {
      return false;
    }

    const hasChanges = 
      nombre !== originalNombre ||
      especie !== originalEspecie ||
      raza !== originalRaza ||
      sexo !== originalSexo ||
      color !== originalColor ||
      fechaNacimiento !== originalFechaNacimiento ||
      peso !== originalPeso ||
      alergias !== originalAlergias ||
      enfermedades !== originalEnfermedades ||
      observaciones !== originalObservaciones ||
      petImage !== originalFoto;

    return hasChanges;
  };

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
    setEspecie(speciesName);
    setShowSpeciesModal(false);
  };

  const handleSave = async () => {
    if (!petFromRoute) {
      Alert.alert('Error', 'No se encontró la información de la mascota');
      return;
    }

    setSaving(true);

    const token = await AsyncStorage.getItem('token');

    const updateData: any = {
      nombre,
      especie,
      raza,
      sexo,
      color: color || null,
      fecha_nacimiento: new Date(fechaNacimiento).toISOString(),
      peso: peso ? parseFloat(peso.replace(',', '.')) : null,
      foto: petImage,
      alergias: alergias || null,
      enfermedades: enfermedades || null,
      observaciones: observaciones || null,
    };

    const response = await fetch(`${API_URL}/mascotas/${petFromRoute.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (response.ok) {
      Alert.alert('Éxito', 'Mascota actualizada correctamente', [
        { 
          text: 'OK', 
          onPress: () => navigation.goBack()
        },
      ]);
    } else {
      Alert.alert('Error', data?.error);
    }
    setSaving(false);
  };

  const getPetIcon = (speciesName: string) => {
    if (!speciesName) return '🐾';
    switch (speciesName.toLowerCase()) {
      case 'perro': return '🐶';
      case 'gato': return '🐱';
      default: return '🐾';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
            </TouchableOpacity>
            <Text style={styles.title}>Editar Mascota</Text>
            <Text style={styles.subtitle}>Actualiza la información de tu mascota</Text>
          </View>

          {/* Sección de Foto */}
          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              {petImage ? (
                <Image source={{ uri: petImage }} style={styles.petImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderIcon}>
                    {especie ? getPetIcon(especie) : '🐾'}
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
              placeholderTextColor="#999"
              value={nombre}
              onChangeText={(text) => setNombre(formatName(text))}
              autoCapitalize="words"
            />

            {/* Especie */}
            <Text style={styles.label}>Especie *</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowSpeciesModal(true)}>
              <Text style={especie ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
                {especie ? `${getPetIcon(especie)} ${especie}` : 'Selecciona una especie'}
              </Text>
            </TouchableOpacity>

            {/* Raza */}
            <Text style={styles.label}>Raza *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Labrador, Siamés, etc."
              placeholderTextColor="#999"
              value={raza}
              onChangeText={(text) => setRaza(formatName(text))}
              autoCapitalize="words"
            />

            {/* Sexo */}
            <Text style={styles.label}>Sexo *</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowSexModal(true)}>
              <Text style={sexo ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
                {sexo || 'Selecciona el sexo'}
              </Text>
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
            <TextInput
              style={styles.input}
              placeholder="AAAA-MM-DD (Ej: 2022-05-15)"
              placeholderTextColor="#999"
              value={fechaNacimiento}
              onChangeText={setFechaNacimiento}
            />

            {/* Peso */}
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 5.5"
              placeholderTextColor="#999"
              value={peso}
              onChangeText={setPeso}
              keyboardType="decimal-pad"
            />

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

            {/* Botón de Guardar */}
            <TouchableOpacity 
              style={[
                styles.saveButtonLarge, 
                (!isFormValid() || saving) && styles.saveButtonDisabled
              ]} 
              onPress={handleSave}
              disabled={!isFormValid() || saving}
            >
              <Text style={styles.saveButtonLargeText}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Text>
            </TouchableOpacity>

            {/* Botón Cancelar */}
            <TouchableOpacity 
              style={styles.cancelButtonLarge} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonLargeText}>Cancelar</Text>
            </TouchableOpacity>
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

          {/* Modal para seleccionar sexo */}
          <Modal
            visible={showSexModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowSexModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Selecciona el Sexo</Text>
                <TouchableOpacity
                  style={styles.speciesItem}
                  onPress={() => { setSexo('Macho'); setShowSexModal(false); }}
                >
                  <Text style={styles.speciesText}>Macho</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.speciesItem}
                  onPress={() => { setSexo('Hembra'); setShowSexModal(false); }}
                >
                  <Text style={styles.speciesText}>Hembra</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowSexModal(false)}
                >
                  <Text style={styles.modalCloseText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
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
    textAlign: 'center',
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
    overflow: 'hidden',
  },
  petImage: {
    width: '100%',
    height: '100%',
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
  saveButtonDisabled: {
    backgroundColor: '#99C5E8',
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