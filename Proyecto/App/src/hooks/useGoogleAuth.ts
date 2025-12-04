import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GOOGLE_CLIENT_ID } from '../config/google';
import { API_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectUri = 'https://auth.expo.io/@anonymous/pocketvet';

  console.log('🔑 Using Redirect URI:', redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    console.log('📱 Google Response:', response?.type, response);

    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('✅ Authentication successful, idToken:', authentication?.idToken?.substring(0, 20) + '...');
      handleGoogleResponse(authentication?.idToken);
    } else if (response?.type === 'error') {
      console.log('❌ Error response:', response);
      setIsSuccessful(false);
      setError('Error al autenticar con Google');
      setLoading(false);
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      console.log('🚫 User cancelled');
      setLoading(false);
      setIsSuccessful(null);
    }
  }, [response]);

  const signInWithGoogle = async () => {
    setError(null);
    setIsSuccessful(null);
    setLoading(true);

    await promptAsync();
  };

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
        setError(data.error || 'Error al autenticar');
      }
    } catch (err) {
      setIsSuccessful(false);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading, error, isSuccessful, isReady: request !== null };
};
