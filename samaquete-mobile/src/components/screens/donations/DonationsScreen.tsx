import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '../../../../lib/numberFormat';

interface DonationsScreenProps {
  setCurrentScreen: (screen: string) => void;
  selectedParish: string;
  setSelectionContext: (context: string) => void;
  setSelectedDonationType: (type: string) => void;
  setSelectedAmount: (amount: string) => void;
}

export default function DonationsScreen({ setCurrentScreen, selectedParish, setSelectionContext, setSelectedDonationType, setSelectedAmount }: DonationsScreenProps) {
  const [currentParish, setCurrentParish] = useState<any>(null);

  // Données statiques par défaut avec les montants exacts de l'image
  const defaultPricing = {
    quete: ["1,500", "3,000", "7,000"],
    denier: ["8,000", "15,000", "25,000"],
    cierge: ["800", "1,500", "2,500"],
    messe: ["12,000", "20,000", "30,000"],
  };

  const currentPricing = currentParish?.pricing || defaultPricing;

  const donationTypes = [
    {
      id: "quete",
      icon: "heart-outline",
      title: "Quête dominicale",
      description: "Soutien hebdomadaire à la paroisse",
      gradientColors: ["#f87171", "#ef4444"], // from-red-400 to-red-500
      prices: currentPricing.quete,
    },
    {
      id: "denier",
      icon: "add",
      title: "Denier du culte",
      description: "Contribution annuelle diocésaine",
      gradientColors: ["#fbbf24", "#f59e0b"], // from-amber-400 to-amber-500
      prices: currentPricing.denier,
    },
    {
      id: "cierge",
      icon: "flame",
      title: "Cierge Pascal",
      description: "Lumière pour vos intentions",
      gradientColors: ["#facc15", "#eab308"], // from-yellow-400 to-yellow-500
      prices: currentPricing.cierge,
    },
    {
      id: "messe",
      icon: "business",
      title: "Messe d'intention",
      description: "Messe célébrée pour vos proches",
      gradientColors: ["#60a5fa", "#3b82f6"], // from-blue-400 to-blue-500
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
                <Text style={styles.parishName}>{selectedParish}</Text>
              </View>
            </View>
          </View>

          {/* Carte tarifs spéciaux intégrée dans le header */}
          <View style={styles.specialRatesCard}>
            <Text style={styles.specialRatesTitle}>Tarifs spéciaux</Text>
            <Text style={styles.specialRatesSubtitle}>Pour {selectedParish}</Text>
          </View>
        </LinearGradient>

        {/* Contenu principal avec gradient d'arrière-plan */}
        <LinearGradient colors={['#fef2f2', '#ffffff', '#fffbeb']} style={styles.content}>
          {donationTypes.map((type, index) => (
            <TouchableOpacity
              key={index}
              style={styles.donationCard}
              onPress={() => handleDonationSelect(type)}
            >
              <View style={styles.cardHeader}>
                <LinearGradient colors={type.gradientColors} style={styles.cardIcon}>
                  <Ionicons name={type.icon as any} size={24} color="#ffffff" />
                </LinearGradient>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{type.title}</Text>
                  <Text style={styles.cardDescription}>{type.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#4b5563" />
              </View>

              <View style={styles.amountOptions}>
                {type.prices.map((price, amountIndex) => (
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
        </LinearGradient>

        {/* Footer pour changer d'église */}
        <View style={styles.footer}>
          <View style={styles.changeChurchCard}>
            <View style={styles.changeChurchInfo}>
              <Text style={styles.changeChurchTitle}>Changer d'église ?</Text>
              <Text style={styles.changeChurchSubtitle}>Chaque église a ses propres tarifs</Text>
            </View>
            <TouchableOpacity
              style={styles.changeButton}
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
});