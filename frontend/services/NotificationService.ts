import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export interface PushToken {
  token: string;
  platform: string;
  userId?: string;
}

class NotificationService {
  private expoPushToken: string | null = null;

  // Register for push notifications
  async registerForPushNotifications(): Promise<string | null> {
    let token: string | null = null;

    // Check if it's a physical device
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    // Check/request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token - permission not granted');
      return null;
    }

    // Get the token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'teba-dental-center', // Your Expo project ID
      });
      token = tokenData.data;
      this.expoPushToken = token;
      
      // Save token locally
      await AsyncStorage.setItem('pushToken', token);
      
      console.log('Push token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }

    // Configure Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'إشعارات مجمع طيبة',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0891B2',
        sound: 'default',
      });

      // Channel for appointments
      await Notifications.setNotificationChannelAsync('appointments', {
        name: 'إشعارات المواعيد',
        description: 'إشعارات حجز وتأكيد المواعيد',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });

      // Channel for offers
      await Notifications.setNotificationChannelAsync('offers', {
        name: 'العروض الخاصة',
        description: 'إشعارات العروض والخصومات',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });

      // Channel for reminders
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'التذكيرات',
        description: 'تذكيرات المواعيد',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    return token;
  }

  // Register token with backend
  async registerTokenWithBackend(userId: string, userRole: string): Promise<boolean> {
    try {
      const token = this.expoPushToken || await AsyncStorage.getItem('pushToken');
      
      if (!token) {
        console.log('No push token available');
        return false;
      }

      const response = await fetch(`${API_URL}/api/push-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          user_id: userId,
          user_role: userRole,
          platform: Platform.OS,
        }),
      });

      if (response.ok) {
        console.log('Token registered with backend successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error registering token with backend:', error);
      return false;
    }
  }

  // Get current push token
  getToken(): string | null {
    return this.expoPushToken;
  }

  // Schedule local notification (for reminders)
  async scheduleAppointmentReminder(
    appointmentId: string,
    patientName: string,
    doctorName: string,
    date: string,
    time: string
  ): Promise<string | null> {
    try {
      // Parse the appointment date
      const appointmentDate = new Date(date);
      
      // Set reminder for 1 day before at 9 AM
      const reminderDate = new Date(appointmentDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      reminderDate.setHours(9, 0, 0, 0);

      // Only schedule if the reminder is in the future
      if (reminderDate <= new Date()) {
        console.log('Reminder date is in the past, skipping');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ تذكير بموعدك غداً',
          body: `لديك موعد مع ${doctorName} غداً الساعة ${time}`,
          data: { 
            type: 'appointment_reminder',
            appointmentId,
            screen: 'appointments'
          },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
        },
      });

      // Save the notification ID for potential cancellation
      const reminders = JSON.parse(await AsyncStorage.getItem('scheduledReminders') || '{}');
      reminders[appointmentId] = notificationId;
      await AsyncStorage.setItem('scheduledReminders', JSON.stringify(reminders));

      console.log('Reminder scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      return null;
    }
  }

  // Cancel a scheduled reminder
  async cancelAppointmentReminder(appointmentId: string): Promise<void> {
    try {
      const reminders = JSON.parse(await AsyncStorage.getItem('scheduledReminders') || '{}');
      const notificationId = reminders[appointmentId];
      
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        delete reminders[appointmentId];
        await AsyncStorage.setItem('scheduledReminders', JSON.stringify(reminders));
        console.log('Reminder cancelled:', notificationId);
      }
    } catch (error) {
      console.error('Error cancelling reminder:', error);
    }
  }

  // Show instant local notification
  async showLocalNotification(
    title: string,
    body: string,
    data?: object,
    channelId: string = 'default'
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null, // null means show immediately
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Add notification listeners
  addNotificationListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationResponse: (response: Notifications.NotificationResponse) => void
  ) {
    const receivedSubscription = Notifications.addNotificationReceivedListener(onNotificationReceived);
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem('scheduledReminders');
  }
}

export const notificationService = new NotificationService();
export default notificationService;
