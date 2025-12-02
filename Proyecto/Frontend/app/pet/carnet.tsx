import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../src/config/api';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface CarnetRecord {
  id: number;
  id_mascota: number;
  tipo_medicamento: 'Vacuna' | 'Desparasitación';
  nombre_medicamento: string;
  fecha_aplicacion: Date;
  laboratorio: string;
  id_lote: string;
  fecha_elaboracion: Date | null;
  fecha_vencimiento: Date;
  peso: number;
  nombre_veterinaria: string;
  telefono_veterinaria: string;
  direccion_veterinaria: string;
  proxima_dosis: Date | null;
  observaciones: string;
}

interface Pet {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  fecha_nacimiento: string;
  color: string;
  sexo: 'Macho' | 'Hembra';
  foto: string | null;
}

export default function CarnetScreen() {
  const navigation = useNavigation();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [carnetRecords, setCarnetRecords] = useState<CarnetRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPetsModal, setShowPetsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newRecord, setNewRecord] = useState<Partial<CarnetRecord>>({
    tipo_medicamento: 'Vacuna',
    nombre_medicamento: '',
    fecha_aplicacion: new Date(),
    laboratorio: '',
    id_lote: '',
    fecha_elaboracion: null,
    fecha_vencimiento: new Date(),
    peso: 0,
    nombre_veterinaria: '',
    telefono_veterinaria: '',
    direccion_veterinaria: '',
    proxima_dosis: null,
    observaciones: '',
  });

  // Cargar mascotas desde la API
  const fetchMascotas = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/mascotas`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setPets(data);
      if (data.length > 0) {
        setSelectedPet(data[0]);
      }
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      Alert.alert('Error', 'No se pudieron cargar las mascotas');
    }
  };

  // Cargar registros de carnet para la mascota seleccionada
  const fetchCarnetRecords = async (id_mascota: number) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/carnet/mascota/${id_mascota}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      
      // Convertir fechas de string a Date
      const recordsWithDates = data.map((record: any) => ({
        ...record,
        fecha_aplicacion: new Date(record.fecha_aplicacion),
        fecha_elaboracion: record.fecha_elaboracion ? new Date(record.fecha_elaboracion) : null,
        fecha_vencimiento: new Date(record.fecha_vencimiento),
        proxima_dosis: record.proxima_dosis ? new Date(record.proxima_dosis) : null,
      }));
      
      setCarnetRecords(recordsWithDates);
    } catch (error) {
      console.error('Error al cargar registros de carnet:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchMascotas();
    }, [])
  );

  useEffect(() => {
    if (selectedPet) {
      fetchCarnetRecords(selectedPet.id);
    }
  }, [selectedPet]);

  const handleAddRecord = async () => {
    if (!selectedPet || !newRecord.nombre_medicamento || !newRecord.id_lote || 
        !newRecord.peso || !newRecord.nombre_veterinaria || !newRecord.direccion_veterinaria) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('token');
      
      const recordData = {
        id_mascota: selectedPet.id,
        tipo_medicamento: newRecord.tipo_medicamento || 'Vacuna',
        nombre_medicamento: newRecord.nombre_medicamento,
        fecha_aplicacion: (newRecord.fecha_aplicacion || new Date()).toISOString(),
        laboratorio: newRecord.laboratorio || '',
        id_lote: newRecord.id_lote,
        fecha_elaboracion: newRecord.fecha_elaboracion ? newRecord.fecha_elaboracion.toISOString() : null,
        fecha_vencimiento: (newRecord.fecha_vencimiento || new Date()).toISOString(),
        peso: newRecord.peso,
        nombre_veterinaria: newRecord.nombre_veterinaria,
        telefono_veterinaria: newRecord.telefono_veterinaria || '',
        direccion_veterinaria: newRecord.direccion_veterinaria,
        proxima_dosis: newRecord.proxima_dosis ? newRecord.proxima_dosis.toISOString() : null,
        observaciones: newRecord.observaciones || '',
      };

      const response = await fetch(`${API_URL}/carnet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) {
        throw new Error('Error al crear registro');
      }

      await fetchCarnetRecords(selectedPet.id);
      setShowAddModal(false);
      resetNewRecord();
      Alert.alert('Éxito', 'Registro agregado al carnet');
    } catch (error) {
      console.error('Error al agregar registro:', error);
      Alert.alert('Error', 'No se pudo agregar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  const resetNewRecord = () => {
    setNewRecord({
      tipo_medicamento: 'Vacuna',
      nombre_medicamento: '',
      fecha_aplicacion: new Date(),
      laboratorio: '',
      id_lote: '',
      fecha_elaboracion: null,
      fecha_vencimiento: new Date(),
      peso: 0,
      nombre_veterinaria: '',
      telefono_veterinaria: '',
      direccion_veterinaria: '',
      proxima_dosis: null,
      observaciones: '',
    });
  };

  const exportToPDF = async () => {
    if (!selectedPet) {
      Alert.alert('Error', 'Selecciona una mascota primero');
      return;
    }

    try {
      const vacunas = getRecordsByType('Vacuna');
      const desparasitaciones = getRecordsByType('Desparasitación');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #4A90E2;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #4A90E2;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 18px;
              color: #666;
            }
            .pet-info {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              margin-bottom: 30px;
            }
            .pet-info h2 {
              color: #4A90E2;
              margin-top: 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .section-title {
              background: #4A90E2;
              color: white;
              padding: 12px;
              border-radius: 5px;
              margin-top: 30px;
              margin-bottom: 15px;
              font-size: 18px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background: #e3f2fd;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              border-bottom: 2px solid #4A90E2;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #e0e0e0;
            }
            tr:last-child td {
              border-bottom: none;
            }
            .vigente {
              color: #4CAF50;
              font-weight: bold;
            }
            .vencida {
              color: #FF6B6B;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e0e0e0;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🐾 PocketVet</div>
            <div class="subtitle">Carnet Digital de Salud</div>
          </div>

          <div class="pet-info">
            <h2>Información de la Mascota</h2>
            <div class="info-row">
              <strong>Nombre:</strong> <span>${selectedPet.nombre}</span>
            </div>
            <div class="info-row">
              <strong>Especie:</strong> <span>${selectedPet.especie}</span>
            </div>
            <div class="info-row">
              <strong>Raza:</strong> <span>${selectedPet.raza || 'N/A'}</span>
            </div>
            <div class="info-row">
              <strong>Sexo:</strong> <span>${selectedPet.sexo}</span>
            </div>
            <div class="info-row">
              <strong>Color:</strong> <span>${selectedPet.color || 'N/A'}</span>
            </div>
          </div>

          <div class="section-title">💉 VACUNAS</div>
          ${vacunas.length === 0 
            ? '<p style="text-align: center; color: #666; font-style: italic;">No hay vacunas registradas</p>' 
            : `
              <table>
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Lote</th>
                    <th>Aplicación</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${vacunas.map(v => `
                    <tr>
                      <td><strong>${v.nombre_medicamento}</strong><br/>${v.laboratorio || ''}</td>
                      <td>${v.id_lote}</td>
                      <td>${formatDate(v.fecha_aplicacion)}</td>
                      <td>${formatDate(v.fecha_vencimiento)}</td>
                      <td class="${new Date(v.fecha_vencimiento) > new Date() ? 'vigente' : 'vencida'}">
                        ${new Date(v.fecha_vencimiento) > new Date() ? 'Vigente' : 'Vencida'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}

          <div class="section-title">💊 DESPARASITACIONES</div>
          ${desparasitaciones.length === 0 
            ? '<p style="text-align: center; color: #666; font-style: italic;">No hay desparasitaciones registradas</p>' 
            : `
              <table>
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Lote</th>
                    <th>Aplicación</th>
                    <th>Peso (kg)</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${desparasitaciones.map(d => `
                    <tr>
                      <td><strong>${d.nombre_medicamento}</strong><br/>${d.laboratorio || ''}</td>
                      <td>${d.id_lote}</td>
                      <td>${formatDate(d.fecha_aplicacion)}</td>
                      <td>${d.peso}</td>
                      <td class="${new Date(d.fecha_vencimiento) > new Date() ? 'vigente' : 'vencida'}">
                        ${new Date(d.fecha_vencimiento) > new Date() ? 'Vigente' : 'Vencida'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}

          <div class="footer">
            <p><strong>PocketVet - Carnet Digital</strong></p>
            <p>Generado el ${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Carnet_${selectedPet.nombre}_${new Date().getTime()}.pdf`,
        });
      } else {
        Alert.alert('Éxito', `PDF generado: ${uri}`);
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    }
  };

  const getRecordsByType = (type: 'Vacuna' | 'Desparasitación') => {
    return carnetRecords.filter(
      (record) => record.tipo_medicamento === type && record.id_mascota === selectedPet?.id
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('es-ES');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carnet Digital</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportToPDF}>
          <Text style={styles.exportButtonText}>📄 PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de Mascota */}
      <TouchableOpacity style={styles.petSelector} onPress={() => setShowPetsModal(true)}>
        <Image 
          source={{ 
            uri: selectedPet?.foto 
              ? `${API_URL.replace('/api', '')}/uploads/mascotas/${selectedPet.foto}` 
              : 'https://via.placeholder.com/50?text=🐾'
          }} 
          style={styles.petImage} 
        />
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{selectedPet?.nombre || 'Seleccionar mascota'}</Text>
          <Text style={styles.petDetails}>
            {selectedPet ? `${selectedPet.raza} • ${selectedPet.sexo}` : 'Toca para seleccionar'}
          </Text>
        </View>
        <Text style={styles.selectorArrow}>▼</Text>
      </TouchableOpacity>

      {/* Estadísticas Rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getRecordsByType('Vacuna').length}</Text>
          <Text style={styles.statLabel}>Vacunas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getRecordsByType('Desparasitación').length}</Text>
          <Text style={styles.statLabel}>Desparasitaciones</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {
              carnetRecords.filter(
                (r) =>
                  r.id_mascota === selectedPet?.id && new Date(r.fecha_vencimiento) > new Date()
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>Vigentes</Text>
        </View>
      </View>

      {/* Botón Agregar Registro */}
      <TouchableOpacity style={styles.addRecordButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addRecordButtonText}>+ Agregar Registro</Text>
      </TouchableOpacity>

      {/* Lista de Registros */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Cargando registros...</Text>
        </View>
      ) : (
        <ScrollView style={styles.recordsContainer}>
          {/* Vacunas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💉 Vacunas</Text>
            {getRecordsByType('Vacuna').length === 0 ? (
              <Text style={styles.emptyText}>No hay vacunas registradas</Text>
            ) : (
              getRecordsByType('Vacuna').map((record) => (
                <View key={record.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordName}>{record.nombre_medicamento}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            new Date(record.fecha_vencimiento) > new Date() ? '#4CAF50' : '#FF6B6B',
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {new Date(record.fecha_vencimiento) > new Date() ? 'Vigente' : 'Vencida'}
                      </Text>
                    </View>
                </View>
                <Text style={styles.recordDetail}>Lote: {record.id_lote}</Text>
                <Text style={styles.recordDetail}>
                  Aplicación: {formatDate(record.fecha_aplicacion)}
                </Text>
                <Text style={styles.recordDetail}>
                  Vence: {formatDate(record.fecha_vencimiento)}
                </Text>
                {record.observaciones && (
                  <Text style={styles.recordObservations}>{record.observaciones}</Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Desparasitaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Desparasitaciones</Text>
          {getRecordsByType('Desparasitación').length === 0 ? (
            <Text style={styles.emptyText}>No hay desparasitaciones registradas</Text>
          ) : (
            getRecordsByType('Desparasitación').map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordName}>{record.nombre_medicamento}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          new Date(record.fecha_vencimiento) > new Date() ? '#4CAF50' : '#FF6B6B',
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {new Date(record.fecha_vencimiento) > new Date() ? 'Vigente' : 'Vencida'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recordDetail}>Lote: {record.id_lote}</Text>
                <Text style={styles.recordDetail}>
                  Aplicación: {formatDate(record.fecha_aplicacion)}
                </Text>
                <Text style={styles.recordDetail}>
                  Vence: {formatDate(record.fecha_vencimiento)}
                </Text>
                <Text style={styles.recordDetail}>Peso: {record.peso} kg</Text>
                {record.observaciones && (
                  <Text style={styles.recordObservations}>{record.observaciones}</Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      )}

      {/* Modal Seleccionar Mascota */}
      <Modal visible={showPetsModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Mascota</Text>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petOption}
                onPress={() => {
                  setSelectedPet(pet);
                  setShowPetsModal(false);
                }}
              >
                <Image 
                  source={{ 
                    uri: pet.foto 
                      ? `${API_URL.replace('/api', '')}/uploads/mascotas/${pet.foto}` 
                      : 'https://via.placeholder.com/40?text=🐾'
                  }} 
                  style={styles.petOptionImage} 
                />
                <View style={styles.petOptionInfo}>
                  <Text style={styles.petOptionName}>{pet.nombre}</Text>
                  <Text style={styles.petOptionDetails}>
                    {pet.raza} • {pet.especie}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPetsModal(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Agregar Registro */}
      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.addModalContent]}>
            <Text style={styles.modalTitle}>Agregar Registro</Text>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Tipo de Medicamento *</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newRecord.tipo_medicamento === 'Vacuna' && styles.selectedType,
                  ]}
                  onPress={() => setNewRecord({ ...newRecord, tipo_medicamento: 'Vacuna' })}
                >
                  <Text style={styles.typeText}>💉 Vacuna</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newRecord.tipo_medicamento === 'Desparasitación' && styles.selectedType,
                  ]}
                  onPress={() =>
                    setNewRecord({ ...newRecord, tipo_medicamento: 'Desparasitación' })
                  }
                >
                  <Text style={styles.typeText}>💊 Desparasitación</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Nombre del Medicamento *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Vacuna Antirrábica"
                value={newRecord.nombre_medicamento}
                onChangeText={(text) => setNewRecord({ ...newRecord, nombre_medicamento: text })}
              />

              <Text style={styles.label}>ID Lote *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: RB2024A"
                value={newRecord.id_lote}
                onChangeText={(text) => setNewRecord({ ...newRecord, id_lote: text })}
              />

              <Text style={styles.label}>Laboratorio</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Zoetis"
                value={newRecord.laboratorio}
                onChangeText={(text) => setNewRecord({ ...newRecord, laboratorio: text })}
              />

              <Text style={styles.label}>Peso (kg) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 25.5"
                keyboardType="numeric"
                value={newRecord.peso?.toString()}
                onChangeText={(text) => setNewRecord({ ...newRecord, peso: parseFloat(text) || 0 })}
              />

              <Text style={styles.label}>Veterinaria *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la veterinaria"
                value={newRecord.nombre_veterinaria}
                onChangeText={(text) => setNewRecord({ ...newRecord, nombre_veterinaria: text })}
              />

              <Text style={styles.label}>Observaciones</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Observaciones adicionales..."
                value={newRecord.observaciones}
                onChangeText={(text) => setNewRecord({ ...newRecord, observaciones: text })}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, submitting && { opacity: 0.6 }]}
                  onPress={handleAddRecord}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  exportButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  petSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 14,
    color: '#666',
  },
  selectorArrow: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  addRecordButton: {
    backgroundColor: '#4A90E2',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addRecordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  recordsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 20,
  },
  recordCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  recordDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recordObservations: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  addModalContent: {
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  petOptionImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  form: {
    maxHeight: 500,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4A90E2',
    borderWidth: 2,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
