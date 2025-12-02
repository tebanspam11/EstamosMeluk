import { registerRootComponent } from 'expo';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';

import AuthLoading from './app/user/authLoading.tsx';
import LoginScreen from './app/user/userLogin.tsx';
import RegisterScreen from './app/user/userRegister.tsx';
import ForgotPasswordScreen from './app/user/forgotPassword.tsx';
import ProfileScreen from './app/user/userProfile.tsx';
import EditProfileScreen from './app/user/userEdit.tsx';
import HomeScreen from './app/main/home.tsx';
import CalendarScreen from './app/main/calendar.tsx';
import CarnetScreen from './app/pet/carnet.tsx';
import ClinicHistoryScreen from './app/pet/clinicHistory.tsx';

import UploadPDFScreen from './app/pet/UploadPDFScreen.tsx';
import PetProfileScreen from './app/pet/petProfile.tsx';
import EditPetProfileScreen from './app/pet/petEdit.tsx';
import PetRegisterScreen from './app/pet/petRegister.tsx';

function LogoHeader() {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require('./assets/images/LogoPocketVet.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

function VeterinarySearchScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text>Búsqueda de Veterinarias - En desarrollo</Text>
      <Button title="Volver" onPress={() => navigation.goBack()} />
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
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerTitle: () => <LogoHeader /> }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerTitle: () => <LogoHeader /> }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerTitle: () => <LogoHeader /> }} />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={({ navigation }) => ({
            headerTitle: () => <LogoHeader />,
            headerRight: () => (
              <Button
                onPress={() => navigation.navigate('EditProfile')}
                title="✏️"
                color="#4A90E2"
              />
            ),
          })}
        />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerTitle: () => <LogoHeader /> }} />

        {/* Pantalla Home */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />

        {/* Pantallas Principales */}
        <Stack.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{ headerTitle: () => <LogoHeader /> }}
        />

        {/* Pantallas de Mascotas */}
        <Stack.Screen
          name="Carnet"
          component={CarnetScreen}
          options={{ headerTitle: () => <LogoHeader /> }}
        />
        <Stack.Screen
          name="ClinicHistory"
          component={ClinicHistoryScreen}
          options={{ headerTitle: () => <LogoHeader /> }}
        />
        <Stack.Screen
          name="PetRegister"
          component={PetRegisterScreen}
          options={{ headerTitle: () => <LogoHeader /> }}
        />
        <Stack.Screen
          name="PetProfile"
          component={PetProfileScreen}
          options={{ headerTitle: () => <LogoHeader /> }}
        />
        <Stack.Screen
          name="EditPetProfile"
          component={EditPetProfileScreen}
          options={{ headerTitle: () => <LogoHeader /> }}
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
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 40,
  },
});

registerRootComponent(App);
