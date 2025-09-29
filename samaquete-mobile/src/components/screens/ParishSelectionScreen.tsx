import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../lib/ThemeContext';
import { useParishes } from '../../../hooks/useParishes';

interface ParishSelectionScreenProps {
  setCurrentScreen: (screen: string) => void;
  setSelectedParish: (parish: string) => void;
}

export default function ParishSelectionScreen({ setCurrentScreen, setSelectedParish }: ParishSelectionScreenProps) {
  const { colors } = useTheme();
  const { parishes, loading, error } = useParishes();

  const handleParishSelection = (parishName: string) => {
    setSelectedParish(parishName);
    setCurrentScreen('donations');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('dashboard')}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Choisissez votre église</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Chaque église a ses propres tarifs</Text>
          </View>
        </View>

        {/* Liste des paroisses depuis Firebase */}
        <View style={[styles.parishesContainer, { backgroundColor: colors.background }]}>
          {loading && (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator color={colors.text} />
              <Text style={{ marginTop: 8, color: colors.textSecondary }}>Chargement des paroisses…</Text>
            </View>
          )}

          {error && !loading && (
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: '#dc2626' }}>Erreur: {error}</Text>
            </View>
          )}

          {!loading && !error && parishes.length === 0 && (
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: colors.textSecondary }}>Aucune paroisse disponible.</Text>
            </View>
          )}

          {!loading && !error && parishes.map((parish, index) => (
            <TouchableOpacity
              key={parish.id || index}
              style={[styles.parishCard, { backgroundColor: colors.card }]}
              onPress={() => handleParishSelection(parish.name)}
            >
              <View style={styles.parishIcon}>
                <Ionicons name={'business' as any} size={24} color="#92400E" />
              </View>
              <View style={styles.parishInfo}>
                <Text style={[styles.parishName, { color: colors.text }]}>{parish.name}</Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={14} color={colors.textSecondary} />
                  <Text style={[styles.parishLocation, { color: colors.textSecondary }]}>{parish.city || parish.location}</Text>
                </View>
                {parish.dioceseName ? (
                  <Text style={[styles.parishDescription, { color: colors.textSecondary }]}>Diocèse: {parish.dioceseName}</Text>
                ) : null}
              </View>
              <View style={styles.navigationArrow}>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefce8',
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
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  parishesContainer: {
    padding: 20,
    gap: 15,
  },
  parishCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  parishIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#fcd34d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  parishInfo: {
    flex: 1,
  },
  parishName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  parishLocation: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  parishDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  navigationArrow: {
    padding: 8,
  },
});
