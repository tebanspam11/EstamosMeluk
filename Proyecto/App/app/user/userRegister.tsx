import React, { useState, useEffect } from 'react';
import { formatPhoneColombia } from '../../src/utils/formatPhone.ts';
import { formatName } from '../../src/utils/formatName.ts';
import { useGoogleAuth } from '../../src/hooks/useGoogleAuth.ts';
import { API_URL } from '../../src/config/api.ts';
import { useFormValidation } from '../../src/hooks/useFormValidation.ts';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';

export default function RegisterScreen({ navigation }: any) {
  const [nombre, setName] = useState('');
  const [correo, setEmail] = useState('');
  const [telefono, setPhone] = useState('');
  const [contraseña, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChecklist, setShowChecklist] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const { signInWithGoogle, loading: googleLoading, error: googleError, isSuccessful: googleSuccess } = useGoogleAuth();
  const { emailError, phoneError, passwordChecklist, passwordValid, confirmPasswordError, isFormValid } = useFormValidation(nombre, correo, telefono, contraseña, confirmPassword);

  useEffect(() => {
    if (googleSuccess === true) {
      Alert.alert('Registro exitoso', '¡Bienvenido a PocketVet!');
      navigation.replace('Home');
    } else if (googleSuccess === false && googleError) {
      Alert.alert('Error', googleError);
    }
  }, [googleSuccess]);

  const handleRegister = async () => {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, telefono, contraseña }),
    });

    const data = await response.json();

    if (response.ok && data && data.ok) {
      Alert.alert('Su usuario ha sido registrado exitosamente. Por favor, inicie sesión.');
      navigation.replace('Login');
    } else Alert.alert('Error en registro', data?.error || JSON.stringify(data));
  };

  const handleGoogleRegister = async () => {
    await signInWithGoogle();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a PocketVet</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Nombre Completo *</Text>
          <TextInput style={styles.input} placeholder="Tu nombre completo" placeholderTextColor="#999" value={nombre} onChangeText={(text) => setName(formatName(text))} autoCapitalize="words" />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, emailError && { borderColor: 'red', backgroundColor: '#ffe6e6' }]}
            placeholder="tu@email.com"
            placeholderTextColor="#999"
            value={correo}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError && <Text style={styles.errorText}>{emailError}</Text>}

          <Text style={styles.label}>Telefono</Text>

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
              <Image source={{ uri: 'https://flagcdn.com/w20/co.png' }} style={{ width: 22, height: 16, borderRadius: 2, marginRight: 4 }} />
              <Text style={{ fontSize: 16, fontWeight: '600' }}>+57</Text>
            </View>

            <TextInput
              style={{ flex: 1, height: '100%', fontSize: 17 }}
              placeholder="345 678 9000"
              placeholderTextColor="#999"
              value={telefono}
              onChangeText={(text) => setPhone(formatPhoneColombia(text))}
              keyboardType="phone-pad"
            />
          </View>

          {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}

          <Text style={styles.label}>Contraseña *</Text>
          <TextInput
            style={[styles.input, passwordTouched && !passwordValid && { borderColor: 'red', backgroundColor: '#ffe6e6' }]}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={contraseña}
            onChangeText={(text) => {
              setPassword(text);
              setShowChecklist(text.length > 0);
              setPasswordTouched(true);
            }}
            secureTextEntry
            autoCapitalize="none"
          />
          {showChecklist && (
            <View style={styles.checklist}>
              <Text style={[styles.checklistItem, passwordChecklist.length && styles.checklistValid]}>{passwordChecklist.length ? '✓' : '○'} Mínimo 8 caracteres</Text>
              <Text style={[styles.checklistItem, passwordChecklist.uppercase && styles.checklistValid]}>{passwordChecklist.uppercase ? '✓' : '○'} Una letra mayúscula</Text>
              <Text style={[styles.checklistItem, passwordChecklist.lowercase && styles.checklistValid]}>{passwordChecklist.lowercase ? '✓' : '○'} Una letra minúscula</Text>
              <Text style={[styles.checklistItem, passwordChecklist.number && styles.checklistValid]}>{passwordChecklist.number ? '✓' : '○'} Un número</Text>
              <Text style={[styles.checklistItem, passwordChecklist.special && styles.checklistValid]}>{passwordChecklist.special ? '✓' : '○'} Un carácter especial</Text>
              <Text style={[styles.checklistItem, passwordChecklist.noSpaces && styles.checklistValid]}>{passwordChecklist.noSpaces ? '✓' : '○'} Sin espacios</Text>
            </View>
          )}

          <Text style={styles.label}>Confirmar Contraseña *</Text>
          <TextInput
            style={[styles.input, confirmPasswordError && { borderColor: 'red', backgroundColor: '#ffe6e6' }]}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          {confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}

          {/* Register Button */}
          <TouchableOpacity
            disabled={!isFormValid}
            onPress={() => {
              if (!isFormValid) return;
              handleRegister();
            }}
            style={{
              backgroundColor: isFormValid ? '#007AFF' : '#A0A0A0',
              paddingVertical: 15,
              borderRadius: 10,
              alignItems: 'center',
              marginTop: 20,
              opacity: isFormValid ? 1 : 0.6,
            }}
          >
            <Text style={styles.registerButtonText}>{'Registrarse'}</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Register Button */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleRegister} disabled={googleLoading}>
            <Image source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>{googleLoading ? 'Conectando con Google...' : 'Registrarse con Google'}</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.loginLink}>Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    fontSize: 14,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  checklist: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 18,
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
  registerButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  registerButtonDisabled: {
    backgroundColor: '#A0C4F8',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e1e1',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
});
