import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLiturgyApi } from '../../../../hooks/useLiturgyApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormattedLiturgyText } from '../../ui/FormattedLiturgyText';

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
    setApiUrl('https://6bc93741367f.ngrok-free.app'); // ngrok - Remplacez par votre nouvelle URL
                      
    // Pour tester l'interface sans API, commentez la ligne ci-dessus
    // L'app utilisera les données de fallback
  }, []);

  // Utiliser uniquement les données de l'API
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
        reference: todayLiturgy.firstReadingRef,
        title: "Première lecture",
        excerpt: todayLiturgy.firstReading,
      }] : []),
      ...(todayLiturgy.psalm ? [{
        reference: todayLiturgy.psalmRef,
        title: "Psaume",
        
        excerpt: todayLiturgy.psalm,
      }] : []),
      ...(todayLiturgy.secondReading ? [{
        reference: todayLiturgy.secondReadingRef,
        title: "Deuxième lecture",
        excerpt: todayLiturgy.secondReading,
      }] : []),
      ...(todayLiturgy.gospel ? [{
        reference: todayLiturgy.gospelRef,
        title: "Évangile",
        excerpt: todayLiturgy.gospel,
      }] : []),
    ],
  } : null;

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
            
            {/* Indicateurs de statut 
            
            <View style={styles.statusContainer}>
              <View style={[styles.statusIndicator, { backgroundColor: isOnline ? '#10b981' : '#ef4444' }]} />

              <Text style={styles.statusText}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </Text>
              todayLiturgy && (
                <Text style={styles.sourceText}>
                  Source: {todayLiturgy.source}
                </Text>

            </View>
         
              )}*/}
            </View>  

          {/* Carte de date avec backdrop-blur */}
          {todayReadings && (
            <View style={styles.dateCard}>
              <View style={styles.dateContent}>
                <Ionicons name="calendar" size={20} color="#ffffff" />
                <Text style={styles.dateText}>{todayReadings.date}</Text>
                <Text style={styles.liturgicalTime}>{todayReadings.liturgicalTime}</Text>
              </View>
            </View>
          )}
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

          {/* Section lectures d'aujourd'hui - Affichage exactement comme aelf.org */}
          {todayReadings ? (
            <View style={styles.liturgyContainer}>
              <Text style={styles.mainTitle}>LECTURES DE LA MESSE</Text>
              
              {todayReadings.readings.map((reading, index) => (
                <View key={index} style={styles.readingSection}>
                  {/* Titre de la lecture en rouge (comme sur aelf.org) */}
                  <Text style={styles.readingTitle}>{reading.title.toUpperCase()}</Text>
                  
                  {/* Référence biblique en italique */}
                  {reading.reference && (
                    <Text style={styles.readingReference}>{reading.reference}</Text>
                  )}
                  
                  {/* Texte formaté avec citations, responsories, acclamations en gras */}
                  <FormattedLiturgyText 
                    text={reading.excerpt} 
                    style={styles.readingText}
                  />
                  
                  {/* Séparateur entre les lectures */}
                  {index < todayReadings.readings.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Aucune donnée liturgique disponible</Text>
              <Text style={styles.noDataSubtext}>Vérifiez votre connexion à l'API</Text>
            </View>
          )}

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
  // Nouveaux styles pour l'affichage fluide
  liturgyContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'left',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  readingSection: {
    marginBottom: 32,
  },
  readingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626', // Rouge exactement comme sur aelf.org
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  readingReference: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 24,
    marginBottom: 8,
  },
  readingSource: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  readingText: {
    fontSize: 15,
    color: '#1f2937',
    lineHeight: 22,
    textAlign: 'left',
    marginBottom: 8,
  },
  readingEnding: {
    fontSize: 15,
    color: '#1f2937',
    lineHeight: 22,
    textAlign: 'left',
    marginLeft: 16,
  },
  psalmResponse: {
    marginTop: 8,
  },
  psalmResponseText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
    lineHeight: 22,
    marginBottom: 4,
  },
  psalmAlternative: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
    lineHeight: 22,
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
  noDataContainer: {
    backgroundColor: '#f8fafc',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});