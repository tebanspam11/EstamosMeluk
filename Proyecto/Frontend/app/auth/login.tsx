import LogoImage from '../../assets/images/LogoPocketVet.jpg';
import { API_URL } from '../../src/config/api.ts';
import { formatPhoneColombia } from '../../src/utils/formatPhone.ts';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }: any) {
  const [identifier, setIdentifier] = useState('');
  const [keepLogged, setKeepLogged] = useState(false);
  const [contraseña, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    
    const normalizedIdentifier = identifier.includes('@') 
      ? identifier.trim() 
      : identifier.replace(/[\s\-()]/g, '');

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: normalizedIdentifier, contraseña, keepLogged }),
    });

    const data = await response.json();

    if (data && response.ok && data.ok) {
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("userId", data.userId.toString());
      await AsyncStorage.setItem("keepLogged", data.keepLogged ? "true" : "false");

      Alert.alert('Login exitoso');
      navigation.replace('Home');
    } else {
      const errorMessage = data?.error || data?.message;
      Alert.alert('Error de autenticación', errorMessage);
    }

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    Alert.alert('Google Login', 'Función de Google en desarrollo');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleIdentifierChange = (text: string) => {
    if (text.includes('@')) {
      setIdentifier(text);
    } else {
      const hasLetters = /[a-zA-Z]/.test(text);
      if (hasLetters) {
        setIdentifier(text);
      } else {
        setIdentifier(formatPhoneColombia(text));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PocketVet</Text>
          <Text style={styles.subtitle}>Cuida a tus mascotas</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image source={LogoImage} style={styles.headerImage} resizeMode="contain" />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email/Telefono</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@email.com/345 678 9000"
            placeholderTextColor="#999"
            value={identifier}
            onChangeText={handleIdentifierChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={contraseña}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Checkbox - Recordar sesión */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setKeepLogged(!keepLogged)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, keepLogged && styles.checkboxChecked]}>
              {keepLogged && (
                <Text style={styles.checkboxIcon}>✓</Text>
              )}
            </View>
            <Text style={styles.checkboxLabel}>Recordar mi sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (loading || !identifier.trim() || !contraseña.trim()) && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={loading || !identifier.trim() || !contraseña.trim()}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <Image
              source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Regístrate</Text>
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
  forgotPassword: {
    color: '#4A90E2',
    textAlign: 'right',
    marginBottom: 30,
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#e1e1e1',
    borderRadius: 6,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  checkboxIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#A0C4F8',
  },
  loginButtonText: {
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerImage: {
    width: 150,
    height: 150,
  },
});
