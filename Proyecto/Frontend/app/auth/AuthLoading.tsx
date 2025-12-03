import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function AuthLoading() {
  const navigation = useNavigation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      } catch (e) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
