import React, { useState, useEffect } from 'react';
import { API_URL } from '@/src/config/api.ts';
import { validateEmailFields } from '@/src/utils/validateEmail.ts';
import { validatePasswordChecklist, PasswordChecklistType } from '@/src/utils/validatePassword.ts';
import { validatePhoneFields } from '@/src/utils/validatePhone.ts';
import { validateConfirmPasswordFields } from '@/src/utils/validateConfirmPassword.ts';
import { formatPhoneColombia } from '@/src/utils/formatPhone.ts';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image, } from 'react-native';

export default function RegisterScreen({ navigation }: any) {
  const [nombre, setName] = useState('');
  const [correo, setEmail] = useState('');
  const [contraseña, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setPhone] = useState('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordChecklist, setPasswordChecklist] = useState<PasswordChecklistType>({length: false, uppercase: false, lowercase: false, number: false, special: false, noSpaces: false});
  const [passwordAllValid, setPasswordAllValid] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setEmailError(correo ? (validateEmailFields(correo).valido ? null : validateEmailFields(correo).error) : null);
    const { checklist, allValid, isPasswordOk } = validatePasswordChecklist(contraseña);
    setPasswordChecklist(checklist);
    setPasswordAllValid(allValid);
    setConfirmPasswordError(confirmPassword ? (validateConfirmPasswordFields(contraseña, confirmPassword).valido ? null : validateConfirmPasswordFields(contraseña, confirmPassword).error) : null);
    setPhoneError(telefono ? (validatePhoneFields(telefono) ? null : "ⓘ El número no es válido") : null);

    setIsFormValid( nombre.length > 0 && !emailError && isPasswordOk && !phoneError && !confirmPasswordError);
  }, [nombre, correo, contraseña, telefono, confirmPassword]);

  const handleRegister = async () => {
    if (!isFormValid) return;
    
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, correo, telefono, contraseña,}),
    });

    const data = await res.json();

    if (data.ok) {
      Alert.alert("Registro exitoso");
      navigation.navigate("Login");
    } else {
      Alert.alert("Error", data.message);
    }
  };

  const handleGoogleRegister = () => {
    Alert.alert('Google Register', 'Función de Google en desarrollo');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a PocketVet</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Nombre Completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre completo"
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, emailError && {borderColor: "red", backgroundColor: "#ffe6e6" }]}
            placeholder="tu@email.com"
            placeholderTextColor="#999"
            value={correo}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError && <Text style={styles.errorText}>{emailError}</Text>}

          <Text style={styles.label}>Telefono</Text>

          <View style={{flexDirection: "row", marginBottom: 18, alignItems: "center", borderWidth: 1, borderColor: !phoneError ? "#ccc" : "red", borderRadius: 10, paddingHorizontal: 10, height: 55, backgroundColor: "#f8f8f8",}}>
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12, backgroundColor: "#e8e7e7ff" }}>
              <Image 
                source={{ uri: "https://flagcdn.com/w20/co.png" }} 
                style={{ width: 22, height: 16, borderRadius: 2, marginRight: 4 }}
              />
              <Text style={{ fontSize: 16, fontWeight: "600" }}>+57</Text>
            </View>

          <TextInput
            style={{ flex: 1, height: "100%", fontSize: 17 }}
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
            style={[styles.input, passwordTouched && !passwordAllValid && contraseña.length > 0 && { borderColor: "red", backgroundColor: "#ffe6e6" }]}
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
            <View style={{ marginTop: 10, marginBottom: 18 }}>
              <Text style={{ color: passwordChecklist.length ? 'green' : 'red' }}>• Mínimo 8 caracteres</Text>
              <Text style={{ color: passwordChecklist.uppercase ? 'green' : 'red' }}>• Al menos una mayúscula</Text>
              <Text style={{ color: passwordChecklist.lowercase ? 'green' : 'red' }}>• Al menos una minúscula</Text>
              <Text style={{ color: passwordChecklist.number ? 'green' : 'red' }}>• Al menos un número</Text>
              <Text style={{ color: passwordChecklist.special ? 'green' : 'red' }}>• Al menos un símbolo (!@#$%^&*-_)</Text>
              <Text style={{ color: passwordChecklist.noSpaces ? 'green' : 'red' }}>• Sin espacios</Text>
            </View>
          )}

          <Text style={styles.label}>Confirmar Contraseña *</Text>
          <TextInput
            style={[styles.input, confirmPasswordError && { borderColor: "red", backgroundColor: "#ffe6e6" }]}
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
              backgroundColor: isFormValid ? "#007AFF" : "#A0A0A0",
              paddingVertical: 15,
              borderRadius: 10,
              alignItems: "center",
              marginTop: 20,
              opacity: isFormValid ? 1 : 0.6,
            }}
          >
            <Text style={styles.registerButtonText}>
              {'Registrarse'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Register Button */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleRegister}>
            <Image
              source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Registrarse con Google</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
    color: "red",
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
