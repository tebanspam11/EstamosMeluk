import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../src/config/api';

export default function HomeScreen({ navigation }: any) {
  const [usuario, setUsuario] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) navigation.replace('Login');

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [perfilRes, mascotasRes, eventosRes] = await Promise.all([
        fetch(`${API_URL}/usuarios/perfil`, { headers }),
        fetch(`${API_URL}/mascotas`, { headers }),
        fetch(`${API_URL}/eventos`, { headers }),
      ]);

      if (perfilRes.ok) {
        const perfilData = await perfilRes.json();
        console.log('📋 Datos del perfil:', perfilData);
        setUsuario(perfilData);
      } else {
        console.log('❌ Error al cargar perfil:', perfilRes.status);
      }

      if (mascotasRes.ok) {
        const mascotasData = await mascotasRes.json();
        console.log('🐾 Mascotas:', mascotasData);
        setMascotas(mascotasData);
      }

      if (eventosRes.ok) {
        const eventosData = await eventosRes.json();
        console.log('📅 Eventos:', eventosData);
        setEventos(eventosData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    const esHoy = date.toDateString() === hoy.toDateString();
    const esMañana = date.toDateString() === mañana.toDateString();

    const hora = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    if (esHoy) return `Hoy, ${hora}`;
    if (esMañana) return `Mañana, ${hora}`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
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

  const nombreUsuario = usuario?.nombre;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con botón de perfil */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {nombreUsuario}!</Text>
          <Text style={styles.subtitle}>Bienvenida a PocketVet</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.replace('Profile')}
        >
          <Image
            source={{ uri: 'https://via.placeholder.com/40x40?text=👤' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Sección de Recordatorios */}
      <View style={styles.remindersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Recordatorios</Text>
          <TouchableOpacity onPress={() => navigation.replace('Calendar')}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {eventos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Nada por aquí...</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.remindersScroll}
          >
            {eventos.map((evento) => (
              <View key={evento.id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <Text style={styles.reminderIcon}>📅</Text>
                  <View style={styles.reminderBadge}>
                    <Text style={styles.reminderBadgeText}>Próximo</Text>
                  </View>
                </View>
                <Text style={styles.reminderTitle}>{evento.titulo}</Text>
                <Text style={styles.reminderPet}>{evento.mascota.nombre}</Text>
                <Text style={styles.reminderDate}>{formatearFecha(evento.fecha_inicio)}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Sección de Mascotas */}
      <View style={styles.petsSection}>
        <Text style={styles.sectionTitle}>Tus Mascotas</Text>

        {mascotas.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🐾</Text>
            <Text style={styles.emptyText}>Nada por aquí...</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.replace('Upload')}
            >
              <Text style={styles.addButtonText}>Agregar Mascota</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.petsGrid}>
            {mascotas.slice(0, 2).map((mascota) => (
              <TouchableOpacity
                key={mascota.id}
                style={styles.petCard}
                onPress={() => navigation.replace('PetProfile', { pet: mascota })}
              >
                <Text style={styles.petIcon}>
                  {mascota.especie.toLowerCase() === 'perro' ? '🐶' : 
                   mascota.especie.toLowerCase() === 'gato' ? '🐱' : '🐾'}
                </Text>
                <Text style={styles.petName}>{mascota.nombre}</Text>
                <Text style={styles.petBreed}>{mascota.raza || mascota.especie}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.petCard, styles.addPetCard]}
              onPress={() => navigation.replace('Upload')}
            >
              <Text style={styles.addPetIcon}>+</Text>
              <Text style={styles.addPetText}>Agregar Mascota</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Barra de Navegación Inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.replace('Calendar')}
        >
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navText}>Calendario</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.replace('VeterinarySearch')}
        >
          <Text style={styles.navIcon}>🏥</Text>
          <Text style={styles.navText}>Veterinarias</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.replace('Carnet')}
        >
          <Text style={styles.navIcon}>📄</Text>
          <Text style={styles.navText}>Carnet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.replace('ClinicHistory')}
        >
          <Text style={styles.navIcon}>🏥</Text>
          <Text style={styles.navText}>Historial</Text>
        </TouchableOpacity>
      </View>
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
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  remindersSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  remindersScroll: {
    marginHorizontal: -5,
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 5,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reminderIcon: {
    fontSize: 24,
  },
  reminderBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reminderBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reminderPet: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  reminderDate: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  petsSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  petsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  petCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 12,
    color: '#666',
  },
  addPetCard: {
    backgroundColor: '#f0f7ff',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  addPetIcon: {
    fontSize: 24,
    color: '#4A90E2',
    marginBottom: 8,
  },
  addPetText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    textAlign: 'center',
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
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  addButton: {
    marginTop: 15,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});
