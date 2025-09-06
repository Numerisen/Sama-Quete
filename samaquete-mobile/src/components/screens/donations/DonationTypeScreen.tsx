import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber, formatAmount } from '../../../../lib/numberFormat';
import { useTheme } from '../../../../lib/ThemeContext';

interface DonationTypeScreenProps {
  setCurrentScreen: (screen: string) => void;
  setSelectedAmount: (amount: string) => void;
  setSelectedDonationType: (type: string) => void;
  selectionContext: string;
}

export default function DonationTypeScreen({ setCurrentScreen, setSelectedAmount, selectionContext }: DonationTypeScreenProps) {
  const { colors } = useTheme();
  const [customAmount, setCustomAmount] = useState('122 222');
  const [selectedAmount, setSelectedAmountLocal] = useState('');

  const predefinedAmounts = [
    '2 000 FCFA',
    '5 000 FCFA',
    '10 000 FCFA',
    '15 000 FCFA'
  ];

  const handleAmountSelection = (amount: string) => {
    setSelectedAmountLocal(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (amount: string) => {
    // Formater le montant avec des espaces
    const formattedAmount = formatNumber(amount.replace(/\s/g, ''));
    setCustomAmount(formattedAmount);
    setSelectedAmountLocal('');
  };

  const handleContinue = () => {
    const finalAmount = selectedAmount || customAmount;
    setSelectedAmount(finalAmount);
    setCurrentScreen('auth');
  };

  const getParishName = () => {
    // En production, cela viendrait du contexte de sélection
    return 'Cathédrale du Souvenir Africain';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* En-tête orange avec gradient */}
      <LinearGradient colors={colors.header as any} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('donations')}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{selectionContext || 'Quête dominicale'}</Text>
          <View style={styles.parishInfo}>
            <Ionicons name="location" size={16} color="#ffffff" />
            <Text style={styles.parishName}>{getParishName()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Zone de sélection du montant */}
      <View style={[styles.amountSection, { backgroundColor: colors.background }]}>
        <Text style={[styles.amountTitle, { color: colors.text }]}>Choisissez le montant</Text>
        
        {/* Grille des montants prédéfinis */}
        <View style={styles.predefinedGrid}>
          {predefinedAmounts.map((amount, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.amountButton,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedAmount === amount && styles.selectedAmountButton
              ]}
              onPress={() => handleAmountSelection(amount)}
            >
              <Text style={[
                styles.amountButtonText,
                { color: colors.text },
                selectedAmount === amount && styles.selectedAmountButtonText
              ]}>
                {amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Champ montant personnalisé */}
        <View style={styles.customAmountContainer}>
          <TextInput
            style={[styles.customAmountInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={customAmount}
            onChangeText={handleCustomAmountChange}
            placeholder="Montant personnalisé"
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity style={styles.adjustButton}>
            <Ionicons name="chevron-up" size={16} color="#f59e0b" />
            <Ionicons name="chevron-down" size={16} color="#f59e0b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer orange avec bouton de paiement */}
      <LinearGradient colors={colors.header as any} style={styles.footer}>
        <Text style={styles.selectedAmountLabel}>Montant sélectionné</Text>
        <Text style={styles.selectedAmountValue}>
          {selectedAmount || customAmount}
        </Text>
        
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continuer vers le paiement</Text>
          <Ionicons name="chevron-forward" size={20} color="#d97706" />
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefce8',
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
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: -15,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  amountTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
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
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedAmountButton: {
    borderColor: '#f59e0b',
    backgroundColor: '#fef3c7',
  },
  amountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  selectedAmountButtonText: {
    color: '#d97706',
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#f59e0b',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '600',
  },
  adjustButton: {
    alignItems: 'center',
    padding: 5,
  },
  footer: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
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
    color: '#d97706',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});
