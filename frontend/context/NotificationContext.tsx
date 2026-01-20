import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import notificationService from '../services/NotificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  registerForNotifications: () => Promise<void>;
  scheduleReminder: (appointmentId: string, patientName: string, doctorName: string, date: string, time: string) => Promise<void>;
  cancelReminder: (appointmentId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Register for push notifications when component mounts
    registerForNotifications();

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 Notification response:', response);
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Register token with backend when user logs in
  useEffect(() => {
    if (user && expoPushToken) {
      notificationService.registerTokenWithBackend(user.id, user.role);
    }
  }, [user, expoPushToken]);

  const registerForNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        setExpoPushToken(token);
        console.log('📱 Push token registered:', token);
      }
    } catch (error) {
      console.error('Error registering for notifications:', error);
    }
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    // Navigate based on notification type
    if (data?.screen) {
      switch (data.screen) {
        case 'appointments':
          router.push('/(tabs)/appointments');
          break;
        case 'home':
          router.push('/(tabs)/home');
          break;
        case 'admin':
          router.push('/(tabs)/admin');
          break;
        default:
          break;
      }
    }
  };

  const scheduleReminder = async (
    appointmentId: string,
    patientName: string,
    doctorName: string,
    date: string,
    time: string
  ) => {
    await notificationService.scheduleAppointmentReminder(
      appointmentId,
      patientName,
      doctorName,
      date,
      time
    );
  };

  const cancelReminder = async (appointmentId: string) => {
    await notificationService.cancelAppointmentReminder(appointmentId);
  };

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        registerForNotifications,
        scheduleReminder,
        cancelReminder,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
