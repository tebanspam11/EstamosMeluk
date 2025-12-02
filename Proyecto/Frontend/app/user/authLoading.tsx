import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';

export default function AuthLoading() {

  const navigation = useNavigation();

  useEffect(() => {
    const check = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return navigation.reset({ index:0, routes:[{name:'Login'}] });

        const decoded = jwtDecode(token); 
        const now = Date.now() / 1000;

        if (decoded.exp && decoded.exp < now) {

          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('keepLogged');
          return navigation.reset({ index:0, routes:[{name:'Login'}] });

        }

        navigation.reset({ index:0, routes:[{name:'Home'}] });
      } catch (e) {
        navigation.reset({ index:0, routes:[{name:'Login'}] });
      }
    };
    check();
  }, []);
  return (<View style={{flex:1, justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" /></View>);
}
