import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  // Datos de ejemplo para recordatorios
  const reminders = [
    {
      id: '1',
      title: 'Vacuna antirrábica',
      petName: 'Max',
      date: 'Hoy, 3:00 PM',
      type: 'vacuna',
    },
    {
      id: '2',
      title: 'Control mensual',
      petName: 'Luna',
      date: 'Mañana, 10:00 AM',
      type: 'consulta',
    },
    {
      id: '3',
      title: 'Desparasitación',
      petName: 'Max',
      date: '15 Oct, 2:30 PM',
      type: 'medicamento',
    },
  ];

  // Función para obtener el ícono según el tipo de recordatorio
  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'vacuna':
        return '💉';
      case 'consulta':
        return '👨‍⚕️';
      case 'medicamento':
        return '💊';
      default:
        return '📅';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con botón de perfil */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, Camila!</Text>
          <Text style={styles.subtitle}>Bienvenida a PocketVet</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
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
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.remindersScroll}
        >
          {reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderHeader}>
                <Text style={styles.reminderIcon}>{getReminderIcon(reminder.type)}</Text>
                <View style={styles.reminderBadge}>
                  <Text style={styles.reminderBadgeText}>Próximo</Text>
                </View>
              </View>
              <Text style={styles.reminderTitle}>{reminder.title}</Text>
              <Text style={styles.reminderPet}>{reminder.petName}</Text>
              <Text style={styles.reminderDate}>{reminder.date}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Sección de Mascotas Rápidas */}
      <View style={styles.petsSection}>
        <Text style={styles.sectionTitle}>Tus Mascotas</Text>
        <View style={styles.petsGrid}>

      <TouchableOpacity
        style={styles.petCard}
        onPress={() => navigation.navigate('PetProfile', {
          pet: {
            name: 'Max',
            species: 'Perro',
            breed: 'Labrador',
            age: '3 años',
            weight: '25',
            image: 'https://via.placeholder.com/150x150?text=🐶'
          }
        })}
      >
        <Text style={styles.petIcon}>🐶</Text>
        <Text style={styles.petName}>Max</Text>
        <Text style={styles.petBreed}>Labrador</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.petCard}
        onPress={() => navigation.navigate('PetProfile', {
          pet: {
            name: 'Luna',
            species: 'Gato',
            breed: 'Siamés',
            age: '2 años',
            weight: '4',
            image: 'https://via.placeholder.com/150x150?text=🐱'
          }
        })}
      >
        <Text style={styles.petIcon}>🐱</Text>
        <Text style={styles.petName}>Luna</Text>
        <Text style={styles.petBreed}>Siamés</Text>
      </TouchableOpacity>


          <TouchableOpacity
            style={[styles.petCard, styles.addPetCard]}
            onPress={() => navigation.navigate('Upload')}
          >
            <Text style={styles.addPetIcon}>+</Text>
            <Text style={styles.addPetText}>Agregar Mascota</Text>
          </TouchableOpacity>
        </View>
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
