import React, { useState, useEffect } from 'react';
import { API_URL } from '../../src/config/api.ts';
import { validatePasswordChecklist, PasswordChecklistType } from '../../src/utils/validatePassword.ts';
import { validateConfirmPasswordFields } from '../../src/utils/validateConfirmPassword.ts';
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
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordChecklist, setPasswordChecklist] = useState<PasswordChecklistType>({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
      noSpaces: false,
    });
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  const [showChecklist, setShowChecklist] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    setPasswordChecklist(validatePasswordChecklist(newPassword).checklist);
    setPasswordValid(
      newPassword ? validatePasswordChecklist(newPassword).valido : false
    );
  }, [newPassword]);

  useEffect(() => {
    if (confirmPassword && newPassword) {
      setConfirmPasswordError(
        validateConfirmPasswordFields(newPassword, confirmPassword).valido
          ? null
          : validateConfirmPasswordFields(newPassword, confirmPassword).error
      );
    } else {
      setConfirmPasswordError(null);
    }
  }, [confirmPassword, newPassword]);

  const handleSendCode = async () => {
    setLoading(true);

    const response = await fetch(`${API_URL}/password/request-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: email }),
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      Alert.alert('Código enviado', 'Hemos enviado un código de 6 dígitos a tu correo');
      // En desarrollo, mostrar el código
      if (data.devCode) console.log('🔐 Código de desarrollo:', data.devCode);
      setStep(2);

    } else {
      Alert.alert('Error', data.error);
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    setLoading(true);

    const response = await fetch(`${API_URL}/password/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: email, code }),
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      Alert.alert('Código verificado', 'Ahora establece tu nueva contraseña');
      setStep(3);
    } else {
      Alert.alert('Error', data.error || 'Código incorrecto');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setLoading(true);

    const response = await fetch(`${API_URL}/password/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: email, nuevaContraseña: newPassword }),
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      Alert.alert(
        '¡Contraseña actualizada!', 
        'Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.', 
        [
          { 
            text: 'Ir al Login', 
            onPress: () => navigation.replace('Login') 
          }
        ]
      );
    } else {
      Alert.alert('Error', data.error || 'No se pudo actualizar la contraseña');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.backButton}>
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
              onChangeText={(text) => {setEmail(text)}}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.button, (loading || !email.trim()) && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading || !email.trim()}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Enviando...' : 'Enviar código'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.form}>
            <Text style={styles.instructions}>
              Hemos enviado un código de 6 dígitos a {email}
            </Text>
            <Text style={styles.label}>Código de 6 dígitos</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
            <TouchableOpacity 
              style={[styles.button, (loading || code.length !== 6) && styles.buttonDisabled]} 
              onPress={handleVerifyCode}
              disabled={loading || code.length !== 6}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verificando...' : 'Verificar código'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={handleSendCode}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>
                ¿No recibiste el código? Reenviar
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.form}>
            <Text style={styles.label}>Nueva contraseña</Text>
            <TextInput
              style={[
              styles.input,
              passwordTouched &&
              !passwordValid && { borderColor: 'red', backgroundColor: '#ffe6e6' },
              ]}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setShowChecklist(text.length > 0);
                setPasswordTouched(true);
              }}
            />
            {showChecklist && (
              <View style={{ marginTop: 10, marginBottom: 18 }}>
                <Text style={{ color: passwordChecklist.length ? 'green' : 'red' }}>
                  • Mínimo 8 caracteres
                </Text>
                <Text style={{ color: passwordChecklist.uppercase ? 'green' : 'red' }}>
                  • Al menos una mayúscula
                </Text>
                <Text style={{ color: passwordChecklist.lowercase ? 'green' : 'red' }}>
                  • Al menos una minúscula
                </Text>
                <Text style={{ color: passwordChecklist.number ? 'green' : 'red' }}>
                  • Al menos un número
                </Text>
                <Text style={{ color: passwordChecklist.special ? 'green' : 'red' }}>
                  • Al menos un símbolo (!@#$%^&*-_)
                </Text>
                <Text style={{ color: passwordChecklist.noSpaces ? 'green' : 'red' }}>
                  • Sin espacios
                </Text>
              </View>
            )}

            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
              style={[
              styles.input,
              confirmPasswordError && { borderColor: 'red', backgroundColor: '#ffe6e6' },
              ]}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}

            <TouchableOpacity 
              style={[styles.button, (loading || !newPassword || !confirmPassword) && styles.buttonDisabled]} 
              onPress={handleResetPassword}
              disabled={loading || !newPassword || !confirmPassword}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.backToLogin}>
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
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    fontSize: 14,
    marginTop: -12,
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
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
  },
  resendButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});