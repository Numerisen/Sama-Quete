import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../../../../lib/numberFormat';
import { useTheme } from '../../../../lib/ThemeContext';

interface PaymentScreenProps {
  setCurrentScreen: (screen: string) => void;
  selectedParish: string;
  selectedDonationType: string;
  selectedAmount: string;
}

export default function PaymentScreen({ setCurrentScreen, selectedParish, selectedDonationType, selectedAmount }: PaymentScreenProps) {
  const { colors } = useTheme();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('carte');

  const paymentMethods = [
    {
      id: 'carte',
      title: 'Carte bancaire',
      subtitle: 'Visa, Mastercard',
      icon: 'card-outline',
      selected: selectedPaymentMethod === 'carte'
    },
    {
      id: 'wave',
      title: 'Wave',
      subtitle: 'Paiement mobile',
      icon: 'phone-portrait-outline',
      selected: selectedPaymentMethod === 'wave'
    },
    {
      id: 'orange',
      title: 'Orange Money',
      subtitle: 'Paiement mobile',
      icon: 'phone-portrait-outline',
      selected: selectedPaymentMethod === 'orange'
    }
  ];

  const handlePayment = () => {
    // Logique de paiement ici
    console.log('Paiement effectué:', {
      method: selectedPaymentMethod,
      parish: selectedParish,
      type: selectedDonationType,
      amount: selectedAmount
    });
    
    // Retour au dashboard après paiement
    setCurrentScreen('dashboard');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={colors.header as any}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentScreen('donations')}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Finaliser le don</Text>
          <View style={styles.churchInfo}>
            <Ionicons name="location-outline" size={16} color="white" />
            <Text style={styles.churchName}>{selectedParish}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Récapitulatif */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Récapitulatif</Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Type de don</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedDonationType}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Église</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedParish}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Montant</Text>
            <Text style={[styles.amountValue, { color: colors.primary }]}>{formatNumber(selectedAmount.replace(/[^\d]/g, ''))} FCFA</Text>
          </View>
        </View>

        {/* Moyen de paiement */}
        <View style={[styles.paymentCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Moyen de paiement</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                { backgroundColor: colors.surface, borderColor: colors.border },
                method.selected && styles.selectedPaymentMethod
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodLeft}>
                <View style={styles.paymentIcon}>
                  <Ionicons 
                    name={method.icon as any} 
                    size={24} 
                    color={method.selected ? colors.primary : colors.textSecondary} 
                  />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={[
                    styles.paymentTitle,
                    { color: colors.text },
                    method.selected && styles.selectedPaymentTitle
                  ]}>
                    {method.title}
                  </Text>
                  <Text style={[styles.paymentSubtitle, { color: colors.textSecondary }]}>{method.subtitle}</Text>
                </View>
              </View>
              
              {method.selected && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer de confirmation */}
      <LinearGradient
        colors={colors.header as any}
        style={styles.footer}
      >
        <Text style={styles.confirmTitle}>Confirmer le don</Text>
        
        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Text style={styles.payButtonText}>Payer {formatNumber(selectedAmount.replace(/[^\d]/g, ''))} FCFA</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.securityText}>
          Paiement sécurisé • Votre don sera traité immédiatement
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  churchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  churchName: {
    fontSize: 14,
    color: 'white',
    marginLeft: 6,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 16,
    color: '#22C55E',
    fontWeight: '600',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedPaymentMethod: {
    backgroundColor: '#F0FDF4',
    borderColor: '#22C55E',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  selectedPaymentTitle: {
    color: '#22C55E',
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  payButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22C55E',
    marginRight: 8,
  },
  securityText: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
});