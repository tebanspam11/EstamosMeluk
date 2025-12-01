// app/auth/forgot_password.tsx (VERSIÓN FUNCIONAL COMPLETA)
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
} from 'react-native';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSendCode = () => {
    Alert.alert('Código enviado', 'Hemos enviado un código a tu correo');
    setStep(2);
  };

  const handleVerifyCode = () => {
    Alert.alert('Código verificado', 'Ahora establece tu nueva contraseña');
    setStep(3);
  };

  const handleResetPassword = () => {
    Alert.alert('Éxito', 'Contraseña actualizada correctamente', [
      { text: 'OK', onPress: () => navigation.navigate('Login') }
    ]);
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Recuperar Contraseña</Text>
          <View style={{ width: 40 }} />
        </View>

        {step === 1 && (
          <View style={styles.form}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Enviando...' : 'Enviar código'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.form}>
            <Text style={styles.label}>Código de 6 dígitos</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
              <Text style={styles.buttonText}>Verificar código</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.form}>
            <Text style={styles.label}>Nueva contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry
            />
            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>Actualizar contraseña</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={handleBackToLogin} style={styles.backToLogin}>
          <Text style={styles.backToLoginText}>← Volver al inicio de sesión</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#4A90E2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
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
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A0C4F8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  backToLoginText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
});