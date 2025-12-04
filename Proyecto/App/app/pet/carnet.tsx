import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Alert, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../src/config/api';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import carnetFormat from '../../src/services/carnetFormat';
import { Mascota, CarnetDigital } from '../../src/types/index';
import { useDatesValidation } from '../../src/hooks/useDatesValidation';
import { Picker } from '@react-native-picker/picker';

export default function CarnetScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState<Mascota | null>(null);
  const [registrosCarnet, setRegistrosCarnet] = useState<CarnetDigital[]>([]);
  const [editarRegistro, setEditarRegistro] = useState<CarnetDigital | null>(null);
  const [mostrarPaginaNuevoRegistro, setMostrarPaginaNuevoRegistro] = useState(false);
  const [mostrarPaginaEditarRegistro, setMostrarPaginaEditarRegistro] = useState(false);
  const [mostrarPaginaMascotas, setMostrarPaginaMascotas] = useState(false);

  const [proximaDia, setProximaDia] = useState('');
  const [proximaMes, setProximaMes] = useState('');
  const [proximaAno, setProximaAno] = useState('');

  const [aplicacionDia, setAplicacionDia] = useState('');
  const [aplicacionMes, setAplicacionMes] = useState('');
  const [aplicacionAno, setAplicacionAno] = useState('');

  const [elaboracionMes, setElaboracionMes] = useState('');
  const [elaboracionAno, setElaboracionAno] = useState('');
  const [vencimientoMes, setVencimientoMes] = useState('');
  const [vencimientoAno, setVencimientoAno] = useState('');

  const { fechaAplicacionError, proximaDosisError, areDatesValid } = useDatesValidation(`${aplicacionDia}/${aplicacionMes}/${aplicacionAno}`, `${proximaDia}/${proximaMes}/${proximaAno}`);

  const [nuevoRegistro, setNuevoRegistro] = useState<Partial<CarnetDigital>>({
    tipo_medicamento: 'Vacuna',
    nombre_medicamento: '',
    fecha_aplicacion: new Date(),
    laboratorio: '',
    id_lote: '',
    mes_elaboracion_medicamento: null,
    ano_elaboracion_medicamento: null,
    mes_vencimiento_medicamento: 0,
    ano_vencimiento_medicamento: 0,
    peso: 0,
    nombre_veterinaria: '',
    telefono_veterinaria: null,
    direccion_veterinaria: '',
    proxima_dosis: null,
    observaciones: null,
  });

  useFocusEffect(
    React.useCallback(() => {
      validarSesionActiva();
      obtenerMascotas();
    }, [])
  );

  const validarSesionActiva = async () => {
    const isUserLogged = await AsyncStorage.getItem('token');
    if (!isUserLogged) navigation.navigate('Login' as never);
  };

  const obtenerMascotas = async () => {
    const tokenUsuario = await AsyncStorage.getItem('token');

    const respuestaDeDB = await fetch(`${API_URL}/mascotas`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenUsuario}` },
    });

    const mascotasDesdeDB = await respuestaDeDB.json();
    setMascotas(mascotasDesdeDB);

    if (mascotasDesdeDB.length > 0) setMascotaSeleccionada(mascotasDesdeDB[0]);
  };

  const obtenerURLdeFoto = (foto: string | null) => {
    if (!foto) return 'https://via.placeholder.com/50?text=🐾';

    if (foto.startsWith('file://') || foto.startsWith('content://')) return foto;

    const baseUrl = API_URL.replace('/api', '');
    const url = `${baseUrl}/uploads/mascotas/${foto}`;
    return url;
  };

  useEffect(() => {
    if (mascotaSeleccionada) obtenerRegistrosCarnet(mascotaSeleccionada.id);
  }, [mascotaSeleccionada]);

  const obtenerRegistrosCarnet = async (id_mascota: number) => {
    setLoading(true);

    const tokenUsuario = await AsyncStorage.getItem('token');
    const respuestaDeDB = await fetch(`${API_URL}/carnet/mascota/${id_mascota}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenUsuario}` },
    });

    const registrosCarnetDesdeDB = await respuestaDeDB.json();
    setRegistrosCarnet(registrosCarnetDesdeDB);

    setLoading(false);
  };

  const resetearNuevoRegistro = () => {
    setNuevoRegistro({
      tipo_medicamento: 'Vacuna',
      nombre_medicamento: '',
      fecha_aplicacion: new Date(),
      laboratorio: '',
      id_lote: '',
      mes_elaboracion_medicamento: null,
      ano_elaboracion_medicamento: null,
      mes_vencimiento_medicamento: 0,
      ano_vencimiento_medicamento: 0,
      peso: 0,
      nombre_veterinaria: '',
      telefono_veterinaria: null,
      direccion_veterinaria: '',
      proxima_dosis: null,
      observaciones: null,
    });

    setProximaDia('');
    setProximaMes('');
    setProximaAno('');
    setAplicacionDia('');
    setAplicacionMes('');
    setAplicacionAno('');
    setElaboracionMes('');
    setElaboracionAno('');
    setVencimientoMes('');
    setVencimientoAno('');
  };

  const crearRegistroCarnet = async () => {
    setSubmitting(true);
    const tokenUsuario = await AsyncStorage.getItem('token');

    const registroCarnet = {
      id_mascota: mascotaSeleccionada!.id,
      tipo_medicamento: nuevoRegistro.tipo_medicamento,
      nombre_medicamento: nuevoRegistro.nombre_medicamento,
      fecha_aplicacion: nuevoRegistro.fecha_aplicacion,
      laboratorio: nuevoRegistro.laboratorio,
      id_lote: nuevoRegistro.id_lote,
      mes_elaboracion_medicamento: nuevoRegistro.mes_elaboracion_medicamento || null,
      ano_elaboracion_medicamento: nuevoRegistro.ano_elaboracion_medicamento || null,
      mes_vencimiento_medicamento: nuevoRegistro.mes_vencimiento_medicamento,
      ano_vencimiento_medicamento: nuevoRegistro.ano_vencimiento_medicamento,
      peso: nuevoRegistro.peso,
      nombre_veterinaria: nuevoRegistro.nombre_veterinaria,
      telefono_veterinaria: nuevoRegistro.telefono_veterinaria || null,
      direccion_veterinaria: nuevoRegistro.direccion_veterinaria,
      proxima_dosis: nuevoRegistro.proxima_dosis ? nuevoRegistro.proxima_dosis.toISOString() : null,
      observaciones: nuevoRegistro.observaciones || null,
    };

    const respuestaDeDB = await fetch(`${API_URL}/carnet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenUsuario}` },
      body: JSON.stringify(registroCarnet),
    });

    const nuevoRegistroCarnetDB = await respuestaDeDB.json();

    if (respuestaDeDB.ok && nuevoRegistroCarnetDB && nuevoRegistroCarnetDB.ok) {
      Alert.alert('Éxito', `Vacuna/desparasitación agregada al carnet de ${mascotaSeleccionada?.nombre}`);
      if (!mascotaSeleccionada) return;
      await obtenerRegistrosCarnet(mascotaSeleccionada.id);
      setMostrarPaginaNuevoRegistro(false);
      resetearNuevoRegistro();
    } else Alert.alert('Error en registro', nuevoRegistroCarnetDB?.error, [{ text: 'Intentar de nuevo' }]);

    setSubmitting(false);
  };

  const isFormularioValid = () => {
    return (
      mascotaSeleccionada &&
      nuevoRegistro.nombre_medicamento?.trim() &&
      nuevoRegistro.id_lote?.trim() &&
      nuevoRegistro.fecha_aplicacion &&
      nuevoRegistro.mes_vencimiento_medicamento &&
      nuevoRegistro.ano_vencimiento_medicamento &&
      nuevoRegistro.laboratorio?.trim() &&
      nuevoRegistro.peso &&
      nuevoRegistro.peso > 0 &&
      nuevoRegistro.nombre_veterinaria?.trim() &&
      nuevoRegistro.direccion_veterinaria?.trim() &&
      areDatesValid
    );
  };

  const editarRegistroCarnet = async () => {
    if (!editarRegistro) return;

    setSubmitting(true);
    const token = await AsyncStorage.getItem('token');

    const registroEditado = {
      telefono_veterinaria: editarRegistro.telefono_veterinaria || '',
      proxima_dosis: editarRegistro.proxima_dosis ? editarRegistro.proxima_dosis.toISOString() : null,
      observaciones: editarRegistro.observaciones || '',
    };

    const respuestaDeDB = await fetch(`${API_URL}/carnet/${editarRegistro.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(registroEditado),
    });

    const registroEditadoCarnetDB = await respuestaDeDB.json();

    if (respuestaDeDB.ok && registroEditadoCarnetDB && registroEditadoCarnetDB.ok) {
      Alert.alert('Éxito', `Vacuna/desparasitación actualizada al carnet de ${mascotaSeleccionada?.nombre}`);
      if (!mascotaSeleccionada) return;
      await obtenerRegistrosCarnet(mascotaSeleccionada.id);
      setMostrarPaginaEditarRegistro(false);
      setEditarRegistro(null);
    } else Alert.alert('Error en edición', registroEditadoCarnetDB?.error, [{ text: 'Intentar de nuevo' }]);

    setSubmitting(false);
  };

  const eliminarRegistroCarnet = async (id: number) => {
    Alert.alert('Eliminar Registro', '¿Estás segur@ de que deseas eliminar este registro del carnet?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const tokenUsuario = await AsyncStorage.getItem('token');

          const respuestaDeDB = await fetch(`${API_URL}/carnet/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${tokenUsuario}` },
          });

          const registroEliminadoCarnetDB = await respuestaDeDB.json();

          if (respuestaDeDB.ok && registroEliminadoCarnetDB && registroEliminadoCarnetDB.ok) {
            Alert.alert('Éxito', `Vacuna/desparasitación eliminada del carnet de ${mascotaSeleccionada?.nombre}`);
            if (!mascotaSeleccionada) return;
            await obtenerRegistrosCarnet(mascotaSeleccionada.id);
          } else Alert.alert('Error eliminando el registro', 'Intenta de nuevo', [{ text: 'Intentar de nuevo' }]);
        },
      },
    ]);
  };

  const exportarAPDF = async () => {
    if (!mascotaSeleccionada) return;

    const vacunas = obtenerRegistrosporTipoMedicamento('Vacuna');
    const desparasitaciones = obtenerRegistrosporTipoMedicamento('Desparasitación');

    const carnetHTML = carnetFormat(mascotaSeleccionada, vacunas, desparasitaciones);

    const { uri } = await Print.printToFileAsync({ html: carnetHTML });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Carnet_${mascotaSeleccionada.nombre}_${new Date().getTime()}.pdf` });
    } else Alert.alert('Éxito', `Tu PDF ha sido generado: ${uri}`);
  };

  const obtenerRegistrosporTipoMedicamento = (type: 'Vacuna' | 'Desparasitación') => {
    return registrosCarnet.filter((registro) => registro.tipo_medicamento === type && registro.id_mascota === mascotaSeleccionada?.id);
  };

  const isMedicamentoVigente = (medicamento: any) => {
    if (medicamento.ano_vencimiento_medicamento > new Date().getFullYear()) return true;
    if (medicamento.ano_vencimiento_medicamento === new Date().getFullYear() && medicamento.mes_vencimiento_medicamento >= new Date().getMonth() + 1) return true;
    return false;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carnet Digital</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportarAPDF}>
          <Text style={styles.exportButtonText}>📄 PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de Mascota */}
      <TouchableOpacity style={styles.petSelector} onPress={() => setMostrarPaginaMascotas(true)}>
        <Image source={{ uri: obtenerURLdeFoto(mascotaSeleccionada?.foto || null) }} style={styles.petImage} />
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{mascotaSeleccionada?.nombre || 'Seleccionar mascota'}</Text>
          <Text style={styles.petDetails}>{mascotaSeleccionada ? `${mascotaSeleccionada.raza} • ${mascotaSeleccionada.sexo}` : 'Toca para seleccionar'}</Text>
        </View>
        <Text style={styles.selectorArrow}>▼</Text>
      </TouchableOpacity>

      {/* Estadísticas Rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{obtenerRegistrosporTipoMedicamento('Vacuna').length}</Text>
          <Text style={styles.statLabel}>Vacunas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{obtenerRegistrosporTipoMedicamento('Desparasitación').length}</Text>
          <Text style={styles.statLabel}>Desparasitaciones</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{registrosCarnet.filter((r) => r.id_mascota === mascotaSeleccionada?.id && isMedicamentoVigente(r)).length}</Text>
          <Text style={styles.statLabel}>Vigentes</Text>
        </View>
      </View>

      {/* Botón Agregar Registro */}
      <TouchableOpacity style={styles.addRecordButton} onPress={() => setMostrarPaginaNuevoRegistro(true)}>
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
            {obtenerRegistrosporTipoMedicamento('Vacuna').length === 0 ? (
              <Text style={styles.emptyText}>No hay vacunas registradas</Text>
            ) : (
              obtenerRegistrosporTipoMedicamento('Vacuna').map((registro) => (
                <View key={registro.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordName}>{registro.nombre_medicamento}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: isMedicamentoVigente(registro) ? '#4CAF50' : '#FF6B6B' }]}>
                      <Text style={styles.statusText}>{isMedicamentoVigente(registro) ? 'Vigente' : 'Vencida'}</Text>
                    </View>
                  </View>
                  <Text style={styles.recordDetail}>Lote: {registro.id_lote}</Text>
                  <Text style={styles.recordDetail}>Aplicación: {new Date(registro.fecha_aplicacion).toLocaleDateString('es-ES')}</Text>
                  <Text style={styles.recordDetail}>Vence: {`${registro.mes_vencimiento_medicamento}/${registro.ano_vencimiento_medicamento}`}</Text>
                  {registro.observaciones && <Text style={styles.recordObservations}>{registro.observaciones}</Text>}
                  <View style={styles.recordActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setEditarRegistro(registro);
                        setMostrarPaginaEditarRegistro(true);
                      }}
                    >
                      <Text style={styles.editButtonText}>✏️ Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarRegistroCarnet(registro.id)}>
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
            {obtenerRegistrosporTipoMedicamento('Desparasitación').length === 0 ? (
              <Text style={styles.emptyText}>No hay desparasitaciones registradas</Text>
            ) : (
              obtenerRegistrosporTipoMedicamento('Desparasitación').map((registro) => (
                <View key={registro.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordName}>{registro.nombre_medicamento}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: isMedicamentoVigente(registro) ? '#4CAF50' : '#FF6B6B' }]}>
                      <Text style={styles.statusText}>{isMedicamentoVigente(registro) ? 'Vigente' : 'Vencida'}</Text>
                    </View>
                  </View>
                  <Text style={styles.recordDetail}>Lote: {registro.id_lote}</Text>
                  <Text style={styles.recordDetail}>Aplicación: {new Date(registro.fecha_aplicacion).toLocaleDateString('es-ES')}</Text>
                  <Text style={styles.recordDetail}>Vence: {`${registro.mes_vencimiento_medicamento}/${registro.ano_vencimiento_medicamento}`}</Text>
                  <Text style={styles.recordDetail}>Peso: {registro.peso} kg</Text>
                  {registro.observaciones && <Text style={styles.recordObservations}>{registro.observaciones}</Text>}
                  <View style={styles.recordActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setEditarRegistro(registro);
                        setMostrarPaginaEditarRegistro(true);
                      }}
                    >
                      <Text style={styles.editButtonText}>✏️ Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarRegistroCarnet(registro.id)}>
                      <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      <Modal visible={mostrarPaginaMascotas} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Mascota</Text>
            {mascotas.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petOption}
                onPress={() => {
                  setMascotaSeleccionada(pet);
                  setMostrarPaginaMascotas(false);
                }}
              >
                <Image source={{ uri: obtenerURLdeFoto(pet.foto) }} style={styles.petOptionImage} />
                <View style={styles.petOptionInfo}>
                  <Text style={styles.petOptionName}>{pet.nombre}</Text>
                  <Text style={styles.petOptionDetails}>
                    {pet.raza} • {pet.especie}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setMostrarPaginaMascotas(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Agregar Registro */}
      <Modal visible={mostrarPaginaNuevoRegistro} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.addModalContent]}>
            <Text style={styles.modalTitle}>Agregar Registro</Text>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Tipo de Medicamento *</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeOption, nuevoRegistro.tipo_medicamento === 'Vacuna' && styles.selectedType]}
                  onPress={() => setNuevoRegistro({ ...nuevoRegistro, tipo_medicamento: 'Vacuna' })}
                >
                  <Text style={styles.typeText}>VACUNA</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeOption, nuevoRegistro.tipo_medicamento === 'Desparasitación' && styles.selectedType]}
                  onPress={() => setNuevoRegistro({ ...nuevoRegistro, tipo_medicamento: 'Desparasitación' })}
                >
                  <Text style={styles.typeText}>DESPARACITACION</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Nombre del Medicamento *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Vacuna Antirrábica"
                value={nuevoRegistro.nombre_medicamento}
                onChangeText={(text) => setNuevoRegistro({ ...nuevoRegistro, nombre_medicamento: text })}
              />

              <Text style={styles.label}>ID Lote *</Text>
              <TextInput style={styles.input} placeholder="Ej: RB2024A" value={nuevoRegistro.id_lote} onChangeText={(text) => setNuevoRegistro({ ...nuevoRegistro, id_lote: text })} />

              <Text style={styles.label}>Laboratorio</Text>
              <TextInput style={styles.input} placeholder="Ej: Zoetis" value={nuevoRegistro.laboratorio} onChangeText={(text) => setNuevoRegistro({ ...nuevoRegistro, laboratorio: text })} />

              <Text style={styles.label}>Peso (kg) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 25.5"
                keyboardType="numeric"
                value={nuevoRegistro.peso?.toString()}
                onChangeText={(text) => setNuevoRegistro({ ...nuevoRegistro, peso: parseFloat(text) })}
              />

              <Text style={styles.label}>Fecha de Aplicación (DD/MM/AAAA) *</Text>
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="DD"
                  keyboardType="numeric"
                  maxLength={2}
                  value={aplicacionDia}
                  onChangeText={(text) => {
                    setAplicacionDia(text);
                    if (text && aplicacionMes && aplicacionAno) {
                      const day = parseInt(text);
                      const month = parseInt(aplicacionMes) - 1;
                      const year = parseInt(aplicacionAno);
                      if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900) {
                        setNuevoRegistro({ ...nuevoRegistro, fecha_aplicacion: new Date(year, month, day) });
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
                  value={aplicacionMes}
                  onChangeText={(text) => {
                    setAplicacionMes(text);
                    if (aplicacionDia && text && aplicacionAno) {
                      const day = parseInt(aplicacionDia);
                      const month = parseInt(text) - 1;
                      const year = parseInt(aplicacionAno);
                      if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900) {
                        setNuevoRegistro({ ...nuevoRegistro, fecha_aplicacion: new Date(year, month, day) });
                      }
                    }
                  }}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.dateInputYear, fechaAplicacionError && { borderColor: 'red', backgroundColor: '#ffe6e6' }]}
                  placeholder="AAAA"
                  keyboardType="numeric"
                  maxLength={4}
                  value={aplicacionAno}
                  onChangeText={(text) => {
                    setAplicacionAno(text);
                    if (aplicacionDia && aplicacionMes && text) {
                      const day = parseInt(aplicacionDia);
                      const month = parseInt(aplicacionMes) - 1;
                      const year = parseInt(text);
                      if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900) {
                        setNuevoRegistro({ ...nuevoRegistro, fecha_aplicacion: new Date(year, month, day) });
                      }
                    }
                  }}
                />
                {fechaAplicacionError && <Text style={styles.errorText}>{fechaAplicacionError}</Text>}
              </View>

              <Text style={styles.label}>Fecha de elaboración del medicamento (MM/AAAA)</Text>
              <View style={styles.dateRow}>
                <View style={{ flex: 1 }}>
                  <Picker
                    selectedValue={elaboracionMes}
                    onValueChange={(val) => {
                      setElaboracionMes(String(val));
                      if (val !== '' && elaboracionAno !== '') {
                        const monthNum = parseInt(String(val), 10);
                        const year = parseInt(elaboracionAno, 10);
                        setNuevoRegistro({ ...nuevoRegistro, mes_elaboracion_medicamento: monthNum, ano_elaboracion_medicamento: year });
                      } else {
                        setNuevoRegistro({ ...nuevoRegistro, mes_elaboracion_medicamento: null, ano_elaboracion_medicamento: nuevoRegistro.ano_elaboracion_medicamento ?? null });
                      }
                    }}
                  >
                    <Picker.Item label="MM" value="" />
                    {Array.from({ length: 12 }).map((_, i) => {
                      const month = i + 1;
                      const label = month < 10 ? `0${month}` : `${month}`;
                      return <Picker.Item key={month} label={label} value={`${month}`} />;
                    })}
                  </Picker>
                </View>
                <Text style={styles.dateSeparator}>/</Text>
                <View style={{ flex: 1.5 }}>
                  <Picker
                    selectedValue={elaboracionAno}
                    onValueChange={(val) => {
                      setElaboracionAno(String(val));
                      if (elaboracionMes !== '' && val !== '') {
                        const monthNum = parseInt(elaboracionMes, 10);
                        const year = parseInt(String(val), 10);
                        setNuevoRegistro({ ...nuevoRegistro, mes_elaboracion_medicamento: monthNum, ano_elaboracion_medicamento: year });
                      } else {
                        setNuevoRegistro({ ...nuevoRegistro, ano_elaboracion_medicamento: null });
                      }
                    }}
                  >
                    <Picker.Item label="AAAA" value="" />
                    {Array.from({ length: 2025 - 2000 + 1 }).map((_, i) => {
                      const y = 2000 + i;
                      return <Picker.Item key={y} label={`${y}`} value={`${y}`} />;
                    })}
                  </Picker>
                </View>
              </View>

              <Text style={styles.label}>Fecha de vencimiento del medicamento (MM/AAAA) *</Text>
              <View style={styles.dateRow}>
                <View style={{ flex: 1 }}>
                  <Picker
                    selectedValue={vencimientoMes}
                    onValueChange={(val) => {
                      setVencimientoMes(String(val));
                      if (val !== '' && vencimientoAno !== '') {
                        const monthNum = parseInt(String(val), 10);
                        const year = parseInt(vencimientoAno, 10);
                        setNuevoRegistro({ ...nuevoRegistro, mes_vencimiento_medicamento: monthNum, ano_vencimiento_medicamento: year });
                      } else {
                        setNuevoRegistro({ ...nuevoRegistro, mes_vencimiento_medicamento: 0, ano_vencimiento_medicamento: nuevoRegistro.ano_vencimiento_medicamento ?? 0 });
                      }
                    }}
                  >
                    <Picker.Item label="MM" value="" />
                    {Array.from({ length: 12 }).map((_, i) => {
                      const month = i + 1;
                      const label = month < 10 ? `0${month}` : `${month}`;
                      return <Picker.Item key={month} label={label} value={`${month}`} />;
                    })}
                  </Picker>
                </View>
                <Text style={styles.dateSeparator}>/</Text>
                <View style={{ flex: 1.5 }}>
                  <Picker
                    selectedValue={vencimientoAno}
                    onValueChange={(val) => {
                      setVencimientoAno(String(val));
                      if (vencimientoMes !== '' && val !== '') {
                        const monthNum = parseInt(vencimientoMes, 10);
                        const year = parseInt(String(val), 10);
                        setNuevoRegistro({ ...nuevoRegistro, mes_vencimiento_medicamento: monthNum, ano_vencimiento_medicamento: year });
                      } else {
                        setNuevoRegistro({ ...nuevoRegistro, ano_vencimiento_medicamento: 0 });
                      }
                    }}
                  >
                    <Picker.Item label="AAAA" value="" />
                    {Array.from({ length: 2040 - 2010 + 1 }).map((_, i) => {
                      const y = 2010 + i;
                      return <Picker.Item key={y} label={`${y}`} value={`${y}`} />;
                    })}
                  </Picker>
                </View>
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
                        setNuevoRegistro({ ...nuevoRegistro, proxima_dosis: new Date(year, month, day) });
                      }
                    } else if (!text && !proximaMes && !proximaAno) {
                      setNuevoRegistro({ ...nuevoRegistro, proxima_dosis: null });
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
                        setNuevoRegistro({ ...nuevoRegistro, proxima_dosis: new Date(year, month, day) });
                      }
                    } else if (!proximaDia && !text && !proximaAno) {
                      setNuevoRegistro({ ...nuevoRegistro, proxima_dosis: null });
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
                        setNuevoRegistro({ ...nuevoRegistro, proxima_dosis: new Date(year, month, day) });
                      }
                    } else if (!proximaDia && !proximaMes && !text) {
                      setNuevoRegistro({ ...nuevoRegistro, proxima_dosis: null });
                    }
                  }}
                />
                {proximaDosisError && <Text style={styles.errorText}>{proximaDosisError}</Text>}
              </View>

              <Text style={styles.label}>Veterinaria *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la veterinaria"
                value={nuevoRegistro.nombre_veterinaria}
                onChangeText={(text) => setNuevoRegistro({ ...nuevoRegistro, nombre_veterinaria: text })}
              />

              <Text style={styles.label}>Teléfono Veterinaria</Text>
              <TextInput
                style={styles.input}
                placeholder="Teléfono de contacto (Opcional)"
                keyboardType="phone-pad"
                value={nuevoRegistro.telefono_veterinaria ?? ''}
                onChangeText={(text) => setNuevoRegistro({ ...nuevoRegistro, telefono_veterinaria: text })}
              />

              <Text style={styles.label}>Dirección Veterinaria *</Text>
              <TextInput
                style={styles.input}
                placeholder="Dirección de la veterinaria"
                value={nuevoRegistro.direccion_veterinaria}
                onChangeText={(text) => setNuevoRegistro({ ...nuevoRegistro, direccion_veterinaria: text })}
              />

              <Text style={styles.label}>Observaciones</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Observaciones adicionales..."
                value={nuevoRegistro.observaciones ?? ''}
                onChangeText={(text) => setNuevoRegistro({ ...nuevoRegistro, observaciones: text })}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setMostrarPaginaNuevoRegistro(false)} disabled={submitting}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, (submitting || !isFormularioValid()) && { opacity: 0.5, backgroundColor: '#ccc' }]}
                onPress={crearRegistroCarnet}
                disabled={submitting || !isFormularioValid()}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Registro */}
      <Modal visible={mostrarPaginaEditarRegistro} animationType="slide" transparent={true}>
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
                value={editarRegistro?.telefono_veterinaria || ''}
                onChangeText={(text) => setEditarRegistro((prev) => (prev ? { ...prev, telefono_veterinaria: text } : null))}
              />

              <Text style={styles.label}>Próxima Dosis</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA (Opcional)"
                value={editarRegistro?.proxima_dosis ? (editarRegistro.proxima_dosis ? editarRegistro.proxima_dosis.toLocaleDateString('es-ES') : 'N/A') : ''}
                onChangeText={(text) => {
                  if (text.length === 10) {
                    const parts = text.split('/');
                    if (parts.length === 3) {
                      const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                      setEditarRegistro((prev) => (prev ? { ...prev, proxima_dosis: date } : null));
                    }
                  } else if (text === '') {
                    setEditarRegistro((prev) => (prev ? { ...prev, proxima_dosis: null } : null));
                  }
                }}
              />

              <Text style={styles.label}>Observaciones</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Observaciones adicionales..."
                value={editarRegistro?.observaciones || ''}
                onChangeText={(text) => setEditarRegistro((prev) => (prev ? { ...prev, observaciones: text } : null))}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setMostrarPaginaEditarRegistro(false);
                  setEditarRegistro(null);
                }}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton, submitting && { opacity: 0.6 }]} onPress={editarRegistroCarnet} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Actualizar</Text>}
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
  errorText: {
    color: 'red',
    marginBottom: 16,
    fontSize: 14,
  },
});
