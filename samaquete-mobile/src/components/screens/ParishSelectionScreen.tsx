import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../lib/ThemeContext';

interface ParishSelectionScreenProps {
  setCurrentScreen: (screen: string) => void;
  setSelectedParish: (parish: string) => void;
}

export default function ParishSelectionScreen({ setCurrentScreen, setSelectedParish }: ParishSelectionScreenProps) {
  const { colors } = useTheme();
  const parishes = [
    {
      name: 'Cathédrale du Souvenir Africain',
      location: 'Dakar',
      description: 'Cathédrale principale de Dakar',
      icon: 'business',
    },
    {
      name: 'Paroisse Sainte-Anne',
      location: 'Rufisque',
      description: 'Communauté dynamique de Rufisque',
      icon: 'business',
    },
    {
      name: 'Paroisse Saint-Joseph',
      location: 'Thiès',
      description: 'Au cœur de la région de Thiès',
      icon: 'business',
    },
    {
      name: 'Paroisse Notre-Dame',
      location: 'Saint-Louis',
      description: 'Patrimoine spirituel de Saint-Louis',
      icon: 'business',
    },
  ];

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

        {/* Liste des paroisses */}
        <View style={[styles.parishesContainer, { backgroundColor: colors.background }]}>
          {parishes.map((parish, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.parishCard, { backgroundColor: colors.card }]}
              onPress={() => handleParishSelection(parish.name)}
            >
              <View style={styles.parishIcon}>
                <Ionicons name={parish.icon as any} size={24} color="#92400E" />
              </View>
              <View style={styles.parishInfo}>
                <Text style={[styles.parishName, { color: colors.text }]}>{parish.name}</Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={14} color={colors.textSecondary} />
                  <Text style={[styles.parishLocation, { color: colors.textSecondary }]}>{parish.location}</Text>
                </View>
                <Text style={[styles.parishDescription, { color: colors.textSecondary }]}>{parish.description}</Text>
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
