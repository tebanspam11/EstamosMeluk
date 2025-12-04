import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Alert, SafeAreaView, Platform, ActivityIndicator, Switch } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from '../../src/config/api';
import { useNotifications } from '../../src/hooks/useNotifications';
import { scheduleMultipleEventReminders, cancelNotification } from '../../src/services/notificationService';

type EventStatus = 'Pendiente' | 'Completo' | 'Cancelado';

interface Event {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  estado: EventStatus;
  repeticion?: string | null;
  id_mascota: number;
  notificationIds?: string[];
}

interface Pet {
  id: number;
  nombre: string;
  especie: string;
  foto?: string;
}

interface NewEvent {
  titulo: string;
  descripcion?: string;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  estado: EventStatus;
  repeticion?: string | null;
  id_mascota: number;
  enableNotifications?: boolean;
  notificationIds?: string[];
}

export default function CalendarScreen() {
  const navigation = useNavigation();

  const { expoPushToken } = useNotifications();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<string>('');

  const defaultInitialTime = new Date(selectedDate);
  defaultInitialTime.setHours(0, 0, 0, 0);

  const defaultEndTime = new Date(selectedDate);
  defaultEndTime.setHours(0, 0, 0, 0);

  const [newEvent, setNewEvent] = useState<NewEvent>({
    titulo: '',
    descripcion: '',
    fecha_inicio: defaultInitialTime,
    fecha_fin: defaultEndTime,
    estado: 'Pendiente',
    repeticion: null,
    id_mascota: 0,
    enableNotifications: true,
    notificationIds: [],
  });

  useFocusEffect(
    React.useCallback(() => {
      validateActiveSession();
      cargarDatos();
    }, [])
  );

  const validateActiveSession = () => {
    const token = AsyncStorage.getItem('token');
    if (!token) navigation.navigate('Login' as never);
  };

  const cargarDatos = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const [eventosRes, mascotasRes] = await Promise.all([fetch(`${API_URL}/eventos`, { headers }), fetch(`${API_URL}/mascotas`, { headers })]);

    if (eventosRes.ok) {
      const eventosData = await eventosRes.json();
      setEvents(eventosData);
    }

    if (mascotasRes.ok) {
      const mascotasData = await mascotasRes.json();
      setPets(mascotasData);

      if (mascotasData.length > 0 && newEvent.id_mascota === 0) {
        setNewEvent((prev) => ({ ...prev, id_mascota: mascotasData[0].id }));
      }
    }
    setLoading(false);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.fecha_inicio);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleAddEvent = async () => {
    const token = await AsyncStorage.getItem('token');

    const eventStart = new Date(selectedDate);
    if (newEvent.fecha_inicio) {
      const selectedTime = newEvent.fecha_inicio;
      eventStart.setHours(selectedTime.getHours());
      eventStart.setMinutes(selectedTime.getMinutes());
      eventStart.setSeconds(0);
    }

    const eventData = {
      id_mascota: newEvent.id_mascota,
      titulo: newEvent.titulo,
      descripcion: newEvent.descripcion || null,
      fecha_inicio: eventStart.toISOString(),
      fecha_fin: newEvent.fecha_fin ? newEvent.fecha_fin.toISOString() : null,
      estado: 'Pendiente',
      repeticion: newEvent.repeticion || null,
    };

    const response = await fetch(`${API_URL}/eventos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (response.ok) {
      if (newEvent.enableNotifications) {
        try {
          const notificationIds = await scheduleMultipleEventReminders(
            newEvent.titulo,
            eventStart,
            [5, 3, 1] // Para pruebas: 5, 3 y 1 minuto antes
          );
          console.log('Notificaciones programadas:', notificationIds);
          console.log('Fecha del evento:', eventStart);
          console.log('Hora actual:', new Date());

          if (notificationIds.length === 0) {
            Alert.alert('Evento agregado', 'No se programaron notificaciones porque el evento está muy cerca. Crea un evento con al menos 5 minutos de anticipación.');
          } else {
            Alert.alert(
              'Éxito',
              `Evento agregado con ${notificationIds.length} recordatorio${notificationIds.length > 1 ? 's' : ''} programado${notificationIds.length > 1 ? 's' : ''}\n\nRecibirás notificaciones en: 1, 3 y 5 minutos antes del evento`
            );
          }
        } catch (error) {
          console.error('Error al programar notificaciones:', error);
          Alert.alert('Evento agregado', 'Pero no se pudieron programar las notificaciones');
        }
      } else {
        Alert.alert('Éxito', `Evento agregado para el ${eventStart.toLocaleDateString('es-ES')}`);
      }

      setShowModal(false);
      resetNewEvent();
      cargarDatos();
    } else {
      const data = await response.json();
      Alert.alert('Error', data?.error);
    }
  };

  const resetNewEvent = () => {
    const defaultTime = new Date(selectedDate);
    defaultTime.setHours(0, 0, 0, 0);

    const defaultEndTime = new Date(selectedDate);
    defaultEndTime.setHours(0, 0, 0, 0);

    setSelectedEventType('');
    setNewEvent({
      titulo: '',
      descripcion: '',
      fecha_inicio: defaultTime,
      fecha_fin: defaultEndTime,
      estado: 'Pendiente',
      repeticion: null,
      id_mascota: pets.length > 0 ? pets[0].id : 0,
      enableNotifications: true,
      notificationIds: [],
    });
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    const eventType = ['Vacuna', 'Consulta', 'Baño', 'Desparasitación'].find((type) => event.titulo.toLowerCase().includes(type));
    setSelectedEventType(eventType || (event.titulo ? 'Otro...' : ''));
    setShowEditModal(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
    const token = await AsyncStorage.getItem('token');

    const eventData = {
      titulo: editingEvent.titulo,
      descripcion: editingEvent.descripcion || null,
      fecha_inicio: editingEvent.fecha_inicio,
      fecha_fin: editingEvent.fecha_fin || null,
      estado: editingEvent.estado,
      repeticion: editingEvent.repeticion || null,
    };

    const response = await fetch(`${API_URL}/eventos/${editingEvent.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (response.ok) {
      Alert.alert('Éxito', 'Evento actualizado correctamente');
      setShowEditModal(false);
      setEditingEvent(null);
      cargarDatos();
    } else {
      const data = await response.json();
      Alert.alert('Error', data?.error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;

    Alert.alert('Eliminar Evento', '¿Estás seguro de que deseas eliminar este evento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(`${API_URL}/eventos/${editingEvent.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            Alert.alert('Éxito', 'Evento eliminado correctamente');
            setShowEditModal(false);
            setEditingEvent(null);
            cargarDatos();
          } else {
            Alert.alert('Error', 'No se pudo eliminar el evento');
          }
        },
      },
    ]);
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }

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
      const combinedDate = new Date(selectedDate);
      combinedDate.setHours(date.getHours());
      combinedDate.setMinutes(date.getMinutes());
      setNewEvent({ ...newEvent, fecha_inicio: combinedDate });
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setShowEndDatePicker(false);
    if (date) {
      const combinedDate = new Date(selectedDate);
      combinedDate.setHours(date.getHours());
      combinedDate.setMinutes(date.getMinutes());
      setNewEvent({ ...newEvent, fecha_fin: combinedDate });
    }
  };

  const days = getDaysInMonth(selectedDate);
  const todayEvents = getEventsForDate(selectedDate);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Cargando calendario...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendario</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Selector de Mes */}
        <View style={styles.monthSelector}>
          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(selectedDate.getMonth() - 1);
              setSelectedDate(newDate);
            }}
          >
            <Text style={styles.monthArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{selectedDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</Text>
          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(selectedDate.getMonth() + 1);
              setSelectedDate(newDate);
            }}
          >
            <Text style={styles.monthArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Días de la semana */}
        <View style={styles.weekDays}>
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <Text key={day} style={styles.weekDayText}>
              {day}
            </Text>
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
                style={[styles.dayCell, !day.isCurrentMonth && styles.otherMonthDay, isToday && styles.todayCell, isSelected && styles.selectedCell]}
                onPress={() => setSelectedDate(day.date)}
              >
                <Text style={[styles.dayText, !day.isCurrentMonth && styles.otherMonthText, isToday && styles.todayText, isSelected && styles.selectedText]}>{day.date.getDate()}</Text>
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
          <Text style={styles.sectionTitle}>Eventos para {selectedDate.toLocaleDateString('es-ES')}</Text>
          <ScrollView style={styles.eventsList}>
            {todayEvents.length === 0 ? (
              <Text style={styles.noEventsText}>No hay eventos para este día</Text>
            ) : (
              todayEvents.map((event) => {
                const pet = pets.find((p) => p.id === event.id_mascota);
                return (
                  <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => handleEditEvent(event)}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventIcon}>{getEventIcon(event.titulo)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.estado) }]}>
                        <Text style={styles.statusText}>{event.estado}</Text>
                      </View>
                    </View>
                    <Text style={styles.eventTitle}>{event.titulo}</Text>
                    <Text style={styles.eventPet}>
                      {pet?.nombre} • {pet?.especie}
                    </Text>
                    <Text style={styles.eventTime}>
                      {new Date(event.fecha_inicio).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {event.descripcion && <Text style={styles.eventDescription}>{event.descripcion}</Text>}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Modal para Agregar Evento */}
      <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Evento</Text>

            <ScrollView style={styles.modalForm}>
              {/* Mascota */}
              <Text style={styles.label}>Mascota</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petsScroll}>
                {pets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={[styles.petOption, newEvent.id_mascota === pet.id && styles.selectedPetOption]}
                    onPress={() => setNewEvent({ ...newEvent, id_mascota: pet.id })}
                  >
                    <Text style={styles.petIcon}>{pet.especie?.toLowerCase() === 'perro' ? '🐶' : pet.especie?.toLowerCase() === 'gato' ? '🐱' : '🐾'}</Text>
                    <Text style={styles.petName}>{pet.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Tipo de Evento */}
              <Text style={styles.label}>Tipo de Evento</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventTypesScroll}>
                {['Vacuna', 'Consulta', 'Baño', 'Desparasitación', 'otro'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.eventTypeOption, selectedEventType === type && styles.selectedEventType]}
                    onPress={() => {
                      setSelectedEventType(type);
                      if (type !== 'otro') {
                        setNewEvent({ ...newEvent, titulo: type });
                      } else {
                        setNewEvent({ ...newEvent, titulo: '' });
                      }
                    }}
                  >
                    <Text style={styles.eventTypeIcon}>{getEventIcon(type)}</Text>
                    <Text style={styles.eventTypeText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Título - Solo editable si es 'otro' o no se ha seleccionado tipo */}
              {(selectedEventType === 'otro' || selectedEventType === '') && (
                <>
                  <Text style={styles.label}>{selectedEventType === 'otro' ? 'Título Personalizado' : 'Título del Evento'}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={selectedEventType === 'otro' ? 'Escribe el tipo de evento' : 'Ej: Vacuna anual'}
                    value={newEvent.titulo}
                    onChangeText={(text) => setNewEvent({ ...newEvent, titulo: text })}
                  />
                </>
              )}

              {/* Descripción */}
              <Text style={styles.label}>Descripción (Opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción del evento..."
                value={newEvent.descripcion}
                onChangeText={(text) => setNewEvent({ ...newEvent, descripcion: text })}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Hora del Evento</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
                <Text style={styles.dateButtonText}>
                  {newEvent.fecha_inicio?.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>

              {showStartDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={newEvent.fecha_inicio || new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleStartDateChange}
                    textColor="#000000"
                    style={styles.datePicker}
                  />
                </View>
              )}

              <Text style={styles.label}>Fecha de fin (Opcional)</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
                <Text style={styles.dateButtonText}>
                  {newEvent.fecha_fin?.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>

              {showEndDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={newEvent.fecha_fin || new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleEndDateChange}
                    textColor="#000000"
                    style={styles.datePicker}
                  />
                </View>
              )}

              {/* Habilitar Notificaciones */}
              <View style={styles.notificationToggle}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.label}>🔔 Recordatorios</Text>
                  <Text style={styles.notificationDescription}>Se enviarán notificaciones 1, 3 y 5 minutos antes del evento</Text>
                </View>
                <Switch
                  value={newEvent.enableNotifications}
                  onValueChange={(value) => setNewEvent({ ...newEvent, enableNotifications: value })}
                  trackColor={{ false: '#ccc', true: '#4A90E2' }}
                  thumbColor={newEvent.enableNotifications ? '#fff' : '#f4f3f4'}
                />
              </View>
            </ScrollView>

            {/* Botones del Modal */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, (!newEvent.titulo || newEvent.titulo.trim() === '' || !newEvent.fecha_inicio) && styles.disabledButton]}
                onPress={handleAddEvent}
                disabled={!newEvent.titulo || newEvent.titulo.trim() === '' || !newEvent.fecha_inicio}
              >
                <Text style={[styles.saveButtonText, (!newEvent.titulo || newEvent.titulo.trim() === '' || !newEvent.fecha_inicio) && styles.disabledButtonText]}>Guardar Evento</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Editar Evento */}
      {editingEvent && (
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowEditModal(false);
            setEditingEvent(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Evento</Text>

              <ScrollView style={styles.modalForm}>
                {/* Mascota */}
                <Text style={styles.label}>Mascota</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petsScroll}>
                  {pets.map((pet) => (
                    <TouchableOpacity
                      key={pet.id}
                      style={[styles.petOption, editingEvent.id_mascota === pet.id && styles.selectedPetOption]}
                      onPress={() => setEditingEvent({ ...editingEvent, id_mascota: pet.id })}
                    >
                      <Text style={styles.petIcon}>{pet.especie?.toLowerCase() === 'perro' ? '🐶' : pet.especie?.toLowerCase() === 'gato' ? '🐱' : '🐾'}</Text>
                      <Text style={styles.petName}>{pet.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Estado */}
                <Text style={styles.label}>Estado del Evento</Text>
                <View style={styles.statusContainer}>
                  {(['Pendiente', 'Completo', 'Cancelado'] as EventStatus[]).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        editingEvent.estado === status && styles.selectedStatusOption,
                        { backgroundColor: editingEvent.estado === status ? getStatusColor(status) : '#f0f0f0' },
                      ]}
                      onPress={() => setEditingEvent({ ...editingEvent, estado: status })}
                    >
                      <Text style={[styles.statusOptionText, editingEvent.estado === status && styles.selectedStatusText]}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Tipo de Evento */}
                <Text style={styles.label}>Tipo de Evento</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventTypesScroll}>
                  {['vacuna', 'consulta', 'baño', 'desparasitación', 'otro'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.eventTypeOption, selectedEventType === type && styles.selectedEventType]}
                      onPress={() => {
                        setSelectedEventType(type);
                        if (type !== 'otro') {
                          setEditingEvent({ ...editingEvent, titulo: type });
                        } else {
                          setEditingEvent({ ...editingEvent, titulo: '' });
                        }
                      }}
                    >
                      <Text style={styles.eventTypeIcon}>{getEventIcon(type)}</Text>
                      <Text style={styles.eventTypeText}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {(selectedEventType === 'otro' || selectedEventType === '') && (
                  <>
                    <Text style={styles.label}>{selectedEventType === 'otro' ? 'Título Personalizado' : 'Título del Evento'}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={selectedEventType === 'otro' ? 'Escribe el tipo de evento' : 'Título del evento'}
                      value={editingEvent.titulo}
                      onChangeText={(text) => setEditingEvent({ ...editingEvent, titulo: text })}
                    />
                  </>
                )}

                {/* Descripción */}
                <Text style={styles.label}>Descripción (Opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descripción del evento..."
                  value={editingEvent.descripcion || ''}
                  onChangeText={(text) => setEditingEvent({ ...editingEvent, descripcion: text })}
                  multiline
                  numberOfLines={3}
                />

                {/* Hora del Evento */}
                <Text style={styles.label}>Hora del Evento</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
                  <Text style={styles.dateButtonText}>
                    {new Date(editingEvent.fecha_inicio).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>

                {showStartDatePicker && (
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={new Date(editingEvent.fecha_inicio)}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, date) => {
                        setShowStartDatePicker(false);
                        if (date) {
                          const updatedDate = new Date(editingEvent.fecha_inicio);
                          updatedDate.setHours(date.getHours());
                          updatedDate.setMinutes(date.getMinutes());
                          setEditingEvent({ ...editingEvent, fecha_inicio: updatedDate.toISOString() });
                        }
                      }}
                      textColor="#000000"
                      style={styles.datePicker}
                    />
                  </View>
                )}

                {/* Duración (Opcional) */}
                <Text style={styles.label}>Hora de fin (Opcional)</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
                  <Text style={styles.dateButtonText}>
                    {editingEvent.fecha_fin
                      ? new Date(editingEvent.fecha_fin).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Seleccionar hora de fin'}
                  </Text>
                </TouchableOpacity>

                {showEndDatePicker && (
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={editingEvent.fecha_fin ? new Date(editingEvent.fecha_fin) : new Date()}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, date) => {
                        setShowEndDatePicker(false);
                        if (date) {
                          const updatedDate = new Date(editingEvent.fecha_inicio);
                          updatedDate.setHours(date.getHours());
                          updatedDate.setMinutes(date.getMinutes());
                          setEditingEvent({ ...editingEvent, fecha_fin: updatedDate.toISOString() });
                        }
                      }}
                      textColor="#000000"
                      style={styles.datePicker}
                    />
                  </View>
                )}
              </ScrollView>

              {/* Botones del Modal */}
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={handleDeleteEvent}>
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowEditModal(false);
                    setEditingEvent(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleUpdateEvent}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
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
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: 200,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  eventsList: {
    flexGrow: 1,
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
    textTransform: 'capitalize',
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
    fontSize: 28,
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
    color: '#333',
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
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    minHeight: 200,
  },
  datePicker: {
    width: '100%',
    height: 180,
    backgroundColor: '#fff',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#666',
  },
  petDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  petDisplayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedStatusOption: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedStatusText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 12,
  },
  notificationDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
});
