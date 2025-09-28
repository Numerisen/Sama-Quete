import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLiturgyApi } from '../../../../hooks/useLiturgyApi';

interface LiturgyScreenProps {
  setCurrentScreen: (screen: string) => void;
}

export default function LiturgyScreen({ setCurrentScreen }: LiturgyScreenProps) {
  const { 
    todayLiturgy, 
    loading, 
    error, 
    isOnline, 
    refresh, 
    forceSync,
    setApiUrl
  } = useLiturgyApi();

  const [showApiConfig, setShowApiConfig] = useState(false);

  // Configuration de l'API au démarrage
  useEffect(() => {
    // Configurer l'URL de l'API (local par défaut)
    // Vous pouvez changer cette URL selon votre configuration
    // setApiUrl('http://127.0.0.1:5000'); // Local
    setApiUrl('https://81b5b72e4de7.ngrok-free.app'); // ngrok - Remplacez par votre nouvelle URL
    
    // Pour tester l'interface sans API, commentez la ligne ci-dessus
    // L'app utilisera les données de fallback
  }, []);

  // Données de fallback si l'API n'est pas disponible
  const fallbackReadings = {
    date: "Dimanche 21 Janvier 2024",
    liturgicalTime: "3ème Dimanche du Temps Ordinaire",
    color: "Vert",
    readings: [
      {
        reference: "Jonas 3, 1-5.10",
        title: "Première lecture",
        excerpt: "En ces jours-là, la parole du Seigneur fut adressée à Jonas : « Lève-toi, va à Ninive, la grande ville, proclame le message que je te donne. »",
      },
      {
        reference: "Psaume 24",
        title: "Psaume ",
        excerpt: "Seigneur, enseigne-moi tes voies.",
      },
      {
        reference: "1 Co 7, 29-31",
        title: "Deuxième lecture",
        excerpt: "Frères, je dois vous le dire : le temps est limité. Désormais, que ceux qui ont une épouse vivent comme s'ils n'en avaient pas...",
      },
      {
        reference: "Marc 1, 14-20",
        title: "Évangile",
        excerpt: "Après l'arrestation de Jean le Baptiste, Jésus partit pour la Galilée proclamer l'Évangile de Dieu ; il disait : « Les temps sont accomplis : le règne de Dieu est tout proche. Convertissez-vous et croyez à l'Évangile. »",
      },
    ],
  };

  // Utiliser les données de l'API ou les données de fallback
  const todayReadings = todayLiturgy ? {
    date: new Date(todayLiturgy.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    liturgicalTime: todayLiturgy.title,
    color: todayLiturgy.color || 'Vert',
    readings: [
      ...(todayLiturgy.firstReading ? [{
        reference: todayLiturgy.firstReadingRef || "1 Tm 4, 12-16",
        title: "Première lecture",
        excerpt: todayLiturgy.firstReading,
      }] : []),
      ...(todayLiturgy.psalm ? [{
        reference: todayLiturgy.psalmRef || "Ps 110 (111), 7-8, 9, 10",
        title: "Psaume ",
        excerpt: todayLiturgy.psalm,
      }] : []),
      ...(todayLiturgy.secondReading ? [{
        reference: todayLiturgy.secondReadingRef || "1 Co 7, 29-31",
        title: "Deuxième lecture",
        excerpt: todayLiturgy.secondReading,
      }] : []),
      ...(todayLiturgy.gospel ? [{
        reference: todayLiturgy.gospelRef || "Lc 7, 36-50",
        title: "Évangile",
        excerpt: todayLiturgy.gospel,
      }] : []),
    ],
  } : fallbackReadings;

  const weeklySchedule = [
    { day: "Lundi", time: "06:30", type: "Messe quotidienne", isToday: false },
    { day: "Mardi", time: "06:30", type: "Messe quotidienne", isToday: false },
    { day: "Mercredi", time: "06:30", type: "Messe quotidienne", isToday: false },
    { day: "Jeudi", time: "06:30", type: "Messe quotidienne", isToday: false },
    { day: "Vendredi", time: "06:30", type: "Messe quotidienne", isToday: false },
    { day: "Samedi", time: "18:00", type: "Messe de vigile", isToday: false },
    { day: "Dimanche", time: "09:00", type: "Messe dominicale", isToday: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec gradient bleu */}
        <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('dashboard')}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Textes liturgiques</Text>
            <Text style={styles.headerSubtitle}>Lectures du jour</Text>
            
            {/* Indicateurs de statut */}
            <View style={styles.statusContainer}>
              <View style={[styles.statusIndicator, { backgroundColor: isOnline ? '#10b981' : '#ef4444' }]} />
              <Text style={styles.statusText}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </Text>
              {/*todayLiturgy && (
                <Text style={styles.sourceText}>
                  Source: {todayLiturgy.source}
                </Text>
              )}*/}
            </View>
          </View>

          {/* Carte de date avec backdrop-blur */}
          <View style={styles.dateCard}>
            <View style={styles.dateContent}>
              <Ionicons name="calendar" size={20} color="#ffffff" />
              <Text style={styles.dateText}>{todayReadings.date}</Text>
              <Text style={styles.liturgicalTime}>{todayReadings.liturgicalTime}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Boutons de contrôle 
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={refresh}
              disabled={loading}
            >
              <Ionicons name="refresh" size={16} color="#3b82f6" />
              <Text style={styles.controlButtonText}>Actualiser</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.primaryButton]}
              onPress={async () => {
                const success = await forceSync();
                if (success) {
                  Alert.alert('Succès', 'Synchronisation réussie');
                } else {
                  Alert.alert('Erreur', 'Échec de la synchronisation');
                }
              }}
              disabled={loading}
            >
              <Ionicons name="sync" size={16} color="#ffffff" />
              <Text style={[styles.controlButtonText, styles.primaryButtonText]}>Sync</Text>
            </TouchableOpacity>
          </View>*/}

          {/* Indicateur de chargement */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadingText}>Chargement des textes...</Text>
            </View>
          )}

          {/* Affichage des erreurs */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={20} color="#ef4444" />
              <Text style={styles.errorText}>{error.message}</Text>
            </View>
          )}

          {/* Section lectures d'aujourd'hui */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lectures d'aujourd'hui</Text>
            <View style={styles.liturgicalColorBadge}>
              <Text style={styles.liturgicalColorText}>Couleur {todayReadings.color}</Text>
            </View>
          </View>

          <View style={styles.readingsList}>
            {todayReadings.readings.map((reading, index) => (
              <View key={index} style={styles.readingCard}>
                <View style={styles.readingItem}>
                  <View style={styles.readingIconContainer}>
                    <Ionicons name="book" size={16} color="#ffffff" />
                  </View>
                  <View style={styles.readingContent}>
                    <View style={styles.readingHeader}>
                      <Text style={styles.readingTitle}>{reading.title}</Text>
                      <View style={styles.referenceBadge}>
                        <Text style={styles.referenceText}>{reading.reference}</Text>
                      </View>
                    </View>
                    <Text style={styles.readingExcerpt}>{reading.excerpt}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Section programme de la semaine
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
          */}
          
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
  dateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // bg-white/20 backdrop-blur-sm
    borderRadius: 12,
    padding: 16,
    borderWidth: 0,
  },
  dateContent: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  liturgicalTime: {
    fontSize: 14,
    color: '#dbeafe', // text-blue-100
    textAlign: 'center',
  },
  content: {
    padding: 24,
    marginTop: -16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  readingCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937', // text-gray-800
  },
  liturgicalColorBadge: {
    backgroundColor: '#dcfce7', // bg-green-100
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0,
  },
  liturgicalColorText: {
    color: '#166534', // text-green-700
    fontSize: 12,
    fontWeight: '600',
  },
  readingsList: {
    marginBottom: 24,
  },
  readingItem: {
    flexDirection: 'row',
  },
  readingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#60a5fa', // from-blue-400 to-blue-500
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  readingContent: {
    flex: 1,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  readingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937', // text-gray-800
  },
  referenceBadge: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#d1d5db', // border-gray-300
  },
  referenceText: {
    fontSize: 12,
    color: '#6b7280', // text-gray-500
    fontWeight: '500',
  },
  readingExcerpt: {
    fontSize: 14,
    color: '#4b5563', // text-gray-600
    lineHeight: 20,
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
  scheduleList: {
    marginBottom: 24,
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
  // Nouveaux styles pour l'intégration API
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#dbeafe',
    fontWeight: '500',
  },
  sourceText: {
    fontSize: 10,
    color: '#93c5fd',
    fontStyle: 'italic',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
  },
});