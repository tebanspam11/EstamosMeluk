import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ClinicHistoryScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text>Historial Clínico - En desarrollo</Text>
      <Button title="Volver" onPress={() => navigation.goBack()} />
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
