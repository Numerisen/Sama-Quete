import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PrayerTime } from '../hooks/usePrayerTimes';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => {
    const baseBehavior: Notifications.NotificationBehavior = {
      // Compatibilité SDK 54: ces champs sont attendus (surtout iOS)
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
    return baseBehavior;
  },
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
}

// Demander les permissions pour les notifications
export async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission de notification refusée');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Canal pour les heures de prières
      await Notifications.setNotificationChannelAsync('prayer-times', {
        name: 'Heures de prières',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des notifications:', error);
    return false;
  }
}

// Planifier une notification immédiate
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null, // Notification immédiate
    });

    return notificationId;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    throw error;
  }
}

// Planifier une notification à une heure précise
export async function schedulePrayerNotification(
  prayerTime: PrayerTime,
  dayOfWeek: number, // 0 = Dimanche, 1 = Lundi, etc.
  minutesBefore: number = 15 // Notifier 15 minutes avant
): Promise<string | null> {
  try {
    // Parser l'heure (format HH:MM)
    const [hours, minutes] = prayerTime.time.split(':').map(Number);

    // Calculer l'heure de notification
    let notifHours = hours;
    let notifMinutes = minutes - minutesBefore;

    if (notifMinutes < 0) {
      notifMinutes += 60;
      notifHours -= 1;
    }

    if (notifHours < 0) {
      notifHours += 24;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🕌 ${prayerTime.name}`,
        body: `Dans ${minutesBefore} minutes à ${prayerTime.time}`,
        data: {
          type: 'prayer-time',
          prayerId: prayerTime.id,
          prayerName: prayerTime.name,
          prayerTime: prayerTime.time,
        },
        sound: 'default',
        categoryIdentifier: 'prayer-times',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday: dayOfWeek + 1, // expo-notifications utilise 1-7 au lieu de 0-6
        hour: notifHours,
        minute: notifMinutes,
        repeats: true, // Répéter chaque semaine
      },
    });

    console.log(`Notification planifiée pour ${prayerTime.name} à ${notifHours}:${notifMinutes}`);
    return notificationId;
  } catch (error) {
    console.error('Erreur lors de la planification de la notification:', error);
    return null;
  }
}

// Planifier toutes les notifications pour les heures de prières
export async function scheduleAllPrayerNotifications(
  prayerTimes: PrayerTime[],
  minutesBefore: number = 15
): Promise<string[]> {
  const notificationIds: string[] = [];

  // Annuler toutes les notifications existantes de type prayer-time
  await cancelAllPrayerNotifications();

  const daysMap: { [key: string]: number } = {
    'Dimanche': 0,
    'Lundi': 1,
    'Mardi': 2,
    'Mercredi': 3,
    'Jeudi': 4,
    'Vendredi': 5,
    'Samedi': 6,
  };

  for (const prayer of prayerTimes) {
    if (!prayer.active) continue;

    for (const day of prayer.days) {
      const dayOfWeek = daysMap[day];
      if (dayOfWeek !== undefined) {
        const notifId = await schedulePrayerNotification(prayer, dayOfWeek, minutesBefore);
        if (notifId) {
          notificationIds.push(notifId);
        }
      }
    }
  }

  console.log(`${notificationIds.length} notifications planifiées pour les heures de prières`);
  return notificationIds;
}

// Annuler toutes les notifications de type prayer-time
export async function cancelAllPrayerNotifications(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const prayerNotifs = scheduled.filter(
      (notif) => notif.content.data?.type === 'prayer-time'
    );

    for (const notif of prayerNotifs) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }

    console.log(`${prayerNotifs.length} notifications de prières annulées`);
  } catch (error) {
    console.error('Erreur lors de l\'annulation des notifications:', error);
  }
}

// Annuler toutes les notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Toutes les notifications annulées');
  } catch (error) {
    console.error('Erreur lors de l\'annulation des notifications:', error);
  }
}

// Obtenir toutes les notifications planifiées
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return [];
  }
}

// Envoyer une notification quand les heures de prières sont mises à jour
export async function notifyPrayerTimesUpdated(parishName: string): Promise<void> {
  try {
    await sendLocalNotification(
      '✅ Heures de prières mises à jour',
      `Les horaires de ${parishName} ont été actualisés. Consultez le calendrier pour voir les changements.`,
      {
        type: 'prayer-times-updated',
        parishName,
      }
    );
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de mise à jour:', error);
  }
}

// Gérer les notifications reçues
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

// Gérer les notifications cliquées
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Planifier une notification quotidienne pour les lectures du jour
export async function scheduleDailyLiturgyNotification(
  hour: number = 6,
  minute: number = 0
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📖 Lectures du jour',
        body: 'Découvrez les textes liturgiques et les lectures du jour',
        data: {
          type: 'liturgy',
          screen: 'liturgy',
        },
        sound: 'default',
        categoryIdentifier: 'liturgy',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        repeats: true,
      },
    });

    console.log(`Notification quotidienne planifiée pour ${hour}:${minute}`);
    return notificationId;
  } catch (error) {
    console.error('Erreur lors de la planification de la notification quotidienne:', error);
    return null;
  }
}

// Annuler toutes les notifications de liturgie
export async function cancelLiturgyNotifications(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const liturgyNotifs = scheduled.filter(
      (notif) => notif.content.data?.type === 'liturgy'
    );
    
    for (const notif of liturgyNotifs) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
    
    console.log(`${liturgyNotifs.length} notifications de liturgie annulées`);
  } catch (error) {
    console.error('Erreur lors de l\'annulation des notifications de liturgie:', error);
  }
}
