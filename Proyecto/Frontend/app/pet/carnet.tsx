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
  peso: number;
  alergias: string | null;
  enfermedades: string | null;
  observaciones: string | null;
  foto: string | null;
}

export default function CarnetScreen() {
  const navigation = useNavigation();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [carnetRecords, setCarnetRecords] = useState<CarnetRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPetsModal, setShowPetsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CarnetRecord | null>(null);

  // Estados para manejo de fechas separadas (día, mes, año)
  const [elaboracionDia, setElaboracionDia] = useState('');
  const [elaboracionMes, setElaboracionMes] = useState('');
  const [elaboracionAno, setElaboracionAno] = useState('');
  
  const [vencimientoDia, setVencimientoDia] = useState('');
  const [vencimientoMes, setVencimientoMes] = useState('');
  const [vencimientoAno, setVencimientoAno] = useState('');
  
  const [proximaDia, setProximaDia] = useState('');
  const [proximaMes, setProximaMes] = useState('');
  const [proximaAno, setProximaAno] = useState('');

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
      Alert.alert('Error', 'No se pudieron cargar las mascotas');
    }
  };

  const getPetPhotoUrl = (foto: string | null) => {
    if (!foto) return 'https://via.placeholder.com/50?text=🐾';
    
    if (foto.startsWith('file://') || foto.startsWith('content://')) {
      return foto;
    }
    
    const baseUrl = API_URL.replace('/api', '');
    const url = `${baseUrl}/uploads/mascotas/${foto}`;
    return url;
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

  const isFormValid = () => {
    return (
      selectedPet &&
      newRecord.nombre_medicamento?.trim() &&
      newRecord.id_lote?.trim() &&
      newRecord.fecha_vencimiento &&
      newRecord.peso &&
      newRecord.peso > 0 &&
      newRecord.nombre_veterinaria?.trim() &&
      newRecord.direccion_veterinaria?.trim()
    );
  };

  const handleAddRecord = async () => {
    if (!isFormValid()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios (*)\n\n- Nombre del medicamento\n- ID Lote\n- Fecha de vencimiento\n- Peso\n- Veterinaria\n- Dirección veterinaria');
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('token');
      
      const recordData = {
        id_mascota: selectedPet!.id,
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

      if (!selectedPet) return;
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

  const openEditModal = (record: CarnetRecord) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const handleEditRecord = async () => {
    if (!editingRecord) return;

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('token');

      const updateData = {
        telefono_veterinaria: editingRecord.telefono_veterinaria || '',
        proxima_dosis: editingRecord.proxima_dosis ? editingRecord.proxima_dosis.toISOString() : null,
        observaciones: editingRecord.observaciones || '',
      };

      const response = await fetch(`${API_URL}/carnet/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar registro');
      }

      if (!selectedPet) return;
      await fetchCarnetRecords(selectedPet.id);
      setShowEditModal(false);
      setEditingRecord(null);
      Alert.alert('Éxito', 'Registro actualizado correctamente');
    } catch (error) {
      console.error('Error al editar registro:', error);
      Alert.alert('Error', 'No se pudo actualizar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRecord = async (id: number) => {
    Alert.alert(
      'Eliminar Registro',
      '¿Estás seguro de que deseas eliminar este registro del carnet?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`${API_URL}/carnet/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
              });

              if (!response.ok) {
                throw new Error('Error al eliminar registro');
              }

              if (!selectedPet) return;
              await fetchCarnetRecords(selectedPet.id);
              Alert.alert('Éxito', 'Registro eliminado correctamente');
            } catch (error) {
              console.error('Error al eliminar registro:', error);
              Alert.alert('Error', 'No se pudo eliminar el registro');
            }
          },
        },
      ]
    );
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
    
    // Limpiar estados de fechas
    setElaboracionDia('');
    setElaboracionMes('');
    setElaboracionAno('');
    setVencimientoDia('');
    setVencimientoMes('');
    setVencimientoAno('');
    setProximaDia('');
    setProximaMes('');
    setProximaAno('');
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
              <strong>Raza:</strong> <span>${selectedPet.raza || 'No especifica'}</span>
            </div>
            <div class="info-row">
              <strong>Sexo:</strong> <span>${selectedPet.sexo}</span>
            </div>
            <div class="info-row">
              <strong>Color:</strong> <span>${selectedPet.color || 'No especifica'}</span>
            </div>
            <div class="info-row">
              <strong>Peso:</strong> <span>${selectedPet.peso ? selectedPet.peso + ' kg' : 'No especifica'}</span>
            </div>
            <div class="info-row">
              <strong>Fecha de Nacimiento:</strong> <span>${new Date(selectedPet.fecha_nacimiento).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="info-row">
              <strong>Alergias:</strong> <span>${selectedPet.alergias || 'No especifica'}</span>
            </div>
            <div class="info-row">
              <strong>Enfermedades:</strong> <span>${selectedPet.enfermedades || 'No especifica'}</span>
            </div>
            <div class="info-row">
              <strong>Observaciones:</strong> <span>${selectedPet.observaciones || 'No especifica'}</span>
            </div>
          </div>

          <div class="section-title">💉 VACUNAS</div>
          ${vacunas.length === 0 
            ? '<p style="text-align: center; color: #666; font-style: italic;">No hay vacunas registradas</p>' 
            : `
              <table>
                <thead>
                  <tr>
                    <th>Medicamento / Laboratorio</th>
                    <th>Lote</th>
                    <th>Aplicación</th>
                    <th>Vencimiento</th>
                    <th>Peso (kg)</th>
                    <th>Veterinaria</th>
                  </tr>
                </thead>
                <tbody>
                  ${vacunas.map(v => `
                    <tr>
                      <td><strong>${v.nombre_medicamento}</strong><br/><small>${v.laboratorio || 'No especifica'}</small></td>
                      <td>${v.id_lote}</td>
                      <td>${formatDate(v.fecha_aplicacion)}</td>
                      <td>${formatDate(v.fecha_vencimiento)}</td>
                      <td>${v.peso}</td>
                      <td><small>${v.nombre_veterinaria}</small></td>
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
                    <th>Medicamento / Laboratorio</th>
                    <th>Lote</th>
                    <th>Aplicación</th>
                    <th>Peso (kg)</th>
                    <th>Veterinaria</th>
                  </tr>
                </thead>
                <tbody>
                  ${desparasitaciones.map(d => `
                    <tr>
                      <td><strong>${d.nombre_medicamento}</strong><br/><small>${d.laboratorio || 'No especifica'}</small></td>
                      <td>${d.id_lote}</td>
                      <td>${formatDate(d.fecha_aplicacion)}</td>
                      <td>${d.peso}</td>
                      <td><small>${d.nombre_veterinaria}</small></td>
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
        <Text style={styles.headerTitle}>Carnet Digital</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportToPDF}>
          <Text style={styles.exportButtonText}>📄 PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de Mascota */}
      <TouchableOpacity style={styles.petSelector} onPress={() => setShowPetsModal(true)}>
        <Image 
          source={{ uri: getPetPhotoUrl(selectedPet?.foto || null) }} 
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
                <View style={styles.recordActions}>
                  <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={() => openEditModal(record)}
                  >
                    <Text style={styles.editButtonText}>✏️ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => deleteRecord(record.id)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
                  </TouchableOpacity>
                </View>
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
                <View style={styles.recordActions}>
                  <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={() => openEditModal(record)}
                  >
                    <Text style={styles.editButtonText}>✏️ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => deleteRecord(record.id)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
                  </TouchableOpacity>
                </View>
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
                  source={{ uri: getPetPhotoUrl(pet.foto) }} 
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
                  <Text style={styles.typeText}>VACUNA</Text>
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
                  <Text style={styles.typeText}>DESPARACITACION</Text>
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

              <Text style={styles.label}>Fecha de Elaboración (DD/MM/AAAA)</Text>
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="DD"
                  keyboardType="numeric"
                  maxLength={2}
                  value={elaboracionDia}
                  onChangeText={(text) => {
                    setElaboracionDia(text);
                    if (text && elaboracionMes && elaboracionAno) {
                      const day = parseInt(text);
                      const month = parseInt(elaboracionMes) - 1;
                      const year = parseInt(elaboracionAno);
                      if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900) {
                        setNewRecord({ ...newRecord, fecha_elaboracion: new Date(year, month, day) });
                      }
                    } else if (!text && !elaboracionMes && !elaboracionAno) {
                      setNewRecord({ ...newRecord, fecha_elaboracion: null });
                    }
                  }}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="MM"
                  keyboardType="numeric"
                  maxLength={2}
                  value={elaboracionMes}
                  onChangeText={(text) => {
                    setElaboracionMes(text);
                    if (elaboracionDia && text && elaboracionAno) {
                      const day = parseInt(elaboracionDia);
                      const month = parseInt(text) - 1;
                      const year = parseInt(elaboracionAno);
                      if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900) {
                        setNewRecord({ ...newRecord, fecha_elaboracion: new Date(year, month, day) });
                      }
                    } else if (!elaboracionDia && !text && !elaboracionAno) {
                      setNewRecord({ ...newRecord, fecha_elaboracion: null });
                    }
                  }}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.dateInputYear]}
                  placeholder="AAAA"
                  keyboardType="numeric"
                  maxLength={4}
                  value={elaboracionAno}
                  onChangeText={(text) => {
                    setElaboracionAno(text);
                    if (elaboracionDia && elaboracionMes && text) {
                      const day = parseInt(elaboracionDia);
                      const month = parseInt(elaboracionMes) - 1;
                      const year = parseInt(text);
                      if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900) {
                        setNewRecord({ ...newRecord, fecha_elaboracion: new Date(year, month, day) });
                      }
                    } else if (!elaboracionDia && !elaboracionMes && !text) {
                      setNewRecord({ ...newRecord, fecha_elaboracion: null });
                    }
                  }}
                />
              </View>

              <Text style={styles.label}>Fecha de Vencimiento (DD/MM/AAAA) *</Text>
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="DD"
                  keyboardType="numeric"
                  maxLength={2}
                  value={vencimientoDia}
                  onChangeText={(text) => {
                    setVencimientoDia(text);
                    if (text && vencimientoMes && vencimientoAno) {
                      const day = parseInt(text);
                      const month = parseInt(vencimientoMes) - 1;
                      const year = parseInt(vencimientoAno);
                      if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900) {
                        setNewRecord({ ...newRecord, fecha_vencimiento: new Date(year, month, day) });
                      }
                    }
                  }}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="MM"
                  keyboardType="numeric"
                  maxLength={2}
                  value={vencimientoMes}
                  onChangeText={(text) => {
                    setVencimientoMes(text);
                    if (vencimientoDia && text && vencimientoAno) {
                      const day = parseInt(vencimientoDia);
                      const month = parseInt(text) - 1;
                      const year = parseInt(vencimientoAno);
                      if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900) {
                        setNewRecord({ ...newRecord, fecha_vencimiento: new Date(year, month, day) });
                      }
                    }
                  }}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.dateInputYear]}
                  placeholder="AAAA"
                  keyboardType="numeric"
                  maxLength={4}
                  value={vencimientoAno}
                  onChangeText={(text) => {
                    setVencimientoAno(text);
                    if (vencimientoDia && vencimientoMes && text) {
                      const day = parseInt(vencimientoDia);
                      const month = parseInt(vencimientoMes) - 1;
                      const year = parseInt(text);
                      if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900) {
                        setNewRecord({ ...newRecord, fecha_vencimiento: new Date(year, month, day) });
                      }
                    }
                  }}
                />
              </View>

              <Text style={styles.label}>Próxima Dosis (DD/MM/AAAA)</Text>
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="DD"
                  keyboardType="numeric"
                  maxLength={2}
                  value={proximaDia}
                  onChangeText={(text) => {
                    setProximaDia(text);
                    if (text && proximaMes && proximaAno) {
                      const day = parseInt(text);
                      const month = parseInt(proximaMes) - 1;
                      const year = parseInt(proximaAno);
                      if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900) {
                        setNewRecord({ ...newRecord, proxima_dosis: new Date(year, month, day) });
                      }
                    } else if (!text && !proximaMes && !proximaAno) {
                      setNewRecord({ ...newRecord, proxima_dosis: null });
                    }
                  }}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="MM"
                  keyboardType="numeric"
                  maxLength={2}
                  value={proximaMes}
                  onChangeText={(text) => {
                    setProximaMes(text);
                    if (proximaDia && text && proximaAno) {
                      const day = parseInt(proximaDia);
                      const month = parseInt(text) - 1;
                      const year = parseInt(proximaAno);
                      if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900) {
                        setNewRecord({ ...newRecord, proxima_dosis: new Date(year, month, day) });
                      }
                    } else if (!proximaDia && !text && !proximaAno) {
                      setNewRecord({ ...newRecord, proxima_dosis: null });
                    }
                  }}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.dateInputYear]}
                  placeholder="AAAA"
                  keyboardType="numeric"
                  maxLength={4}
                  value={proximaAno}
                  onChangeText={(text) => {
                    setProximaAno(text);
                    if (proximaDia && proximaMes && text) {
                      const day = parseInt(proximaDia);
                      const month = parseInt(proximaMes) - 1;
                      const year = parseInt(text);
                      if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900) {
                        setNewRecord({ ...newRecord, proxima_dosis: new Date(year, month, day) });
                      }
                    } else if (!proximaDia && !proximaMes && !text) {
                      setNewRecord({ ...newRecord, proxima_dosis: null });
                    }
                  }}
                />
              </View>

              <Text style={styles.label}>Veterinaria *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la veterinaria"
                value={newRecord.nombre_veterinaria}
                onChangeText={(text) => setNewRecord({ ...newRecord, nombre_veterinaria: text })}
              />

              <Text style={styles.label}>Teléfono Veterinaria</Text>
              <TextInput
                style={styles.input}
                placeholder="Teléfono de contacto (Opcional)"
                keyboardType="phone-pad"
                value={newRecord.telefono_veterinaria}
                onChangeText={(text) => setNewRecord({ ...newRecord, telefono_veterinaria: text })}
              />

              <Text style={styles.label}>Dirección Veterinaria *</Text>
              <TextInput
                style={styles.input}
                placeholder="Dirección de la veterinaria"
                value={newRecord.direccion_veterinaria}
                onChangeText={(text) => setNewRecord({ ...newRecord, direccion_veterinaria: text })}
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
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.saveButton, 
                  (submitting || !isFormValid()) && { opacity: 0.5, backgroundColor: '#ccc' }
                ]}
                onPress={handleAddRecord}
                disabled={submitting || !isFormValid()}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Registro */}
      <Modal visible={showEditModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.editModalContent]}>
            <Text style={styles.modalTitle}>Editar Registro</Text>
            <Text style={styles.modalSubtitle}>Solo puedes editar: Teléfono, Próxima Dosis y Observaciones</Text>
            
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Teléfono Veterinaria</Text>
              <TextInput
                style={styles.input}
                placeholder="Teléfono de contacto"
                keyboardType="phone-pad"
                value={editingRecord?.telefono_veterinaria || ''}
                onChangeText={(text) => setEditingRecord(prev => prev ? {...prev, telefono_veterinaria: text} : null)}
              />

              <Text style={styles.label}>Próxima Dosis</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA (Opcional)"
                value={editingRecord?.proxima_dosis ? formatDate(editingRecord.proxima_dosis) : ''}
                onChangeText={(text) => {
                  if (text.length === 10) {
                    const parts = text.split('/');
                    if (parts.length === 3) {
                      const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                      setEditingRecord(prev => prev ? {...prev, proxima_dosis: date} : null);
                    }
                  } else if (text === '') {
                    setEditingRecord(prev => prev ? {...prev, proxima_dosis: null} : null);
                  }
                }}
              />

              <Text style={styles.label}>Observaciones</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Observaciones adicionales..."
                value={editingRecord?.observaciones || ''}
                onChangeText={(text) => setEditingRecord(prev => prev ? {...prev, observaciones: text} : null)}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingRecord(null);
                }}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, submitting && { opacity: 0.6 }]}
                onPress={handleEditRecord}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Actualizar</Text>
                )}
              </TouchableOpacity>
            </View>
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
    alignItems: 'center',
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
  recordActions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
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
  addModalContent: {
    maxHeight: '90%',
  },
  editModalContent: {
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
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
    fontSize: 11,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 0,
  },
  dateInputYear: {
    flex: 1.5,
    marginBottom: 0,
    marginRight: 0,
  },
  dateSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 8,
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
