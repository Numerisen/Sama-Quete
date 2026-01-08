import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../../../../lib/numberFormat';
import { SafeAreaView } from 'react-native-safe-area-context';
import { paymentService, DonationHistoryItem } from '../../../../lib/payment-service';
import { AnonymousStorage } from '../../../../lib/anonymous-storage';
import { useAuth } from '../../../../hooks/useAuth';

interface DonationHistoryScreenProps {
  setCurrentScreen: (screen: string) => void;
}

export default function DonationHistoryScreen({ setCurrentScreen }: DonationHistoryScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [donationHistory, setDonationHistory] = useState<DonationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Charger l'historique des contributions
  const loadDonationHistory = async () => {
    try {
      setLoading(true);
      
      // Obtenir l'UID anonyme si non authentifié
      let anonymousUid: string | undefined;
      if (!isAuthenticated) {
        anonymousUid = await AnonymousStorage.getOrCreateAnonymousUid();
      }
      
      // Récupérer l'historique depuis l'API
      const history = await paymentService.getDonationHistory(anonymousUid);
      
      setDonationHistory(history.donations);
      setTotalAmount(history.statistics.totalAmount);
      setTotalCount(history.statistics.totalCount);
    } catch (error: any) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de charger l\'historique des contributions',
        [{ text: 'OK' }]
      );
      // En cas d'erreur, garder une liste vide
      setDonationHistory([]);
      setTotalAmount(0);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger au montage du composant
  useEffect(() => {
    loadDonationHistory();
  }, [isAuthenticated]);

  // Fonction de rafraîchissement
  const onRefresh = () => {
    setRefreshing(true);
    loadDonationHistory();
  };

  // Types de dons disponibles pour le filtre (basés sur les vrais types)
  const donationTypes = [
    { id: 'all', name: 'Tous', icon: 'grid' },
    { id: 'Quête dominicale', name: 'Quête dominicale', icon: 'heart' },
    { id: 'Denier du culte', name: 'Denier du culte', icon: 'cash' },
    { id: 'Cierge pascal', name: 'Cierge pascal', icon: 'flame' },
    { id: 'Messe', name: 'Messe', icon: 'book' },
  ];

  // Filtrer les dons selon le filtre sélectionné
  const filteredDonations = selectedFilter === 'all' 
    ? donationHistory 
    : donationHistory.filter(donation => donation.type === selectedFilter);

  // Calculer le total des dons filtrés (pending + completed)
  const filteredTotal = filteredDonations
    .filter(d => d.status === 'completed' || d.status === 'pending')
    .reduce((sum, donation) => sum + donation.amount, 0);
  const filteredCount = filteredDonations.length;

  const getDonationTypeIcon = (type: string) => {
    switch (type) {
      case 'Quête dominicale':
        return 'heart';
      case 'Denier du culte':
        return 'cash';
      case 'Cierge pascal':
        return 'flame';
      case 'Messe':
        return 'book';
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
      case 'Messe':
        return '#10b981';
      default:
        return '#8b5cf6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échoué';
      case 'canceled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
      case 'canceled':
        return '#ef4444';
      default:
        return '#6b7280';
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
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
            <Ionicons name="trending-up" size={32} color="#ffffff" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Mes Contributions</Text>
            <Text style={styles.headerSubtitle}>Historique de vos dons</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Statistiques résumées */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Chargement de l'historique...</Text>
            </View>
          ) : (
            <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{formatNumber(selectedFilter === 'all' ? totalAmount : filteredTotal)}</Text>
              <Text style={styles.summaryLabel}>Total contribué</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{selectedFilter === 'all' ? totalCount : filteredCount}</Text>
              <Text style={styles.summaryLabel}>Dons effectués</Text>
            </View>
          </View>
            </>
          )}

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
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : filteredDonations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>Aucune contribution pour le moment</Text>
              <Text style={styles.emptySubtext}>
                {selectedFilter === 'all' 
                  ? 'Vos contributions apparaîtront ici après vos dons'
                  : 'Aucune contribution de ce type'}
              </Text>
            </View>
          ) : (
          <View style={styles.donationsList}>
              {filteredDonations.map((donation) => (
              <View key={donation.id} style={styles.donationCard}>
                <View style={styles.donationHeader}>
                  <View style={styles.donationTypeContainer}>
                    <View style={[styles.donationTypeIcon, { backgroundColor: getDonationTypeColor(donation.type) }]}>
                      <Ionicons name={getDonationTypeIcon(donation.type) as any} size={16} color="#ffffff" />
                    </View>
                    <View style={styles.donationInfo}>
                      <Text style={styles.donationType}>{donation.type}</Text>
                        <Text style={styles.donationChurch}>PayDunya</Text>
                      </View>
                    </View>
                    <Text style={styles.donationAmount}>{formatNumber(donation.amount)} {donation.currency || 'FCFA'}</Text>
                </View>
                
                <View style={styles.donationDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={14} color="#6b7280" />
                    <Text style={styles.detailText}>{formatDate(donation.date)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="card" size={14} color="#6b7280" />
                      <Text style={styles.detailText}>{donation.provider || 'PayDunya'}</Text>
                  </View>
                    <View style={styles.detailRow}>
                      <Ionicons 
                        name={
                          donation.status === 'completed' 
                            ? 'checkmark-circle' 
                            : donation.status === 'pending'
                            ? 'time'
                            : 'close-circle'
                        } 
                        size={14} 
                        color={getStatusColor(donation.status)} 
                      />
                      <Text style={[styles.detailText, { color: getStatusColor(donation.status) }]}>
                        {getStatusText(donation.status)}
                      </Text>
                    </View>
                </View>
              </View>
            ))}
          </View>
          )}

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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
