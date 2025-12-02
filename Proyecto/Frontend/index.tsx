import { registerRootComponent } from 'expo';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

import AuthLoading from './app/user/authLoading.tsx';
import LoginScreen from './app/user/userLogin.tsx';
import RegisterScreen from './app/user/userRegister.tsx';
import ForgotPasswordScreen from './app/user/forgotPassword.tsx';
import ProfileScreen from './app/user/userProfile.tsx';
import HomeScreen from './app/main/home.tsx';
import CalendarScreen from './app/main/calendar.tsx';
import CarnetScreen from './app/pet/carnet.tsx';
import ClinicHistoryScreen from './app/pet/clinic_history.tsx';
import PetListScreen from './app/pet/list.tsx';

import UploadPDFScreen from './app/pet/UploadPDFScreen.tsx';
import PetProfileScreen from './app/pet/pet_profile.tsx';
import EditPetProfileScreen from './app/pet/petProfile.tsx';
import PetRegisterScreen from './app/pet/petRegister.tsx';

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
      <Button title="Ir al Home Principal" onPress={() => navigation.navigate('Home')} />
      <Button title="Ir al Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>

      <Stack.Navigator initialRouteName="AuthLoading">
        {/* Pantalla Principal (Validacion si hay sesion iniciada o no*/}
        <Stack.Screen name="AuthLoading" component={AuthLoading} options={{ headerShown: false }} />

        {/* Pantallas de Autenticación */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Recuperar Contraseña' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />

        {/* Pantalla Home */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />

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
          name="PetRegister"
          component={PetRegisterScreen}
          options={{ title: 'Registrar Mascota' }}
        />
        <Stack.Screen
          name="PetProfile"
          component={PetProfileScreen}
          options={{ title: 'Perfil de Mascota' }}
        />
        <Stack.Screen
          name="EditPetProfile"
          component={EditPetProfileScreen}
          options={{ title: 'Editar Mascota' }}
        />

        {/* Otras Pantallas */}
        <Stack.Screen
          name="VeterinarySearch"
          component={VeterinarySearchScreen}
          options={{ title: 'Buscar Veterinarias' }}
        />
        <Stack.Screen
          name="UploadPDF"
          component={UploadPDFScreen}
          options={{ title: 'Subir PDF' }}
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
