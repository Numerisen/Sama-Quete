import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePrayerTimes, getWeeklySchedule } from '../../../../hooks/usePrayerTimes';
import { 
  registerForPushNotificationsAsync, 
  scheduleAllPrayerNotifications,
  notifyPrayerTimesUpdated 
} from '../../../../lib/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrayerCalendarScreenProps {
  setCurrentScreen: (screen: string) => void;
}

export default function PrayerCalendarScreen({ setCurrentScreen }: PrayerCalendarScreenProps) {
  const [parishId, setParishId] = useState<string>('paroisse-saint-jean-bosco');
  const [parishName, setParishName] = useState<string>('Paroisse Saint Jean Bosco');
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { prayerTimes, loading, error, refresh } = usePrayerTimes(parishId);
  const weeklySchedule = getWeeklySchedule(prayerTimes);

  // Charger la paroisse sélectionnée
  useEffect(() => {
    loadSelectedParish();
    checkNotificationStatus();
  }, []);

  // Surveiller les changements des heures de prières
  useEffect(() => {
    if (prayerTimes.length > 0 && lastUpdate) {
      const now = new Date();
      // Si les données ont été mises à jour il y a moins de 5 secondes, c'est une nouvelle mise à jour
      if (now.getTime() - lastUpdate.getTime() < 5000) {
        handlePrayerTimesUpdate();
      }
    }
    setLastUpdate(new Date());
  }, [prayerTimes]);

  const loadSelectedParish = async () => {
    try {
      const selectedParish = await AsyncStorage.getItem('selectedParish');
      console.log('📍 Paroisse sélectionnée (AsyncStorage):', selectedParish);
      
      if (selectedParish) {
        const parish = JSON.parse(selectedParish);
        const id = parish.id || 'paroisse-saint-jean-bosco';
        const name = parish.name || 'Paroisse Saint Jean Bosco';
        
        console.log('🏛️ ParishId utilisé:', id);
        console.log('🏛️ Parish name:', name);
        
        setParishId(id);
        setParishName(name);
      } else {
        console.log('⚠️ Aucune paroisse sélectionnée, utilisation de la valeur par défaut');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la paroisse:', error);
    }
  };

  const checkNotificationStatus = async () => {
    try {
      const enabled = await AsyncStorage.getItem('prayerNotificationsEnabled');
      setNotificationsEnabled(enabled === 'true');
    } catch (error) {
      console.error('Erreur lors de la vérification des notifications:', error);
    }
  };

  const handlePrayerTimesUpdate = async () => {
    // Envoyer une notification indiquant que les heures ont été mises à jour
    await notifyPrayerTimesUpdated(parishName);

    // Re-planifier les notifications si elles sont activées
    if (notificationsEnabled) {
      await scheduleAllPrayerNotifications(prayerTimes, 15);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleNotifications = async () => {
    try {
      if (!notificationsEnabled) {
        // Activer les notifications
        const granted = await registerForPushNotificationsAsync();
        if (granted) {
          await scheduleAllPrayerNotifications(prayerTimes, 15);
          await AsyncStorage.setItem('prayerNotificationsEnabled', 'true');
          setNotificationsEnabled(true);
          Alert.alert(
            'Notifications activées',
            'Vous recevrez des rappels 15 minutes avant chaque heure de prière.'
          );
        } else {
          Alert.alert(
            'Permission refusée',
            'Veuillez autoriser les notifications dans les paramètres de votre appareil.'
          );
        }
      } else {
        // Désactiver les notifications
        await AsyncStorage.setItem('prayerNotificationsEnabled', 'false');
        setNotificationsEnabled(false);
        Alert.alert(
          'Notifications désactivées',
          'Vous ne recevrez plus de rappels pour les heures de prière.'
        );
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des notifications:', error);
      Alert.alert('Erreur', 'Impossible de modifier les paramètres de notification');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header avec gradient bleu */}
        <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('dashboard')}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Ionicons name="calendar" size={32} color="#ffffff" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Calendrier des prières</Text>
            <Text style={styles.headerSubtitle}>{parishName}</Text>
            
            {/* Bouton notifications */}
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={toggleNotifications}
            >
              <Ionicons 
                name={notificationsEnabled ? "notifications" : "notifications-off"} 
                size={20} 
                color="#ffffff" 
              />
              <Text style={styles.notificationButtonText}>
                {notificationsEnabled ? 'Actives' : 'Inactives'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Indicateur de chargement */}
          {loading && !refreshing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Chargement des heures de prières...</Text>
            </View>
          )}

          {/* Affichage des erreurs */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={refresh} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Section programme de la semaine */}
          {!loading && !error && weeklySchedule.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Programme de la semaine</Text>
              
              <View style={styles.scheduleList}>
                {weeklySchedule.map((schedule, index) => (
              <View 
                key={index} 
                style={[
                  styles.scheduleCard,
                  schedule.isToday && styles.todayScheduleItem
                ]}
              >
                <View style={styles.scheduleItem}>
                  <View style={styles.scheduleLeft}>
                    <Ionicons name="time" size={16} color="#6b7280" />
                    <Text style={styles.scheduleDay}>{schedule.day}</Text>
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeText}>{schedule.time}</Text>
                    </View>
                  </View>
                  <View style={styles.scheduleRight}>
                    <Text style={styles.scheduleType}>{schedule.type}</Text>
                    {schedule.isToday && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayText}>Aujourd'hui</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

              {/* Section informations supplémentaires */}
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Ionicons name="information-circle" size={20} color="#3b82f6" />
                  <Text style={styles.infoTitle}>Informations</Text>
                </View>
                <Text style={styles.infoText}>
                  Les horaires sont synchronisés avec votre paroisse. 
                  {notificationsEnabled && ' Vous recevrez un rappel 15 minutes avant chaque heure de prière.'}
                </Text>
              </View>
            </>
          )}

          {/* Message quand il n'y a pas de données */}
          {!loading && !error && weeklySchedule.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>Aucune heure de prière configurée</Text>
              <Text style={styles.emptyText}>
                Les heures de prières n'ont pas encore été configurées pour cette paroisse.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff', // from-blue-50 via-white to-purple-50 (gradient effect)
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    top: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  headerIcon: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#dbeafe', // text-blue-100
  },
  content: {
    padding: 24,
    marginTop: -16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937', // text-gray-800
    marginBottom: 16,
  },
  scheduleList: {
    marginBottom: 24,
  },
  scheduleCard: {
    backgroundColor: '#f8fafc', // bg-slate-50 - légèrement plus accentué que white/90
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0', // border-slate-200 - bordure subtile
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayScheduleItem: {
    backgroundColor: '#dbeafe', // bg-blue-50
    borderColor: '#bfdbfe', // border-blue-200
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937', // text-gray-800
  },
  timeBadge: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#d1d5db', // border-gray-300
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280', // text-gray-500
    fontWeight: '600',
  },
  scheduleRight: {
    alignItems: 'flex-end',
  },
  scheduleType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937', // text-gray-800
  },
  todayBadge: {
    backgroundColor: '#dbeafe', // bg-blue-100
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    borderWidth: 0,
  },
  todayText: {
    fontSize: 12,
    color: '#1d4ed8', // text-blue-700
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#f0f9ff', // bg-blue-50
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bae6fd', // border-blue-200
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af', // text-blue-800
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af', // text-blue-800
    lineHeight: 20,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  notificationButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
