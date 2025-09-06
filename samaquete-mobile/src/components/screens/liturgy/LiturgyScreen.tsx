import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../lib/ThemeContext';

interface LiturgyScreenProps {
  setCurrentScreen: (screen: string) => void;
}

export default function LiturgyScreen({ setCurrentScreen }: LiturgyScreenProps) {
  const { colors } = useTheme();
  const dailyReadings = [
    {
      title: 'Première lecture',
      reference: 'Jonas 3, 1-5.10',
      text: 'En ces jours-là, la parole du Seigneur fut adressée à Jonas : « Lève-toi, va à Ninive, la grande ville, proclame le message que je te donne. »',
      icon: 'book',
    },
    {
      title: 'Psaume responsorial',
      reference: 'Psaume 24',
      text: 'Seigneur, enseigne-moi tes voies.',
      icon: 'book',
    },
    {
      title: 'Deuxième lecture',
      reference: '1 Co 7, 29-31',
      text: 'Frères, je dois vous le dire : le temps est limité. Désormais, que ceux qui ont une épouse vivent comme s\'ils n\'en avaient pas...',
      icon: 'book',
    },
    {
      title: 'Évangile',
      reference: 'Marc 1, 14-20',
      text: 'Après l\'arrestation de Jean le Baptiste, Jésus partit pour la Galilée proclamer l\'Évangile de Dieu ; il disait : « Les temps sont accomplis : le règne de Dieu est tout proche. Convertissez-vous et croyez à l\'Évangile. »',
      icon: 'book',
    },
  ];

  const weeklySchedule = [
    { day: 'Lundi', time: '06:30', type: 'Messe quotidienne', isToday: false },
    { day: 'Mardi', time: '06:30', type: 'Messe quotidienne', isToday: false },
    { day: 'Mercredi', time: '06:30', type: 'Messe quotidienne', isToday: false },
    { day: 'Jeudi', time: '06:30', type: 'Messe quotidienne', isToday: false },
    { day: 'Vendredi', time: '06:30', type: 'Messe quotidienne', isToday: false },
    { day: 'Samedi', time: '18:00', type: 'Messe de vigile', isToday: false },
    { day: 'Dimanche', time: '09:00', type: 'Messe dominicale', isToday: true },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header bleu avec gradient */}
        <LinearGradient colors={colors.header as any} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('dashboard')}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Textes liturgiques</Text>
            <Text style={styles.headerSubtitle}>Lectures du jour</Text>
          </View>
        </LinearGradient>

        {/* Carte de date */}
        <View style={styles.dateCard}>
          <LinearGradient colors={colors.header as any} style={styles.dateCardGradient}>
            <View style={styles.dateContent}>
              <Ionicons name="calendar" size={24} color="#ffffff" />
              <Text style={styles.dateText}>Dimanche 21 Janvier 2024</Text>
              <Text style={styles.liturgicalTime}>3ème Dimanche du Temps Ordinaire</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Section lectures du jour */}
        <View style={[styles.readingsSection, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Lectures d'aujourd'hui</Text>
            <View style={[styles.liturgicalColor, { backgroundColor: colors.card }]}>
              <Text style={[styles.liturgicalColorText, { color: colors.text }]}>Couleur Vert</Text>
            </View>
          </View>

          <View style={styles.readingsList}>
            {dailyReadings.map((reading, index) => (
              <View key={index} style={[styles.readingCard, { backgroundColor: colors.card }]}>
                <View style={styles.readingIcon}>
                  <Ionicons name={reading.icon as any} size={20} color="#ffffff" />
                </View>
                <View style={styles.readingContent}>
                  <View style={styles.readingHeader}>
                    <Text style={[styles.readingTitle, { color: colors.text }]}>{reading.title}</Text>
                    <View style={[styles.referenceBadge, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.referenceText, { color: colors.textSecondary }]}>{reading.reference}</Text>
                    </View>
                  </View>
                  <Text style={[styles.readingText, { color: colors.textSecondary }]}>{reading.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Section programme de la semaine */}
        <View style={[styles.scheduleSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Programme de la semaine</Text>
          
          <View style={styles.scheduleList}>
            {weeklySchedule.map((schedule, index) => (
              <View 
                key={index} 
                style={[
                  styles.scheduleItem,
                  { backgroundColor: colors.card },
                  schedule.isToday && styles.todayScheduleItem
                ]}
              >
                <View style={styles.scheduleIcon}>
                  <Ionicons name="time" size={20} color={colors.textSecondary} />
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={[styles.scheduleDay, { color: colors.text }]}>{schedule.day}</Text>
                  <View style={styles.scheduleDetails}>
                    <View style={[styles.timeBadge, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.timeText, { color: colors.textSecondary }]}>{schedule.time}</Text>
                    </View>
                    <Text style={[styles.scheduleType, { color: colors.textSecondary }]}>{schedule.type}</Text>
                  </View>
                </View>
                {schedule.isToday && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayText}>Aujourd'hui</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  dateCard: {
    margin: 20,
    marginTop: -15,
  },
  dateCardGradient: {
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dateContent: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  liturgicalTime: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  readingsSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  liturgicalColor: {
    backgroundColor: '#10b981',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  liturgicalColorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  readingsList: {
    gap: 15,
  },
  readingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  readingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  readingContent: {
    flex: 1,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  readingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  referenceBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  referenceText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  readingText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  scheduleSection: {
    padding: 20,
    paddingBottom: 40,
  },
  scheduleList: {
    gap: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
  },
  todayScheduleItem: {
    backgroundColor: '#dbeafe',
  },
  scheduleIcon: {
    marginRight: 15,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  scheduleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  scheduleType: {
    fontSize: 14,
    color: '#64748b',
  },
  todayBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  todayText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
});
