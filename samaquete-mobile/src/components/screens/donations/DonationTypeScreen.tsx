import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface DonationTypeScreenProps {
  setCurrentScreen: (screen: string) => void;
  setSelectedAmount: (amount: string) => void;
  setSelectedDonationType: (type: string) => void;
  selectionContext: string;
  selectedParish: string;
}

export default function DonationTypeScreen({ setCurrentScreen, setSelectedAmount, selectionContext, selectedParish }: DonationTypeScreenProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmountLocal] = useState('');

  // Tarifs spécifiques par église et type de don
  const parishPricing = {
    "Cathédrale du Souvenir Africain": {
      quete: ["2,000", "5,000", "10,000", "15,000"],
      denier: ["10,000", "20,000", "30,000", "50,000"],
      cierge: ["1,000", "2,000", "3,000", "5,000"],
      messe: ["15,000", "25,000", "35,000", "50,000"],
    },
    "Paroisse Sainte-Anne": {
      quete: ["1,500", "3,000", "7,000", "12,000"],
      denier: ["8,000", "15,000", "25,000", "40,000"],
      cierge: ["800", "1,500", "2,500", "4,000"],
      messe: ["12,000", "20,000", "30,000", "45,000"],
    },
    "Paroisse Saint-Joseph": {
      quete: ["1,000", "2,500", "6,000", "10,000"],
      denier: ["7,000", "12,000", "20,000", "35,000"],
      cierge: ["600", "1,200", "2,000", "3,500"],
      messe: ["10,000", "18,000", "28,000", "40,000"],
    },
    "Paroisse Notre-Dame": {
      quete: ["1,200", "3,000", "6,500", "11,000"],
      denier: ["6,000", "13,000", "22,000", "38,000"],
      cierge: ["700", "1,300", "2,200", "3,800"],
      messe: ["11,000", "19,000", "29,000", "42,000"],
    },
  };

  const donationInfo = {
    quete: {
      title: "Quête dominicale",
      description: "Soutien hebdomadaire à la paroisse",
    },
    denier: {
      title: "Denier du culte",
      description: "Contribution annuelle diocésaine",
    },
    cierge: {
      title: "Cierge Pascal",
      description: "Lumière pour vos intentions",
    },
    messe: {
      title: "Messe d'intention",
      description: "Messe célébrée pour vos proches",
    },
  };

  // Déterminer le type de don à partir du contexte
  const getDonationType = () => {
    if (selectionContext.includes('Quête')) return 'quete';
    if (selectionContext.includes('Denier')) return 'denier';
    if (selectionContext.includes('Cierge')) return 'cierge';
    if (selectionContext.includes('Messe')) return 'messe';
    return 'quete'; // par défaut
  };

  const donationType = getDonationType();
  const currentPricing = parishPricing[selectedParish as keyof typeof parishPricing] || parishPricing["Cathédrale du Souvenir Africain"];
  const amounts = currentPricing[donationType as keyof typeof currentPricing] || [];
  const currentDonation = donationInfo[donationType as keyof typeof donationInfo];

  const handleAmountSelect = (amount: string) => {
    setSelectedAmountLocal(amount);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setSelectedAmountLocal('');
  };

  const finalAmount = customAmount || selectedAmount;

  const handleContinue = () => {
    if (finalAmount) {
      setSelectedAmount(finalAmount);
      setCurrentScreen('auth'); // Rediriger vers la page de connexion
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header ambre avec gradient */}
      <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('donations')}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{currentDonation?.title}</Text>
          <View style={styles.parishInfo}>
            <Ionicons name="location" size={16} color="#ffffff" />
            <Text style={styles.parishName}>{selectedParish}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Zone de sélection du montant avec gradient d'arrière-plan */}
      <LinearGradient colors={['#fffbeb', '#ffffff', '#eff6ff']} style={styles.amountSection}>
        <Text style={styles.amountTitle}>Choisissez le montant</Text>
        
        {/* Grille des montants prédéfinis 2x2 */}
        <View style={styles.predefinedGrid}>
          {amounts.map((amount, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.amountButton,
                selectedAmount === amount && styles.selectedAmountButton
              ]}
              onPress={() => handleAmountSelect(amount)}
            >
              <Text style={[
                styles.amountButtonText,
                selectedAmount === amount && styles.selectedAmountButtonText
              ]}>
                {amount} FCFA
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Champ montant personnalisé */}
        <View style={styles.customAmountContainer}>
          <TextInput
            style={[
              styles.customAmountInput,
              (customAmount && !selectedAmount) && styles.selectedCustomAmountInput
            ]}
            value={customAmount}
            onChangeText={handleCustomAmount}
            placeholder="Montant personnalisé (FCFA)"
            keyboardType="numeric"
            placeholderTextColor="#6b7280"
          />
          <TouchableOpacity style={styles.adjustButton}>
            <Ionicons name="chevron-up" size={16} color="#f59e0b" />
            <Ionicons name="chevron-down" size={16} color="#f59e0b" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Footer ambre avec montant sélectionné et bouton de continuation - SEULEMENT si un montant est sélectionné */}
      {finalAmount && (
        <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.footer}>
          <Text style={styles.selectedAmountLabel}>Montant sélectionné</Text>
          <Text style={styles.selectedAmountValue}>
            {finalAmount} FCFA
          </Text>
          
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continuer vers le paiement</Text>
            <Ionicons name="chevron-forward" size={20} color="#d97706" />
          </TouchableOpacity>
        </LinearGradient>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb', // from-amber-50
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
  parishInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parishName: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
  },
  amountSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // bg-white/90 backdrop-blur-sm
    margin: 20,
    marginTop: -15,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb', // border-gray-200
  },
  amountTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937', // text-gray-800
    marginBottom: 25,
    textAlign: 'center',
  },
  predefinedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  amountButton: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb', // border-gray-200
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedAmountButton: {
    backgroundColor: '#f59e0b', // bg-gradient-to-r from-amber-500 to-amber-600
    borderColor: '#f59e0b',
  },
  amountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937', // text-gray-800
  },
  selectedAmountButtonText: {
    color: '#ffffff',
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb', // border-gray-200
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  selectedCustomAmountInput: {
    borderWidth: 3,
    borderColor: '#f59e0b', // border-amber-500
  },
  customAmountInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937', // text-gray-800
    fontWeight: '500',
  },
  adjustButton: {
    alignItems: 'center',
    padding: 5,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  selectedAmountLabel: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  selectedAmountValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#d97706', // text-amber-600
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});