import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../src/config/api';

interface Pet {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  fecha_nacimiento: Date;
  color: string;
  sexo: 'Macho' | 'Hembra';
  foto: string;
  peso?: number;
  microchip?: string;
  notas_adicionales?: string;
}

export default function PetProfileScreen({ route }: any) {
  const navigation = useNavigation();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showPetsModal, setShowPetsModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadPets();
      if (selectedPet) {
        reloadSelectedPet(selectedPet.id);
      }
      if (route?.params?.pet) {
        const updatedPet = route.params.pet;
        setSelectedPet(updatedPet);
      }
    }, [route?.params?.pet])
  );

  const loadPets = async () => {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_URL}/mascotas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      setPets(data);
      if (selectedPet) {
        const updatedPet = data.find((p: Pet) => p.id === selectedPet.id);
        if (updatedPet) {
          setSelectedPet(updatedPet);
        }
      } else if (data.length > 0 && !route?.params?.pet) {
        setSelectedPet(data[0]);
      }
    }
  };

  const reloadSelectedPet = async (petId: number) => {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_URL}/mascotas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      setSelectedPet(data)
    }
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (today.getDate() < birth.getDate()) {
      months--;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years === 0) {
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else if (months === 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    } else {
      return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPetIcon = (tipo: string) => {
    if (!tipo) return '🐾';
    switch (tipo.toLowerCase()) {
      case 'perro':
        return '🐶';
      case 'gato':
        return '🐱';
      default:
        return '🐾';
    }
  };

  const handleEliminarMascota = () => {
    if (!selectedPet) return;

    Alert.alert(
      '⚠️ Eliminar mascota',
      `Esta acción es irreversible. Se eliminarán todos los datos de ${selectedPet.nombre}, incluyendo su carnet, historial médico, eventos y documentos. ¿Estás completamente seguro?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar definitivamente',
          style: 'destructive',
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${API_URL}/mascotas/${selectedPet.id}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              Alert.alert('Éxito', `${selectedPet.nombre} ha sido eliminado exitosamente.`, [{ text: 'OK', onPress: () => navigation.navigate('Home') }]);
            } else {
              Alert.alert('Error', '⚠︎ No se pudo eliminar la mascota. Intenta nuevamente.');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditPetProfile', { pet: selectedPet });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Selector de Mascota con botón de editar */}
      <View style={styles.selectorRow}>
        <TouchableOpacity style={styles.petSelector} onPress={() => setShowPetsModal(true)}>
          <Image source={{ uri: selectedPet?.foto }} style={styles.petSelectorImage} />
          <View style={styles.petSelectorInfo}>
            <Text style={styles.petSelectorName}>{selectedPet ? selectedPet.nombre : 'Seleccionar mascota'}</Text>
            <Text style={styles.petSelectorDetails}>{selectedPet ? `${getPetIcon(selectedPet.especie)} ${selectedPet.raza} • ${selectedPet.sexo}` : 'Toca para seleccionar'}</Text>
          </View>
          <Text style={styles.selectorArrow}>▼</Text>
        </TouchableOpacity>

        {selectedPet && (
          <TouchableOpacity style={styles.editIconButton} onPress={() => navigation.navigate('EditPetProfile', { pet: selectedPet })}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedPet && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Foto y Información Principal */}
          <View style={styles.profileHeader}>
            <Image source={{ uri: selectedPet.foto }} style={styles.profileImage} />
            <View style={styles.profileBasicInfo}>
              <Text style={styles.petName}>{selectedPet.nombre}</Text>
              <Text style={styles.petBreed}>
                {getPetIcon(selectedPet.especie)} {selectedPet.raza}
              </Text>
              <Text style={styles.petAge}>{calculateAge(selectedPet.fecha_nacimiento)}</Text>
            </View>
          </View>

          {/* Estadísticas Rápidas */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber} numberOfLines={1}>
                {selectedPet.peso != null ? `${selectedPet.peso} kg` : 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Peso Actual</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber} numberOfLines={1}>
                {selectedPet.sexo}
              </Text>
              <Text style={styles.statLabel}>Sexo</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
                {selectedPet.color || 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Color</Text>
            </View>
          </View>

          {/* Información Detallada */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>📋 Información General</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>{selectedPet.nombre}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Especie:</Text>
              <Text style={styles.infoValue}>{selectedPet.especie}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Raza:</Text>
              <Text style={styles.infoValue}>{selectedPet.raza}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de Nacimiento:</Text>
              <Text style={styles.infoValue}>{formatDate(selectedPet.fecha_nacimiento)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Edad:</Text>
              <Text style={styles.infoValue}>{calculateAge(selectedPet.fecha_nacimiento)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sexo:</Text>
              <Text style={styles.infoValue}>{selectedPet.sexo}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Color:</Text>
              <Text style={styles.infoValue}>{selectedPet.color}</Text>
            </View>

            {selectedPet.peso && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Peso Actual:</Text>
                <Text style={styles.infoValue}>{selectedPet.peso} kg</Text>
              </View>
            )}

            {selectedPet.microchip && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Microchip:</Text>
                <Text style={styles.infoValue}>{selectedPet.microchip}</Text>
              </View>
            )}
          </View>

          {/* Notas Adicionales */}
          {selectedPet.notas_adicionales && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>📝 Notas Adicionales</Text>
              <Text style={styles.notesText}>{selectedPet.notas_adicionales}</Text>
            </View>
          )}

          {/* Acciones Rápidas */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>🚀 Acciones Rápidas</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Carnet')}>
                <Text style={styles.actionIcon}>💉</Text>
                <Text style={styles.actionText}>Carnet</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ClinicHistory')}>
                <Text style={styles.actionIcon}>🏥</Text>
                <Text style={styles.actionText}>Historial</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Calendar')}>
                <Text style={styles.actionIcon}>📅</Text>
                <Text style={styles.actionText}>Recordatorios</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
                <Text style={styles.actionIcon}>✏️</Text>
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón Eliminar Mascota */}
          <View style={styles.deleteSection}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleEliminarMascota}>
              <Text style={styles.deleteButtonText}>Eliminar Mascota</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Modal Seleccionar Mascota */}
      <Modal visible={showPetsModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Mascota</Text>
            <ScrollView style={styles.petsList}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.petOption}
                  onPress={() => {
                    setSelectedPet(pet);
                    setShowPetsModal(false);
                  }}
                >
                  <Image source={{ uri: pet.foto }} style={styles.petOptionImage} />
                  <View style={styles.petOptionInfo}>
                    <Text style={styles.petOptionName}>{pet.nombre}</Text>
                    <Text style={styles.petOptionDetails}>
                      {getPetIcon(pet.especie)} {pet.raza} • {pet.sexo}
                    </Text>
                    <Text style={styles.petOptionAge}>{calculateAge(pet.fecha_nacimiento)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPetsModal(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  backButton: {
    fontSize: 24,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 18,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginBottom: 10,
  },
  petSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  editIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  editIcon: {
    fontSize: 28,
  },
  petSelectorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  petSelectorInfo: {
    flex: 1,
  },
  petSelectorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  petSelectorDetails: {
    fontSize: 14,
    color: '#666',
  },
  selectorArrow: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  profileBasicInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  petAge: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '31%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  deleteSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  petsList: {
    maxHeight: 400,
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  petOptionImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  petOptionInfo: {
    flex: 1,
  },
  petOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  petOptionDetails: {
    fontSize: 14,
    color: '#666',
  },
  petOptionAge: {
    fontSize: 12,
    color: '#999',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
