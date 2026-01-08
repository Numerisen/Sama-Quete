import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useParishes } from '../../../hooks/useParishes';
import { formatNumber } from '../../../lib/numberFormat';
import { Parish } from '../../../lib/parish-service';
import { useTheme } from '../../../lib/ThemeContext';
import { paymentService } from '../../../lib/payment-service';
import { AnonymousStorage } from '../../../lib/anonymous-storage';
import { useAuth } from '../../../hooks/useAuth';

interface DashboardScreenProps {
  setCurrentScreen: (screen: string) => void;
  userProfile: {
    name: string;
    phone: string;
    totalDonations: number;
    prayerDays: number;
  };
}

export default function DashboardScreen({ setCurrentScreen, userProfile }: DashboardScreenProps) {
  const { colors, isDarkMode } = useTheme();
  const [showChurchModal, setShowChurchModal] = useState(false);
  const [totalContributions, setTotalContributions] = useState(0);
  const [loadingContributions, setLoadingContributions] = useState(true);
  
  // Utiliser les données Firebase
  const { 
    parishes, 
    dioceses, 
    loading, 
    error, 
    selectedParish, 
    setSelectedParish 
  } = useParishes();
  
  const [currentChurch, setCurrentChurch] = useState('Chargement...');
  
  // Vérifier si l'utilisateur est authentifié
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  // Charger le total des contributions
  useEffect(() => {
    const loadContributions = async () => {
      try {
        setLoadingContributions(true);
        
        // Obtenir l'UID anonyme si non authentifié
        let anonymousUid: string | undefined;
        if (!isAuthenticated) {
          anonymousUid = await AnonymousStorage.getAnonymousUid();
        }
        
        // Si pas d'UID anonyme et pas authentifié, pas de contributions
        if (!isAuthenticated && !anonymousUid) {
          setTotalContributions(0);
          setLoadingContributions(false);
          return;
        }
        
        // Récupérer l'historique depuis l'API
        const history = await paymentService.getDonationHistory(anonymousUid);
        setTotalContributions(history.statistics.totalAmount);
      } catch (error) {
        console.error('Erreur lors du chargement des contributions:', error);
        // En cas d'erreur, garder 0 ou utiliser userProfile.totalDonations comme fallback
        setTotalContributions(userProfile.totalDonations || 0);
      } finally {
        setLoadingContributions(false);
      }
    };
    
    loadContributions();
  }, [isAuthenticated, userProfile.totalDonations]);

  // Utiliser les paroisses de Firebase
  const availableParishes = parishes.map(parish => ({
    id: parish.id,
    name: parish.name,
    location: parish.city || parish.location,
    diocese: parish.dioceseName
  }));

  const handleChurchSelection = (parish: Parish) => {
    setCurrentChurch(parish.name);
    setSelectedParish(parish);
    setShowChurchModal(false);
  };

  // Mettre à jour l'église actuelle quand les données Firebase sont chargées
  useEffect(() => {
    if (selectedParish) {
      setCurrentChurch(selectedParish.name);
    } else if (parishes.length > 0 && !loading) {
      // Si aucune paroisse n'est sélectionnée, prendre la première
      setCurrentChurch(parishes[0].name);
      setSelectedParish(parishes[0]);
    }
  }, [selectedParish, parishes, loading]);

  const mainFeatures = [
    {
      title: 'Faire un don',
      subtitle: 'Quête, denier, cierge',
      icon: 'heart',
      color: '#ef4444',
      screen: 'donations',
    },
    {
      title: 'Textes liturgiques',
      subtitle: 'Lectures du jour',
      icon: 'book',
      color: '#3b82f6',
      screen: 'liturgy',
    },
    {
      title: 'Actualités',
      subtitle: 'Vie paroissiale',
      icon: 'newspaper',
      color: '#10b981',
      screen: 'news',
    },
    {
      title: 'IA spirituelle',
      subtitle: 'Questions sur la foi',
      icon: 'chatbubble-ellipses',
      color: '#8b5cf6',
      screen: 'assistant',
    },
  ];

  // Utiliser les paroisses disponibles avec des données simulées pour les visites
  const mostVisitedParishes = availableParishes.slice(0, 3).map((parish, index) => ({
    name: parish.name,
    location: parish.location,
    visits: 45 - (index * 10), // Simulation des visites
    icon: 'business' as const,
    lastVisit: index === 0 ? 'Aujourd\'hui' : index === 1 ? 'Hier' : 'Il y a 2 jours',
  }));

  // Afficher un indicateur de chargement si les données sont en cours de chargement
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des paroisses...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Afficher une erreur si le chargement a échoué
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Erreur de chargement
          </Text>
          <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec gradient orange */}
        <LinearGradient colors={colors.header as any} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color="#ffffff" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.welcomeText}>Paix du Christ!</Text>
                <Text style={styles.userName}>Bienvenue dans SamaQuête</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}
                onPress={() => setCurrentScreen('notifications')}
              >
                <Ionicons name="notifications" size={12} color={isDarkMode ? colors.text : '#f59e0b'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}
                onPress={() => setCurrentScreen('settings')}
              >
                <Ionicons name="settings" size={12} color={isDarkMode ? colors.text : '#f59e0b'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Carte église actuelle */}
          <View style={styles.currentChurchCard}>
            <View style={styles.churchCardContent}>
              <View style={styles.churchIcon}>
                <Ionicons name="business" size={24} color="#ffffff" />
              </View>
              <View style={styles.churchInfo}>
                <Text style={styles.churchText}>Votre église actuelle</Text>
                <Text style={styles.currentChurchName}>{currentChurch}</Text>
              </View>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setShowChurchModal(true)}
              >
                <Ionicons name="create" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Statistiques dans le header */}
          <View style={styles.statsContainer}>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => setCurrentScreen('donation-history')}
            >
              <View style={styles.statIcon}>
                <Ionicons name="trending-up" size={20} color="#ffffff" />
              </View>
              {loadingContributions ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.statValue}>{formatNumber(totalContributions)}</Text>
              )}
              <Text style={styles.statLabel}>Mes Contributions</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => setCurrentScreen('prayer-calendar')}
            >
              <View style={styles.statIcon}>
                <Ionicons name="calendar" size={20} color="#ffffff" />
              </View>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Horaires de prière</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Grille des fonctionnalités principales */}
        <View style={[styles.featuresContainer, { backgroundColor: colors.background }]}>
          <View style={styles.featuresGrid}>
            {mainFeatures.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.featureCard, { backgroundColor: colors.card }]}
                onPress={() => setCurrentScreen(feature.screen)}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <Ionicons name={feature.icon as any} size={24} color="#ffffff" />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureSubtitle, { color: colors.textSecondary }]}>{feature.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section paroisses les plus visitées */}
        <View style={[styles.activitySection, { backgroundColor: colors.background }]}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: colors.text }]}>Paroisses les plus visitées</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('parishes')}>
              <Text style={[styles.seeAllText, { color: colors.accent }]}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {mostVisitedParishes.map((parish, index) => (
              <TouchableOpacity key={index} style={[styles.activityItem, { backgroundColor: colors.card }]}>
                <View style={styles.activityIcon}>
                  <Ionicons name={parish.icon as any} size={20} color="#ffffff" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityText, { color: colors.text }]}>{parish.name}</Text>
                  <Text style={[styles.activityTime, { color: colors.textSecondary }]}>{parish.location}</Text>
                  <View style={styles.parishStats}>
                    <Text style={[styles.visitCount, { color: colors.textSecondary }]}>{parish.visits} visites</Text>
                    <Text style={[styles.lastVisit, { color: colors.textSecondary }]}>• {parish.lastVisit}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Modal de sélection des paroisses */}
        <Modal
          visible={showChurchModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sélectionner votre paroisse</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowChurchModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={parishes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.parishItem,
                    selectedParish?.id === item.id && styles.selectedParishItem
                  ]}
                  onPress={() => handleChurchSelection(item)}
                >
                  <View style={styles.parishItemContent}>
                    <View style={styles.parishItemIcon}>
                      <Ionicons name="business" size={24} color="#f59e0b" />
                    </View>
                    <View style={styles.parishItemInfo}>
                      <Text style={styles.parishItemName}>{item.name}</Text>
                      <Text style={styles.parishItemLocation}>{item.city}</Text>
                      <Text style={styles.parishItemDiocese}>{item.dioceseName}</Text>
                    </View>
                    {selectedParish?.id === item.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#f59e0b" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              style={styles.parishList}
            />
          </SafeAreaView>
        </Modal>
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
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 22, // Padding ultra-maximal
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  userName: {
    color: '#ffffff',
    fontSize: 11,
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8, // Espace entre les boutons
    marginRight: 0, // Supprimer la marge droite
    marginLeft: -50, // Marge négative maximale absolue
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  currentChurchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 0,
  },
  churchCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  churchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  churchInfo: {
    flex: 1,
  },
  churchText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  currentChurchName: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  editButton: {
    padding: 8,
    backgroundColor: 'transparent',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  featuresContainer: {
    padding: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  featureCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  activitySection: {
    padding: 20,
    paddingBottom: 40,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seeAllText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  activityList: {
    gap: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#64748b',
  },
  parishStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  visitCount: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  lastVisit: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  // Styles pour le modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  parishList: {
    flex: 1,
    padding: 20,
  },
  parishItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedParishItem: {
    borderColor: '#f59e0b',
    backgroundColor: '#fef3c7',
  },
  parishItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  parishItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  parishItemInfo: {
    flex: 1,
  },
  parishItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  parishItemLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  parishItemDiocese: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
