import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('¡Error! Necesitamos permisos para enviar notificaciones.');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
    
  } else {
    alert('Debe usar un dispositivo físico para recibir notificaciones push');
  }

  return token;
}

export async function scheduleEventNotification(
  eventTitle: string,
  eventDate: Date,
  minutesBefore: number = 60
) {
  const notificationDate = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);
  
  if (notificationDate <= new Date()) {
    console.log('La fecha del evento ya pasó, no se programa notificación');
    return null;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📅 Recordatorio de Evento',
      body: `${eventTitle} - En ${minutesBefore} minutos`,
      data: { eventTitle, eventDate: eventDate.toISOString() },
      sound: true,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: notificationDate },
  });

  return notificationId;
}

export async function scheduleMultipleEventReminders(
  eventTitle: string,
  eventDate: Date,
  reminders: number[] = [5, 3, 1] // Para pruebas: 5, 3 y 1 minuto antes
) {
  const notificationIds: string[] = [];

  for (const minutesBefore of reminders) {
    const notificationDate = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);
    
    console.log(`Intentando programar notificación ${minutesBefore} min antes:`, notificationDate);
    console.log('Hora actual:', new Date());
    console.log('¿Es futura?', notificationDate > new Date());
    
    if (notificationDate > new Date()) {
      let reminderText = '';
      if (minutesBefore >= 1440) {
        const days = Math.floor(minutesBefore / 1440);
        reminderText = `En ${days} día${days > 1 ? 's' : ''}`;
      } else if (minutesBefore >= 60) {
        const hours = Math.floor(minutesBefore / 60);
        reminderText = `En ${hours} hora${hours > 1 ? 's' : ''}`;
      } else {
        reminderText = `En ${minutesBefore} minutos`;
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Recordatorio de Evento',
          body: `${eventTitle} - ${reminderText}`,
          data: { eventTitle, eventDate: eventDate.toISOString() },
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: notificationDate },
      });
      
      console.log(`✅ Notificación programada con ID: ${id}`);
      notificationIds.push(id);
    } else {
      console.log(`❌ No se programó - la fecha ya pasó`);
    }
  }

  return notificationIds;
}

export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}


export async function getAllScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

export async function scheduleVaccineReminder(
  petName: string,
  vaccineName: string,
  dueDate: Date
) {
  const notificationIds: string[] = [];
  
  // Recordatorio 7 días antes
  const sevenDaysBefore = new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (sevenDaysBefore > new Date()) {
    const id1 = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💉 Recordatorio de Vacuna',
        body: `${petName} necesita ${vaccineName} en 7 días`,
        data: { petName, vaccineName, dueDate: dueDate.toISOString() },
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: sevenDaysBefore },
    });
    notificationIds.push(id1);
  }
  
  const oneDayBefore = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
  if (oneDayBefore > new Date()) {
    const id2 = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💉 Recordatorio de Vacuna',
        body: `${petName} necesita ${vaccineName} mañana`,
        data: { petName, vaccineName, dueDate: dueDate.toISOString() },
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: oneDayBefore },
    });
    notificationIds.push(id2);
  }
  
  if (dueDate > new Date()) {
    const id3 = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💉 ¡Vacuna Hoy!',
        body: `Hoy es el día de aplicar ${vaccineName} a ${petName}`,
        data: { petName, vaccineName, dueDate: dueDate.toISOString() },
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dueDate },
    });
    notificationIds.push(id3);
  }
  
  return notificationIds;
}
