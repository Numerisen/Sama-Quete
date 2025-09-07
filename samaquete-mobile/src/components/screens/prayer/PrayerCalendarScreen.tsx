import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface PrayerCalendarScreenProps {
  setCurrentScreen: (screen: string) => void;
}

export default function PrayerCalendarScreen({ setCurrentScreen }: PrayerCalendarScreenProps) {
  const weeklySchedule = [
    { day: "Lundi", time: "06:30", type: "Messe quotidienne", isToday: true },
    { day: "Mardi", time: "06:30", type: "Messe quotidienne", isToday: false },
    { day: "Mercredi", time: "06:30", type: "Messe quotidienne", isToday: false },
    { day: "Jeudi", time: "06:30", type: "Messe quotidienne", isToday: false },
    { day: "Vendredi", time: "06:30", type: "Messe quotidienne", isToday: false },
    { day: "Samedi", time: "18:00", type: "Messe de vigile", isToday: false },
    { day: "Dimanche", time: "09:00", type: "Messe dominicale", isToday: false },
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
            <Ionicons name="calendar" size={32} color="#ffffff" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Calendrier des prières</Text>
            <Text style={styles.headerSubtitle}>Programme de la semaine</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Section programme de la semaine */}
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
              Les horaires peuvent varier selon les périodes liturgiques. 
              Consultez les annonces paroissiales pour les mises à jour.
            </Text>
          </View>
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
});
