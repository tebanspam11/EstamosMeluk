import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../services/notificationService';

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Registrar para notificaciones push
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        // Aquí podrías enviar el token a tu backend para guardar en la BD
        console.log('Push token:', token);
      }
    });

    // Listener para cuando llega una notificación
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notificación recibida:', notification);
      setNotification(notification);
    });

    // Listener para cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Usuario tocó la notificación:', response);
      const data = response.notification.request.content.data;
      // Aquí puedes navegar a la pantalla correspondiente
      // navigation.navigate('Calendar', { eventId: data.eventId });
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
}
