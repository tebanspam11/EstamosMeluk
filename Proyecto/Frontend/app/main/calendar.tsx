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
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
let DateTimePicker: any;
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (error) {
  console.warn('DateTimePicker no está disponible');
}

// Tipos de datos
type EventType = 'vacuna' | 'consulta' | 'baño' | 'desparasitación' | 'otro';
type EventStatus = 'Pendiente' | 'Completo' | 'Cancelado';

interface Event {
  id: number;
  id_mascota: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: Date;
  fecha_fin: Date | null;
  estado: EventStatus;
  repeticion: string | null;
  created_at: Date;
  updated_at: Date;
}

interface Pet {
  id: number;
  nombre: string;
  tipo: string;
}


export default function CalendarScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  // Estado para nuevo evento
const [newEvent, setNewEvent] = useState<Partial<Event>>({
  titulo: '',
  descripcion: '',
  fecha_inicio: selectedDate, 
  fecha_fin: null,
  estado: 'Pendiente',
  repeticion: null,
  id_mascota: 1,
});

  // Mascotas ejemplo
  const pets: Pet[] = [
    { id: 1, nombre: 'Max', tipo: 'Perro' },
    { id: 2, nombre: 'Luna', tipo: 'Gato' },
  ];

  // Eventos de ejemplo
  const sampleEvents: Event[] = [
    {
      id: 1,
      id_mascota: 1,
      titulo: 'Vacuna antirrábica',
      descripcion: 'Aplicación de vacuna antirrábica anual',
      fecha_inicio: new Date(2024, 10, 15, 10, 0),
      fecha_fin: new Date(2024, 10, 15, 11, 0),
      estado: 'Pendiente',
      repeticion: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      id_mascota: 2,
      titulo: 'Consulta general',
      descripcion: 'Revisión mensual de salud',
      fecha_inicio: new Date(2024, 10, 18, 15, 30),
      fecha_fin: new Date(2024, 10, 18, 16, 30),
      estado: 'Pendiente',
      repeticion: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  useEffect(() => {
    setEvents(sampleEvents);
  }, []);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.fecha_inicio);
      return eventDate.toDateString() === date.toDateString();
    });
  };

const handleAddEvent = () => {
  if (!newEvent.titulo) {
    Alert.alert('Error', 'Por favor completa el título del evento');
    return;
  }

  const eventStart = new Date(selectedDate);
  
  if (newEvent.fecha_inicio) {
    const selectedTime = newEvent.fecha_inicio;
    eventStart.setHours(selectedTime.getHours());
    eventStart.setMinutes(selectedTime.getMinutes());
    eventStart.setSeconds(0);
  }

  const event: Event = {
    id: events.length + 1,
    id_mascota: newEvent.id_mascota || 1,
    titulo: newEvent.titulo,
    descripcion: newEvent.descripcion || '',
    fecha_inicio: eventStart, 
    fecha_fin: newEvent.fecha_fin || null,
    estado: 'Pendiente',
    repeticion: newEvent.repeticion || null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  setEvents([...events, event]);
  setShowModal(false);
  resetNewEvent();
  Alert.alert('Éxito', `Evento agregado para el ${eventStart.toLocaleDateString('es-ES')}`);
};

const resetNewEvent = () => {
  const defaultTime = new Date(selectedDate);
  defaultTime.setHours(12, 0, 0, 0); // Hora por defecto: 12:00 PM
  
  setNewEvent({
    titulo: '',
    descripcion: '',
    fecha_inicio: defaultTime,
    fecha_fin: null,
    estado: 'Pendiente',
    repeticion: null,
    id_mascota: 1,
  });
};

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vacuna':
        return '💉';
      case 'consulta':
        return '👨‍⚕️';
      case 'baño':
        return '🛁';
      case 'desparasitación':
        return '💊';
      default:
        return '📅';
    }
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'Pendiente':
        return '#4A90E2';
      case 'Completo':
        return '#4CAF50';
      case 'Cancelado':
        return '#FF6B6B';
      default:
        return '#666';
    }
  };

  // Generar días del mes
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Array<{date: Date, isCurrentMonth: boolean}> = [];

    // Días del mes anterior
    for (let i = firstDay.getDay() - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }

    // Días del próximo mes
    const totalCells = 42;
    while (days.length < totalCells) {
      const nextDateValue = new Date(year, month + 1, days.length - lastDay.getDate() + 1);
      days.push({ date: nextDateValue, isCurrentMonth: false });
    }

    return days;
  };

const handleStartDateChange = (event: any, date?: Date) => {
  setShowStartDatePicker(false);
  if (date) {
    // Combina la fecha seleccionada en el calendario con la hora del picker
    const combinedDate = new Date(selectedDate);
    combinedDate.setHours(date.getHours());
    combinedDate.setMinutes(date.getMinutes());
    setNewEvent({...newEvent, fecha_inicio: combinedDate});
  }
};

const handleEndDateChange = (event: any, date?: Date) => {
  setShowEndDatePicker(false);
  if (date) {
    // Combina la fecha seleccionada con la hora de fin
    const combinedDate = new Date(selectedDate);
    combinedDate.setHours(date.getHours());
    combinedDate.setMinutes(date.getMinutes());
    setNewEvent({...newEvent, fecha_fin: combinedDate});
  }
};

  const days = getDaysInMonth(selectedDate);
  const todayEvents = getEventsForDate(selectedDate);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendario</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de Mes */}
<View style={styles.monthSelector}>
  <TouchableOpacity onPress={() => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() - 1);
    setSelectedDate(newDate);
  }}>
    <Text style={styles.monthArrow}>‹</Text>
  </TouchableOpacity>
  <Text style={styles.monthText}>
    {selectedDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
  </Text>
  <TouchableOpacity onPress={() => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + 1);
    setSelectedDate(newDate);
  }}>
    <Text style={styles.monthArrow}>›</Text>
  </TouchableOpacity>
</View>

      {/* Días de la semana */}
      <View style={styles.weekDays}>
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      {/* Grid del Calendario */}
      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          const isToday = day.date.toDateString() === new Date().toDateString();
          const isSelected = day.date.toDateString() === selectedDate.toDateString();
          const dayEvents = getEventsForDate(day.date);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.otherMonthDay,
                isToday && styles.todayCell,
                isSelected && styles.selectedCell,
              ]}
              onPress={() => setSelectedDate(day.date)}
            >
              <Text style={[
                styles.dayText,
                !day.isCurrentMonth && styles.otherMonthText,
                isToday && styles.todayText,
                isSelected && styles.selectedText,
              ]}>
                {day.date.getDate()}
              </Text>
              {dayEvents.length > 0 && (
                <View style={styles.eventDots}>
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <Text key={eventIndex} style={styles.eventDot}>
                      {getEventIcon(event.titulo)}
                    </Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Eventos del Día Seleccionado */}
      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>
          Eventos para {selectedDate.toLocaleDateString('es-ES')}
        </Text>
        <ScrollView style={styles.eventsList}>
          {todayEvents.length === 0 ? (
            <Text style={styles.noEventsText}>No hay eventos para este día</Text>
          ) : (
            todayEvents.map(event => {
              const pet = pets.find(p => p.id === event.id_mascota);
              return (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventIcon}>
                      {getEventIcon(event.titulo)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.estado) }]}>
                      <Text style={styles.statusText}>{event.estado}</Text>
                    </View>
                  </View>
                  <Text style={styles.eventTitle}>{event.titulo}</Text>
                  <Text style={styles.eventPet}>{pet?.nombre} • {pet?.tipo}</Text>
                  <Text style={styles.eventTime}>
                    {new Date(event.fecha_inicio).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                  {event.descripcion && (
                    <Text style={styles.eventDescription}>{event.descripcion}</Text>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Modal para Agregar Evento */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Evento</Text>

            <ScrollView style={styles.modalForm}>
              {/* Mascota */}
              <Text style={styles.label}>Mascota</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petsScroll}>
                {pets.map(pet => (
                  <TouchableOpacity
                    key={pet.id}
                    style={[
                      styles.petOption,
                      newEvent.id_mascota === pet.id && styles.selectedPetOption
                    ]}
                    onPress={() => setNewEvent({...newEvent, id_mascota: pet.id})}
                  >
                    <Text style={styles.petIcon}>🐶</Text>
                    <Text style={styles.petName}>{pet.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Tipo de Evento */}
              <Text style={styles.label}>Tipo de Evento</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventTypesScroll}>
                {['vacuna', 'consulta', 'baño', 'desparasitación', 'otro'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.eventTypeOption,
                      newEvent.titulo?.toLowerCase().includes(type) && styles.selectedEventType
                    ]}
                    onPress={() => setNewEvent({...newEvent, titulo: type})}
                  >
                    <Text style={styles.eventTypeIcon}>{getEventIcon(type)}</Text>
                    <Text style={styles.eventTypeText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Título */}
              <Text style={styles.label}>Título del Evento</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Vacuna anual"
                value={newEvent.titulo}
                onChangeText={(text) => setNewEvent({...newEvent, titulo: text})}
              />

              {/* Descripción */}
              <Text style={styles.label}>Descripción (Opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción del evento..."
                value={newEvent.descripcion}
                onChangeText={(text) => setNewEvent({...newEvent, descripcion: text})}
                multiline
                numberOfLines={3}
              />

            <Text style={styles.label}>Hora del Evento</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {newEvent.fecha_inicio?.toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Duración (Opcional)</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {newEvent.fecha_fin 
                  ? newEvent.fecha_fin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                  : 'Seleccionar hora de fin'
                }
              </Text>
            </TouchableOpacity>

              {showEndDatePicker && (
                <DateTimePicker
                  value={newEvent.fecha_fin || new Date()}
                  mode="datetime"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndDateChange}
                />
              )}
            </ScrollView>

            {/* Botones del Modal */}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddEvent}
              >
                <Text style={styles.saveButtonText}>Guardar Evento</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
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
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
monthArrow: {
  fontSize: 28, 
  color: '#4A90E2',
  fontWeight: 'bold',
  paddingHorizontal: 20, 
  paddingVertical: 10,
},
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  weekDays: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    padding: 5,
  },
dayCell: {
  width: '14.28%',
  height: 60,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 8, 
},
  otherMonthDay: {
    opacity: 0.3,
  },
  todayCell: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
  },
  selectedCell: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  otherMonthText: {
    color: '#999',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  eventDots: {
    flexDirection: 'row',
    marginTop: 2,
  },
  eventDot: {
    fontSize: 8,
    marginHorizontal: 1,
  },
  eventsSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  eventsList: {
    flex: 1,
  },
  noEventsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventIcon: {
    fontSize: 24,
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
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventPet: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'flex-start', 
},

modalContent: {
  backgroundColor: '#fff',
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20, 
  maxHeight: '90%',
  marginTop: 50,
},
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
modalForm: {
  padding: 20,
  maxHeight: 500, 
},
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  petsScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  petOption: {
    alignItems: 'center',
    padding: 12,
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
    fontSize: 20,
    marginBottom: 4,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  eventTypesScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  eventTypeOption: {
    alignItems: 'center',
    padding: 12,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    minWidth: 80,
  },
  selectedEventType: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4A90E2',
    borderWidth: 2,
  },
  eventTypeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  eventTypeText: {
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
  paddingVertical: 14,
  fontSize: 16,
  color: '#333', // Asegúrate que sea oscuro
},
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
dateButtonText: {
  fontSize: 16,
  color: '#100f0fff', 
  fontWeight: '500',
},
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
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
