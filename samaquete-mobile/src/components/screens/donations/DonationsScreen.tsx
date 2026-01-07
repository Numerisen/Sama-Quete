import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '../../../../lib/numberFormat';
import { useParishes } from '../../../../hooks/useParishes';
import { useDonationTypesRealtime } from '../../../../hooks/useDonationTypes';
import { ChurchStorageService } from '../../../../lib/church-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DonationsScreenProps {
  setCurrentScreen: (screen: string) => void;
  setSelectionContext: (context: string) => void;
  setSelectedDonationType: (type: string) => void;
  setSelectedAmount: (amount: string) => void;
}

interface DonationTypeDisplay {
  id: string;
  icon: string;
  title: string;
  description: string;
  gradientColors: [string, string];
  prices: string[];
}

export default function DonationsScreen({ setCurrentScreen, setSelectionContext, setSelectedDonationType, setSelectedAmount }: DonationsScreenProps) {
  const [showParishModal, setShowParishModal] = useState(false);
  const { parishes, loading: parishesLoading, error, selectedParish, setSelectedParish } = useParishes();
  const [parishId, setParishId] = useState<string>('');
  const [displayTypes, setDisplayTypes] = useState<DonationTypeDisplay[]>([]);

  // Utiliser le hook pour charger les types de dons en temps réel
  const { donationTypes, loading: loadingTypes, error: typesError } = useDonationTypesRealtime(parishId);

  // Charger le parishId depuis le stockage
  useEffect(() => {
    const loadParishId = async () => {
      try {
        const parish = await ChurchStorageService.getSelectedChurch();
        if (parish && parish.id) {
          setParishId(parish.id);
          console.log('💰 ParishId chargé pour types de dons:', parish.id);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement du parishId:', error);
      }
    };
    loadParishId();
  }, []);

  // Convertir les types de dons Firestore en format affichage
  useEffect(() => {
    if (donationTypes.length > 0) {
      const formattedTypes = donationTypes.map((type: any) => ({
        id: type.id,
        icon: getIconForType(type.icon || 'heart'),
        title: type.name,
        description: type.description || "",
        gradientColors: getGradientForType(type.icon || 'heart'),
        prices: type.defaultAmounts.map((amount: number) => formatPrice(amount)),
      }));
      setDisplayTypes(formattedTypes);
      console.log('✅ Types de dons formatés:', formattedTypes.length);
    } else if (!loadingTypes) {
      // Si aucun type n'est chargé et qu'on ne charge plus, utiliser les types par défaut
      setDisplayTypes(getDefaultDonationTypes());
    }
  }, [donationTypes, loadingTypes]);

  // Fonction pour mapper les icônes
  const getIconForType = (iconName: string): string => {
    const iconMap: { [key: string]: string } = {
      'heart': 'heart-outline',
      'gift': 'gift-outline',
      'church': 'business-outline',
      'users': 'people-outline',
      'flame': 'flame-outline',
    };
    return iconMap[iconName] || 'heart-outline';
  };

  // Fonction pour mapper les gradients
  const getGradientForType = (iconName: string): [string, string] => {
    const gradientMap: { [key: string]: [string, string] } = {
      'heart': ['#f87171', '#ef4444'],
      'gift': ['#fbbf24', '#f59e0b'],
      'church': ['#8b5cf6', '#7c3aed'],
      'users': ['#10b981', '#059669'],
      'flame': ['#f97316', '#ea580c'],
    };
    return gradientMap[iconName] || ['#f87171', '#ef4444'];
  };

  // Types de dons par défaut (fallback)
  const getDefaultDonationTypes = (): DonationTypeDisplay[] => [
    {
      id: "quete",
      icon: "heart-outline",
      title: "Quête dominicale",
      description: "Soutien hebdomadaire à la paroisse",
      gradientColors: ["#f87171", "#ef4444"] as [string, string],
      prices: ["1,500", "3,000", "7,000", "10,000"],
    },
    {
      id: "denier",
      icon: "add",
      title: "Denier du culte",
      description: "Contribution annuelle diocésaine",
      gradientColors: ["#fbbf24", "#f59e0b"] as [string, string],
      prices: ["8,000", "15,000", "25,000", "50,000"],
    },
    {
      id: "cierge",
      icon: "flame",
      title: "Cierge Pascal",
      description: "Lumière pour vos intentions",
      gradientColors: ["#facc15", "#eab308"] as [string, string],
      prices: ["800", "1,500", "2,500", "5,000"],
    },
    {
      id: "messe",
      icon: "business",
      title: "Messe d'intention",
      description: "Messe célébrée pour vos proches",
      gradientColors: ["#60a5fa", "#3b82f6"] as [string, string],
      prices: ["12,000", "20,000", "30,000", "50,000"],
    },
  ];

  const handleDonationSelect = (donationType: any, selectedAmount?: string) => {
    if (selectedAmount) {
      // Aller directement à l'écran de paiement avec le montant sélectionné
      setSelectedDonationType(donationType.title);
      setSelectedAmount(selectedAmount);
      setCurrentScreen("payment");
    } else {
      setSelectionContext(donationType.title);
      setCurrentScreen("donation-type");
    }
  };

  const loading = parishesLoading || loadingTypes;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header rouge avec gradient */}
        <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentScreen('dashboard')}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Faire un don</Text>
              <View style={styles.parishInfo}>
                <Ionicons name="location" size={16} color="#ffffff" />
                <Text style={styles.parishName}>{selectedParish?.name || 'Sélectionner une église'}</Text>
              </View>
            </View>
          </View>

          {/* Carte tarifs spéciaux intégrée dans le header */}
          <View style={styles.specialRatesCard}>
            <Text style={styles.specialRatesTitle}>Tarifs spéciaux</Text>
            <Text style={styles.specialRatesSubtitle}>Pour {selectedParish?.name || 'votre église'}</Text>
          </View>
        </LinearGradient>

        {/* Contenu principal avec gradient d'arrière-plan */}
        <View style={styles.content}>
          {loadingTypes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingText}>Chargement des types de dons...</Text>
            </View>
          ) : displayTypes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cash-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>Aucun type de don configuré pour cette paroisse</Text>
            </View>
          ) : displayTypes.map((type, index) => (
            <TouchableOpacity
              key={index}
              style={styles.donationCard}
              onPress={() => handleDonationSelect(type)}
            >
              <View style={styles.cardHeader}>
                <LinearGradient colors={type.gradientColors as any} style={styles.cardIcon}>
                  <Ionicons name={type.icon as any} size={24} color="#ffffff" />
                </LinearGradient>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{type.title}</Text>
                  <Text style={styles.cardDescription}>{type.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#4b5563" />
              </View>

              <View style={styles.amountOptions}>
                {type.prices.map((price: string, amountIndex: number) => (
                  <TouchableOpacity
                    key={amountIndex}
                    style={styles.amountButton}
                    onPress={() => handleDonationSelect(type, price)}
                  >
                    <Text style={styles.amountText}>{price} FCFA</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.plusButton}
                  onPress={() => handleDonationSelect(type)}
                >
                  <Text style={styles.plusText}>+plus</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        
      </ScrollView>

      {/* Modal de sélection des paroisses depuis Firebase */}
      <Modal
        visible={showParishModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowParishModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>Sélectionner une paroisse</Text>
            <TouchableOpacity onPress={() => setShowParishModal(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8, color: '#6b7280' }}>Chargement des paroisses…</Text>
            </View>
          )}

          {error && !loading && (
            <View style={{ padding: 16 }}>
              <Text style={{ color: '#dc2626' }}>Erreur: {error}</Text>
            </View>
          )}

          {!loading && !error && (
            <FlatList
              contentContainerStyle={styles.parishList}
              data={parishes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.parishCard]}
                  onPress={() => {
                    setSelectedParish(item);
                    setShowParishModal(false);
                  }}
                >
                  <View style={styles.parishItemContent}>
                    <View style={styles.parishItemIcon}>
                      <Ionicons name="business" size={24} color="#92400E" />
                    </View>
                    <View style={styles.parishItemInfo}>
                      <Text style={styles.parishItemName}>{item.name}</Text>
                      <View style={styles.locationContainer}>
                        <Ionicons name="location" size={14} color="#6b7280" />
                        <Text style={styles.parishItemLocation}>{item.city || item.location}</Text>
                      </View>
                      {!!item.dioceseName && (
                        <Text style={styles.parishItemDiocese}>Diocèse: {item.dioceseName}</Text>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {selectedParish?.id === item.id && (
                        <Ionicons name="checkmark-circle" size={22} color="#f59e0b" />
                      )}
                      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef2f2', // from-red-50
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  parishInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parishName: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
  },
  specialRatesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  specialRatesTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specialRatesSubtitle: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
  },
  content: {
    padding: 20,
    gap: 12,
    flex: 1,
  },
  donationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // bg-white/90 backdrop-blur-sm
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb', // border-gray-200
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937', // text-gray-800
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#4b5563', // text-gray-600
  },
  amountOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amountButton: {
    backgroundColor: '#f3f4f6', // bg-gray-100
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  amountText: {
    fontSize: 12,
    color: '#374151', // text-gray-700
    fontWeight: '500',
  },
  plusButton: {
    backgroundColor: '#fef3c7', // bg-amber-100
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  plusText: {
    fontSize: 12,
    color: '#b45309', // text-amber-700
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  changeChurchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // bg-white/90 backdrop-blur-sm
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb', // border-gray-200
  },
  changeChurchInfo: {
    flex: 1,
  },
  changeChurchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937', // text-gray-800
    marginBottom: 4,
  },
  changeChurchSubtitle: {
    fontSize: 14,
    color: '#4b5563', // text-gray-600
  },
  changeButton: {
    backgroundColor: '#6b7280',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  changeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Styles pour la liste de paroisses (alignés avec ParishSelectionScreen)
  parishList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  parishCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  parishItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parishItemIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#fcd34d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  parishItemInfo: {
    flex: 1,
  },
  parishItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  parishItemLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  parishItemDiocese: {
    fontSize: 12,
    color: '#6b7280',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});