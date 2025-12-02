import { useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_CLIENT_ID } from '../config/google';
import { API_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({clientId: GOOGLE_CLIENT_ID, scopes: ['profile', 'email'],});

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleResponse(authentication?.idToken);
    } else if (response?.type === 'error') {
      setIsSuccessful(false);
      setError('Error al autenticar con Google');
      setLoading(false);
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      setLoading(false);
      setIsSuccessful(null);
    }
  }, [response]);

  const handleGoogleResponse = async (idToken: string | undefined) => {
    if (!idToken) {
      setIsSuccessful(false);
      setError('No se recibió token de Google');
      setLoading(false);
      return;
    }

    try {
      const backendResponse = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await backendResponse.json();

      if (backendResponse.ok && data.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userId', data.userId.toString());
        await AsyncStorage.setItem('keepLogged', 'true');
        
        setIsSuccessful(true);
        setError(null);

      } else {
        setIsSuccessful(false);
        setError(data.error);
      }
    } catch (err) {
      setIsSuccessful(false);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setIsSuccessful(null);
    setLoading(true);
    
    try {
      await promptAsync();
    } catch (err) {
      setIsSuccessful(false);
      setError('Error al abrir Google');
      setLoading(false);
    }
  };

  return {signInWithGoogle, loading, error, isSuccessful, isReady: request !== null};
};
