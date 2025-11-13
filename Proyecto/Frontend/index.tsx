import { registerRootComponent } from 'expo';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

import LoginScreen from './app/auth/login';
import RegisterScreen from './app/auth/register';
import HomeScreen from './app/main/home';
import ProfileScreen from './app/auth/profile';
import CalendarScreen from './app/main/calendar';
import CarnetScreen from './app/pet/carnet';
import ClinicHistoryScreen from './app/pet/clinic_history';
import PetListScreen from './app/pet/list';
import UploadScreen from './app/pet/upload';

function VeterinarySearchScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text>Búsqueda de Veterinarias - En desarrollo</Text>
      <Button title="Volver" onPress={() => navigation.goBack()} />
    </View>
  );
}

function NotificationsScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text>Notificaciones - En desarrollo</Text>
      <Button title="Volver" onPress={() => navigation.goBack()} />
    </View>
  );
}

function TempHomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido a PocketVet!👋</Text>
      <Button
        title="Ir al Home Principal"
        onPress={() => navigation.navigate('Home')}
      />
      <Button
        title="Ir al Login"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
}

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* Pantalla Principal */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        
        {/* Pantallas de Autenticación */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: 'Iniciar Sesión' }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ title: 'Registro' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Perfil' }}
        />

        {/* Pantallas Principales */}
        <Stack.Screen 
          name="Calendar" 
          component={CalendarScreen}
          options={{ title: 'Calendario' }}
        />
        <Stack.Screen 
          name="Notifications" 
          component={NotificationsScreen}
          options={{ title: 'Notificaciones' }}
        />

        {/* Pantallas de Mascotas */}
        <Stack.Screen 
          name="Carnet" 
          component={CarnetScreen}
          options={{ title: 'Carnet de Vacunas' }}
        />
        <Stack.Screen 
          name="ClinicHistory" 
          component={ClinicHistoryScreen}
          options={{ title: 'Historial Clínico' }}
        />
        <Stack.Screen 
          name="PetList" 
          component={PetListScreen}
          options={{ title: 'Mis Mascotas' }}
        />
        <Stack.Screen 
          name="Upload" 
          component={UploadScreen}
          options={{ title: 'Registrar Mascota' }}
        />

        {/* Otras Pantallas */}
        <Stack.Screen 
          name="VeterinarySearch" 
          component={VeterinarySearchScreen}
          options={{ title: 'Buscar Veterinarias' }}
        />

        {/* Pantalla Temporal (opcional) */}
        <Stack.Screen 
          name="TempHome" 
          component={TempHomeScreen}
          options={{ title: 'Inicio' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

registerRootComponent(App);
