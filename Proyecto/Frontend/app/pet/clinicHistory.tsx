import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../src/config/api';
import { formatName } from '../../src/utils/formatName';

interface Documento {
  id: number;
  tipo: string;
  titulo: string;
  descripcion?: string;
  archivo_pdf: string;
  uploadedAt: string;
  id_mascota: number;
}

interface Mascota {
  id: number;
  nombre: string;
  especie: string;
}

export default function ClinicHistoryScreen({ navigation }: any) {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [newDoc, setNewDoc] = useState({
    tipo: 'consulta',
    titulo: '',
    descripcion: '',
    file: null as any,
  });

  useFocusEffect(
    React.useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const mascotasRes = await fetch(`${API_URL}/mascotas`, { headers });
    if (mascotasRes.ok) {
      const mascotasData = await mascotasRes.json();
      setMascotas(mascotasData);
      if (mascotasData.length > 0 && !selectedMascota) {
         setSelectedMascota(mascotasData[0]);
      }
    }
    setLoading(false);
  };

  const cargarDocumentos = async (idMascota: number) => {
    const token = await AsyncStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const docsRes = await fetch(`${API_URL}/documentos/mascota/${idMascota}`, { headers });
    if (docsRes.ok) {
      const docsData = await docsRes.json();
      setDocumentos(docsData);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (selectedMascota) {
        cargarDocumentos(selectedMascota.id);
      }
    }, [selectedMascota])
  );

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setNewDoc({ ...newDoc, file });
        Alert.alert('Éxito', `Archivo seleccionado: ${file.name}`);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const uploadDocument = async () => {
    if (!newDoc.file) {
      Alert.alert('Error', 'Por favor selecciona un archivo PDF');
      return;
    }

    if (!newDoc.titulo.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para el documento');
      return;
    }

    if (!selectedMascota) {
      Alert.alert('Error', 'Por favor selecciona una mascota');
      return;
    }

    setUploading(true);
    const token = await AsyncStorage.getItem('token');

      const formData = new FormData();
      formData.append('file', {
        uri: newDoc.file.uri,
        type: 'application/pdf',
        name: newDoc.file.name,
      } as any);
      formData.append('id_mascota', selectedMascota.id.toString());
      formData.append('tipo', newDoc.tipo);
      formData.append('titulo', formatName(newDoc.titulo));
      formData.append('descripcion', newDoc.descripcion);

      const response = await fetch(`${API_URL}/documentos/uploads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Documento subido correctamente');
        setShowUploadModal(false);
        setNewDoc({ tipo: 'consulta', titulo: '', descripcion: '', file: null });
        cargarDocumentos(selectedMascota.id);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error);
      }
    setUploading(false);
  };

  const viewDocument = async (documento: Documento) => {
    const pdfUrl = `${API_URL}/uploads/pdfs/${documento.archivo_pdf}`;
    
    const canOpen = await Linking.canOpenURL(pdfUrl);
    if (canOpen) {
      await Linking.openURL(pdfUrl);
    } else {
      Alert.alert('Error', 'No se puede abrir el documento');
    }
  };

  const deleteDocument = async (id: number) => {
    Alert.alert(
      'Eliminar Documento',
      '¿Estás seguro de que deseas eliminar este documento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/documentos/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
              Alert.alert('Éxito', 'Documento eliminado');
              if (selectedMascota) cargarDocumentos(selectedMascota.id);
            } else {
              Alert.alert('Error', 'No se pudo eliminar el documento');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'Consulta': return '🩺';
      case 'Hospilatizaciones': return '💉';
      case 'Laboratorios': return '🔬';
      case 'Formulas': return '💊';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial Clínico</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowUploadModal(true)}
        >
          <Text style={styles.addButtonText}>+ Subir</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de Mascota */}
      {mascotas.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.petSelector}
          contentContainerStyle={styles.petSelectorContent}
        >
          {mascotas.map((mascota) => (
            <TouchableOpacity
              key={mascota.id}
              style={[
                styles.petOption,
                selectedMascota?.id === mascota.id && styles.selectedPetOption,
              ]}
              onPress={() => setSelectedMascota(mascota)}
            >
              <Text style={styles.petIcon}>
                {mascota.especie.toLowerCase() === 'perro' ? '🐶' : '🐱'}
              </Text>
              <Text style={styles.petName}>{mascota.nombre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Lista de Documentos */}
      <ScrollView style={styles.documentsList}>
        {documentos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No hay documentos</Text>
            <Text style={styles.emptySubtext}>Sube el primer documento</Text>
          </View>
        ) : (
          documentos.map((doc) => (
            <View key={doc.id} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentIcon}>{getTipoIcon(doc.tipo)}</Text>
                  <View style={styles.documentTexts}>
                    <Text style={styles.documentTitle}>{doc.titulo}</Text>
                    <Text style={styles.documentType}>{doc.tipo}</Text>
                  </View>
                </View>
                <Text style={styles.documentDate}>{formatDate(doc.uploadedAt)}</Text>
              </View>
              
              {doc.descripcion && (
                <Text style={styles.documentDescription}>{doc.descripcion}</Text>
              )}

              <View style={styles.documentActions}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => viewDocument(doc)}
                >
                  <Text style={styles.viewButtonText}>Ver PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteDocument(doc.id)}
                >
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de Subida */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Subir Documento</Text>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Tipo de Documento</Text>
              <View style={styles.tipoContainer}>
                {['consulta', 'vacuna', 'examen', 'receta', 'otro'].map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.tipoOption,
                      newDoc.tipo === tipo && styles.selectedTipoOption,
                    ]}
                    onPress={() => setNewDoc({ ...newDoc, tipo })}
                  >
                    <Text style={styles.tipoIcon}>{getTipoIcon(tipo)}</Text>
                    <Text style={styles.tipoText}>{tipo}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Consulta general"
                value={newDoc.titulo}
                onChangeText={(text) => setNewDoc({ ...newDoc, titulo: text })}
              />

              <Text style={styles.label}>Descripción (Opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción del documento..."
                value={newDoc.descripcion}
                onChangeText={(text) => setNewDoc({ ...newDoc, descripcion: text })}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Archivo PDF *</Text>
              <TouchableOpacity style={styles.pickButton} onPress={pickDocument}>
                <Text style={styles.pickButtonText}>
                  {newDoc.file ? `✓ ${newDoc.file.name}` : '📎 Seleccionar PDF'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowUploadModal(false);
                  setNewDoc({ tipo: 'consulta', titulo: '', descripcion: '', file: null });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={uploadDocument}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Subir</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  petSelector: {
    maxHeight: 80,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  petSelectorContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  petOption: {
    alignItems: 'center',
    padding: 10,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    minWidth: 80,
  },
  selectedPetOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4A90E2',
    borderWidth: 2,
  },
  petIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  petName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  documentsList: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  documentInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  documentIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  documentTexts: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  documentType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  documentDate: {
    fontSize: 12,
    color: '#999',
  },
  documentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 10,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  modalForm: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  tipoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  tipoOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    minWidth: 80,
  },
  selectedTipoOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4A90E2',
    borderWidth: 2,
  },
  tipoIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tipoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pickButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
