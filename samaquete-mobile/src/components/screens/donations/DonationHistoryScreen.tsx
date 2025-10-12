import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../../../../lib/numberFormat';

interface DonationHistoryScreenProps {
  setCurrentScreen: (screen: string) => void;
}

export default function DonationHistoryScreen({ setCurrentScreen }: DonationHistoryScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Données simulées des dons
  const donationHistory = [
    {
      id: '1',
      date: '2024-01-20',
      type: 'Quête dominicale',
      amount: 5000,
      church: 'Paroisse Saint-Pierre',
      status: 'completed',
      paymentMethod: 'Mobile Money'
    },
    {
      id: '2',
      date: '2024-01-18',
      type: 'Denier du culte',
      amount: 10000,
      church: 'Paroisse Sainte-Anne',
      status: 'completed',
      paymentMethod: 'Carte bancaire'
    },
    {
      id: '3',
      date: '2024-01-15',
      type: 'Cierge pascal',
      amount: 2500,
      church: 'Paroisse Saint-Pierre',
      status: 'completed',
      paymentMethod: 'Mobile Money'
    },
    {
      id: '4',
      date: '2024-01-12',
      type: 'Quête spéciale',
      amount: 15000,
      church: 'Paroisse Saint-Joseph',
      status: 'completed',
      paymentMethod: 'Virement bancaire'
    },
    {
      id: '5',
      date: '2024-01-10',
      type: 'Denier du culte',
      amount: 7500,
      church: 'Paroisse Saint-Pierre',
      status: 'completed',
      paymentMethod: 'Mobile Money'
    },
    {
      id: '6',
      date: '2024-01-08',
      type: 'Quête dominicale',
      amount: 3000,
      church: 'Paroisse Sainte-Marie',
      status: 'completed',
      paymentMethod: 'Espèces'
    }
  ];

  // Types de dons disponibles pour le filtre
  const donationTypes = [
    { id: 'all', name: 'Tous', icon: 'grid' },
    { id: 'Quête dominicale', name: 'Quête dominicale', icon: 'heart' },
    { id: 'Denier du culte', name: 'Denier du culte', icon: 'cash' },
    { id: 'Cierge pascal', name: 'Cierge pascal', icon: 'flame' },
    { id: 'Quête spéciale', name: 'Quête spéciale', icon: 'gift' },
  ];

  // Filtrer les dons selon le filtre sélectionné
  const filteredDonations = selectedFilter === 'all' 
    ? donationHistory 
    : donationHistory.filter(donation => donation.type === selectedFilter);

  const totalDonations = filteredDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const totalDonationsCount = filteredDonations.length;

  const getDonationTypeIcon = (type: string) => {
    switch (type) {
      case 'Quête dominicale':
        return 'heart';
      case 'Denier du culte':
        return 'cash';
      case 'Cierge pascal':
        return 'flame';
      case 'Quête spéciale':
        return 'gift';
      default:
        return 'card';
    }
  };

  const getDonationTypeColor = (type: string) => {
    switch (type) {
      case 'Quête dominicale':
        return '#ef4444';
      case 'Denier du culte':
        return '#3b82f6';
      case 'Cierge pascal':
        return '#f59e0b';
      case 'Quête spéciale':
        return '#10b981';
      default:
        return '#8b5cf6';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

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
            <Ionicons name="trending-up" size={32} color="#ffffff" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Mes Contributions</Text>
            <Text style={styles.headerSubtitle}>Historique de vos dons</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Statistiques résumées */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatNumber(totalDonations)}</Text>
              <Text style={styles.summaryLabel}>Total contribué</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalDonationsCount}</Text>
              <Text style={styles.summaryLabel}>Dons effectués</Text>
            </View>
          </View>

          {/* Filtres */}
          <View style={styles.filtersContainer}>
            <Text style={styles.sectionTitle}>Filtrer par type</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filtersScrollView}
            >
              {donationTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.filterButton,
                    selectedFilter === type.id && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedFilter(type.id)}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={16} 
                    color={selectedFilter === type.id ? '#ffffff' : '#6b7280'} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    selectedFilter === type.id && styles.filterButtonTextActive
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Liste des dons */}
          <Text style={styles.sectionTitle}>Détail des dons</Text>
          
          <View style={styles.donationsList}>
            {filteredDonations.map((donation, index) => (
              <View key={donation.id} style={styles.donationCard}>
                <View style={styles.donationHeader}>
                  <View style={styles.donationTypeContainer}>
                    <View style={[styles.donationTypeIcon, { backgroundColor: getDonationTypeColor(donation.type) }]}>
                      <Ionicons name={getDonationTypeIcon(donation.type) as any} size={16} color="#ffffff" />
                    </View>
                    <View style={styles.donationInfo}>
                      <Text style={styles.donationType}>{donation.type}</Text>
                      <Text style={styles.donationChurch}>{donation.church}</Text>
                    </View>
                  </View>
                  <Text style={styles.donationAmount}>{formatNumber(donation.amount)} FCFA</Text>
                </View>
                
                <View style={styles.donationDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={14} color="#6b7280" />
                    <Text style={styles.detailText}>{formatDate(donation.date)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="card" size={14} color="#6b7280" />
                    <Text style={styles.detailText}>{donation.paymentMethod}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                    <Text style={[styles.detailText, { color: '#10b981' }]}>Terminé</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Message d'encouragement */}
          <View style={styles.encouragementCard}>
            <Ionicons name="heart" size={24} color="#ef4444" />
            <Text style={styles.encouragementTitle}>Merci pour votre générosité</Text>
            <Text style={styles.encouragementText}>
              Vos dons contribuent à la vie de l'Église et aux œuvres paroissiales. 
              Que Dieu vous bénisse pour votre engagement.
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
  summaryCard: {
    backgroundColor: '#f8fafc', // bg-slate-50
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937', // text-gray-800
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280', // text-gray-500
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#d1d5db', // border-gray-300
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937', // text-gray-800
    marginBottom: 16,
  },
  filtersContainer: {
    marginBottom: 24,
  },
  filtersScrollView: {
    marginTop: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc', // bg-slate-50
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0', // border-slate-200
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6', // bg-blue-500
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280', // text-gray-500
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  donationsList: {
    marginBottom: 24,
  },
  donationCard: {
    backgroundColor: '#f8fafc', // bg-slate-50
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  donationTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  donationTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  donationInfo: {
    flex: 1,
  },
  donationType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937', // text-gray-800
    marginBottom: 2,
  },
  donationChurch: {
    fontSize: 14,
    color: '#6b7280', // text-gray-500
  },
  donationAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669', // text-green-600
  },
  donationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280', // text-gray-500
    marginLeft: 6,
  },
  encouragementCard: {
    backgroundColor: '#fef2f2', // bg-red-50
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca', // border-red-200
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626', // text-red-600
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  encouragementText: {
    fontSize: 14,
    color: '#dc2626', // text-red-600
    textAlign: 'center',
    lineHeight: 20,
  },
});
