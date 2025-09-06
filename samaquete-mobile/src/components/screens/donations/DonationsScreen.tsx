import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '../../../../lib/numberFormat';
import { useTheme } from '../../../../lib/ThemeContext';
// import { useParishes } from '../../../../hooks/useFirebaseData'; // Temporairement désactivé

interface DonationsScreenProps {
  setCurrentScreen: (screen: string) => void;
  selectedParish: string;
  setSelectionContext: (context: string) => void;
  setSelectedDonationType: (type: string) => void;
  setSelectedAmount: (amount: string) => void;
}

export default function DonationsScreen({ setCurrentScreen, selectedParish, setSelectionContext, setSelectedDonationType, setSelectedAmount }: DonationsScreenProps) {
  const { colors } = useTheme();
  // const { parishes, loading } = useParishes(); // Temporairement désactivé
  const [currentParish, setCurrentParish] = useState<any>(null);

  // Données statiques par défaut
  const parishes: any[] = [];
  const loading = false;

  // Trouver la paroisse sélectionnée dans les données Firebase (temporairement désactivé)
  // useEffect(() => {
  //   const parish = parishes.find(p => p.name === selectedParish);
  //   if (parish) {
  //     setCurrentParish(parish);
  //   }
  // }, [parishes, selectedParish]);

  // Tarifs par défaut si pas de données Firebase (avec formatage espaces)
  const defaultPricing = {
    quete: ["1 000", "2 500", "6 000", "10 000"],
    denier: ["7 000", "12 000", "20 000", "35 000"],
    cierge: ["600", "1 200", "2 000", "3 500"],
    messe: ["10 000", "18 000", "28 000", "40 000"],
  };

  const currentPricing = currentParish?.pricing || defaultPricing;

  const donationTypes = [
    {
      id: "quete",
      icon: "heart-outline",
      title: "Quête dominicale",
      description: "Soutien hebdomadaire à la paroisse",
      color: "#ef4444",
      prices: currentPricing.quete,
    },
    {
      id: "denier",
      icon: "add",
      title: "Denier du culte",
      description: "Contribution annuelle diocésaine",
      color: "#f59e0b",
      prices: currentPricing.denier,
    },
    {
      id: "cierge",
      icon: "flame",
      title: "Cierge Pascal",
      description: "Lumière pour vos intentions",
      color: "#f59e0b",
      prices: currentPricing.cierge,
    },
    {
      id: "messe",
      icon: "business",
      title: "Messe d'intention",
      description: "Messe célébrée pour vos proches",
      color: "#3b82f6",
      prices: currentPricing.messe,
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header rouge avec gradient */}
        <LinearGradient colors={colors.header as any} style={styles.header}>
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
                <Text style={styles.parishName}>{selectedParish}</Text>
              </View>
            </View>
          </View>

          {/* Bouton tarifs spéciaux */}
          <View style={styles.specialRatesButton}>
            <Text style={styles.specialRatesTitle}>Tarifs spéciaux</Text>
            <Text style={styles.specialRatesSubtitle}>Pour {selectedParish}</Text>
          </View>
        </LinearGradient>

        {/* Contenu principal avec les types de dons */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {donationTypes.map((type, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.donationCard, { backgroundColor: colors.card }]}
              onPress={() => handleDonationSelect(type)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: type.color }]}>
                  <Ionicons name={type.icon as any} size={24} color="#ffffff" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{type.title}</Text>
                  <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{type.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>

              <View style={styles.amountOptions}>
                {type.prices.slice(0, 3).map((price, amountIndex) => (
                  <TouchableOpacity
                    key={amountIndex}
                    style={[styles.amountButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => handleDonationSelect(type, price)}
                  >
                    <Text style={[styles.amountText, { color: colors.text }]}>{formatPrice(price)} FCFA</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.plusButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleDonationSelect(type)}
                >
                  <Text style={[styles.plusText, { color: colors.text }]}>+plus</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer pour changer d'église */}
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <View style={[styles.changeChurchCard, { backgroundColor: colors.card }]}>
            <View style={styles.changeChurchInfo}>
              <Text style={[styles.changeChurchTitle, { color: colors.text }]}>Changer d'église ?</Text>
              <Text style={[styles.changeChurchSubtitle, { color: colors.textSecondary }]}>Chaque église a ses propres tarifs</Text>
            </View>
            <TouchableOpacity
              style={[styles.changeButton, { backgroundColor: colors.primary }]}
              onPress={() => setCurrentScreen('parish-selection')}
            >
              <Text style={styles.changeButtonText}>Changer</Text>
            </TouchableOpacity>
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
  specialRatesButton: {
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
  },
  donationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    color: '#1e293b',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  amountOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amountButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  amountText: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  plusButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  plusText: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  changeChurchCard: {
    backgroundColor: '#ffffff',
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
  },
  changeChurchInfo: {
    flex: 1,
  },
  changeChurchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  changeChurchSubtitle: {
    fontSize: 14,
    color: '#64748b',
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
});