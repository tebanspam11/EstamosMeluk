import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../src/config/api';
import { useFocusEffect } from '@react-navigation/native';
import { Usuario, Mascota, Evento } from '../../src/types';

export default function HomeScreen({ navigation }: any) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      validateActiveSession();
      cargarDatos();
    }, [])
  );

  const validateActiveSession = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) navigation.replace('Login');
  }

  const cargarDatos = async () => {
    const token = await AsyncStorage.getItem('token');
    const headers = {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'};

    const [usuarioRes, mascotasRes, eventosRes] = await Promise.all([
      fetch(`${API_URL}/usuarios`, { headers }),
      fetch(`${API_URL}/mascotas`, { headers }),
      fetch(`${API_URL}/eventos`, { headers }),
    ]);

    if (usuarioRes.ok) {
      const usuarioData = await usuarioRes.json();
      setUsuario(usuarioData);
    }

    if (mascotasRes.ok) {
      const mascotasData = await mascotasRes.json();
      setMascotas(mascotasData);
    }

    if (eventosRes.ok) {
      const eventosData = await eventosRes.json();
      setEventos(eventosData);
    }
    
    setLoading(false);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con botón de perfil */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {usuario?.nombre}!</Text>
          <Text style={styles.subtitle}>Te damos la Bienvenida a PocketVet</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          {usuario?.foto ? (
            <Image source={{ uri: usuario.foto }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Sección de Recordatorios */}
      <View style={styles.remindersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Recordatorios</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.addEventButton}
              onPress={() => navigation.navigate('Calendar')}
            >
              <Text style={styles.addEventText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
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
                <Text style={styles.reminderPet}>{evento.mascota?.nombre}</Text>
                <Text style={styles.reminderDate}>{formatearFecha(evento.fecha_inicio.toString())}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Sección de Mascotas */}
      <View style={styles.petsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tus Mascotas</Text>
        </View>

        {mascotas.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🐾</Text>
            <Text style={styles.emptyText}>Nada por aquí...</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('PetRegister')}
            >
              <Text style={styles.addButtonText}>Agregar Mascota</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petsScroll}
          >
            {mascotas.map((mascota) => (
              <TouchableOpacity
                key={mascota.id}
                style={styles.petCard}
                onPress={() => navigation.navigate('PetProfile', { pet: mascota })}
              >
                {mascota.foto ? (
                  <Image 
                    source={{ uri: mascota.foto }} 
                    style={styles.petImage}
                  />
                ) : (
                  <Text style={styles.petIcon}>
                    {mascota.especie.toLowerCase() === 'perro' ? '🐶' : 
                     mascota.especie.toLowerCase() === 'gato' ? '🐱' : '🐾'}
                  </Text>
                )}
                <Text style={styles.petName}>{mascota.nombre}</Text>
                <Text style={styles.petBreed}>{mascota.raza || mascota.especie}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.petCard, styles.addPetCard]}
              onPress={() => navigation.navigate('PetRegister')}
            >
              <Text style={styles.addPetIcon}>+</Text>
              <Text style={styles.addPetText}>Agregar Mascota</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* Barra de Navegación Inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navText}>Calendario</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('VeterinarySearch')}
        >
          <Text style={styles.navIcon}>🏥</Text>
          <Text style={styles.navText}>Veterinarias</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Carnet')}
        >
          <Text style={styles.navIcon}>📄</Text>
          <Text style={styles.navText}>Carnet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('ClinicHistory')}
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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
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
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addEventButton: {
    backgroundColor: '#4A90E2',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addEventText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2,
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
    marginTop: 25,
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  petsScroll: {
    paddingVertical: 5,
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
    width: 120,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
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
