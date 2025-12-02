import React, { useState } from 'react';
import { formatPhoneColombia } from '../../src/utils/formatPhone';
import { formatName } from '../../src/utils/formatName';
import { API_URL } from '../../src/config/api';
import { useFormValidation } from '../../src/hooks/useFormValidation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

export default function EditProfileScreen({ navigation }: any) {
  const [nombre, setName] = useState('');
  const [correo, setEmail] = useState('');
  const [telefono, setPhone] = useState('');
  const [contraseña, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChecklist, setShowChecklist] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [originalNombre, setOriginalNombre] = useState('');
  const [originalTelefono, setOriginalTelefono] = useState('');
  const [originalContraseña, setOriginalContraseña] = useState('');
  
  const { phoneError, passwordChecklist, passwordValid, confirmPasswordError } = useFormValidation(
    nombre, 
    correo, 
    telefono, 
    contraseña, 
    confirmPassword
  );

  useFocusEffect(
    React.useCallback(() => {
      cargarDatosUsuario();
    }, [])
  );

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
      setName(userData.nombre || '');
      setEmail(userData.correo || '');
      setPhone(userData.telefono || '');
      setOriginalNombre(userData.nombre || '');
      setOriginalTelefono(userData.telefono || '');
    }
    
    setLoading(false);
  };

  const isFormValid = () => {
    const nombreChanged = nombre !== originalNombre;
    const telefonoChanged = telefono !== originalTelefono;
    const passwordChanged = contraseña.length > 0;

    if (!nombreChanged && !telefonoChanged && !passwordChanged) {
      return false; 
    }

    if (telefonoChanged && telefono && phoneError) {
      return false;
    }

    if (passwordChanged) {
      if (!originalContraseña) {
        return false;
      }
      if (!passwordValid || confirmPasswordError) {
        return false;
      }
    }

    return true;
  };

  const handleUpdate = async () => {
    setSaving(true);
    
    try {
      const token = await AsyncStorage.getItem('token');

      const updateData: any = {};
      
      if (nombre !== originalNombre) {
          updateData.nombre = nombre;
      }
      
      if (telefono !== originalTelefono) {
          updateData.telefono = telefono || null;
      }

      if (contraseña.length > 0) {
          updateData.contraseñaActual = originalContraseña;
          updateData.contraseñaNueva = contraseña;
      }

      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
          setOriginalNombre(nombre);
          setOriginalTelefono(telefono);
          setPassword('');
          setConfirmPassword('');
          setOriginalContraseña('');
          setShowChecklist(false);
          
          Alert.alert('Éxito', 'Perfil actualizado correctamente', [
          {
              text: 'OK',
              onPress: () => navigation.goBack(),
          },
          ]);
      } else {
          Alert.alert('Error', data?.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
          </TouchableOpacity>
          <Text style={styles.title}>Editar Perfil</Text>
          <Text style={styles.subtitle}>Actualiza tu información</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre completo"
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={(text) => setName(formatName(text))}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="tu@email.com"
            placeholderTextColor="#999"
            value={correo}
            editable={false}
          />
          <Text style={styles.infoText}>El correo no se puede modificar</Text>

          <Text style={styles.label}>Teléfono</Text>
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 18,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: phoneError ? 'red' : '#ccc',
              borderRadius: 10,
              paddingHorizontal: 10,
              height: 55,
              backgroundColor: phoneError ? '#ffe6e6' : '#f8f8f8',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 12,
                backgroundColor: '#e8e7e7ff',
            }}
            >
              <Image
                source={{ uri: 'https://flagcdn.com/w20/co.png' }}
                style={{ width: 22, height: 16, borderRadius: 2, marginRight: 4 }}
              />
              <Text style={{ fontSize: 16, fontWeight: '600' }}>+57</Text>
            </View>

            <TextInput
              style={styles.phoneInput}
              placeholder="300 123 4567"
              placeholderTextColor="#999"
              value={formatPhoneColombia(telefono)}
              onChangeText={(text) => {
                const digits = text.replace(/\D/g, '');
                setPhone(digits);
              }}
              keyboardType="phone-pad"
            />
          </View>
          {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Cambiar Contraseña (Opcional)</Text>
          <Text style={styles.infoText}>Deja vacío si no deseas cambiar tu contraseña</Text>

          <Text style={styles.label}>Contraseña Actual</Text>
          <TextInput
            style={[styles.input, contraseña && !originalContraseña && { borderColor: 'orange', backgroundColor: '#fff8e6' }]}
            placeholder="Tu contraseña actual"
            placeholderTextColor="#999"
            value={originalContraseña}
            onChangeText={setOriginalContraseña}
            secureTextEntry
            autoCapitalize="none"
          />
          {contraseña && !originalContraseña && (
            <Text style={styles.warningText}>⚠️ Debes ingresar tu contraseña actual para cambiarla</Text>
          )}

          <Text style={styles.label}>Nueva Contraseña</Text>
          <TextInput
            style={[styles.input, contraseña && !passwordValid && { borderColor: 'red', backgroundColor: '#ffe6e6' }]}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#999"
            value={contraseña}
            onChangeText={setPassword}
            onFocus={() => {
              setShowChecklist(true);
              setPasswordTouched(true);
            }}
            secureTextEntry
            autoCapitalize="none"
          />

          {showChecklist && contraseña.length > 0 && (
            <View style={styles.checklist}>
              <Text style={[styles.checklistItem, passwordChecklist.length && styles.checklistValid]}>
                {passwordChecklist.length ? '✓' : '○'} Mínimo 8 caracteres
              </Text>
              <Text style={[styles.checklistItem, passwordChecklist.uppercase && styles.checklistValid]}>
                {passwordChecklist.uppercase ? '✓' : '○'} Una letra mayúscula
              </Text>
              <Text style={[styles.checklistItem, passwordChecklist.lowercase && styles.checklistValid]}>
                {passwordChecklist.lowercase ? '✓' : '○'} Una letra minúscula
              </Text>
              <Text style={[styles.checklistItem, passwordChecklist.number && styles.checklistValid]}>
                {passwordChecklist.number ? '✓' : '○'} Un número
              </Text>
              <Text style={[styles.checklistItem, passwordChecklist.special && styles.checklistValid]}>
                {passwordChecklist.special ? '✓' : '○'} Un carácter especial
              </Text>
            </View>
          )}

          {contraseña.length > 0 && (
            <>
              <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
              <TextInput
                style={[styles.input, confirmPasswordError && { borderColor: 'red', backgroundColor: '#ffe6e6' }]}
                placeholder="Repite tu contraseña"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              {confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}
            </>
          )}

          {/* Botón Guardar */}
          <TouchableOpacity
            style={[
              styles.updateButton,
              (!isFormValid() || saving) && styles.updateButtonDisabled,
            ]}
            onPress={handleUpdate}
            disabled={!isFormValid() || saving}
          >
            <Text style={styles.updateButtonText}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Text>
          </TouchableOpacity>

          {/* Botón Cancelar */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    height: 50,
  },
  phoneContainerError: {
    borderColor: 'red',
    backgroundColor: '#ffe6e6',
  },
  phonePrefix: {
    color: '#666',
    marginRight: 8,
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  warningText: {
    color: '#ff9800',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  checklist: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  checklistItem: {
    fontSize: 13,
    color: '#666',
    marginVertical: 3,
  },
  checklistValid: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  updateButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
