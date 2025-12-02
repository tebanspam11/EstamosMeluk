import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../src/config/api';
import { Usuario } from '../../src/types';

export default function ProfileScreen({ navigation }: any) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      validateActiveSession();
      cargarDatosUsuario();
    }, [])
  );

  const validateActiveSession = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) navigation.replace('Login');
  };

  const cargarDatosUsuario = async () => {
    setLoading(true);

    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_URL}/usuarios`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const userData = await response.json();
      setUsuario(userData);
    }
    
    setLoading(false);
  };

  const handleCerrarSesion = () => {
    Alert.alert(
      '¿Cerrar sesión?',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleEliminarCuenta = () => {
    Alert.alert(
      '⚠️ Eliminar cuenta',
      'Esta acción es irreversible. Se eliminarán todos tus datos, mascotas, eventos y documentos. ¿Estás completamente seguro?',
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
            
            const response = await fetch(`${API_URL}/usuarios`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              await AsyncStorage.removeItem('token');
              Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada exitosamente.');
              navigation.replace('Login');
            } else {
              Alert.alert('Error', '⚠︎ No se pudo eliminar la cuenta. Intenta nuevamente.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mi Perfil</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{usuario?.nombre || 'Usuario'}</Text>
        </View>

        {/* Información del usuario */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{usuario?.nombre || 'No especificado'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Correo</Text>
              <Text style={styles.infoValue}>{usuario?.correo || 'No especificado'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{usuario?.telefono || 'No especificado'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo de cuenta</Text>
              <Text style={styles.infoValue}>
                {usuario?.cuenta_google ? '🔗 Google' : '📧 Email'}
              </Text>
            </View>
          </View>
        </View>

        {/* Botón Editar Perfil */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('UserEdit')}
        >
          <Text style={styles.editButtonText}>✏️ Editar Perfil</Text>
        </TouchableOpacity>

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleCerrarSesion}
        >
          <Text style={styles.logoutButtonText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Botón Eliminar Cuenta */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleEliminarCuenta}
        >
          <Text style={styles.deleteButtonText}>⚠️ Eliminar Cuenta</Text>
        </TouchableOpacity>

        <Text style={styles.warningText}>
          La eliminación de cuenta es permanente e irreversible
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  infoSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  editButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
  },
});
