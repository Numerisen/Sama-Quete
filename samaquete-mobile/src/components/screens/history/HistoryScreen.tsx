import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HistoryScreenProps {
  setCurrentScreen: (screen: string) => void;
  userProfile: any;
}

export default function HistoryScreen({ setCurrentScreen }: HistoryScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('dashboard')}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historique</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.title}>Mes Contributions</Text>
        <Text style={styles.subtitle}>Cette fonctionnalité sera bientôt disponible</Text>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('dashboard')}
        >
          <Text style={styles.backButtonText}>Retour au tableau de bord</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
    textAlign: 'center',
  },
  backButtonText: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '600',
  },
});
