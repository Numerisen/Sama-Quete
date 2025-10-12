import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../../../../lib/numberFormat';
import { useTheme } from '../../../../lib/ThemeContext';
import { useParishes } from '../../../../hooks/useParishes';

interface PaymentScreenProps {
  setCurrentScreen: (screen: string) => void;
  selectedDonationType: string;
  selectedAmount: string;
}

export default function PaymentScreen({ setCurrentScreen, selectedDonationType, selectedAmount }: PaymentScreenProps) {
  const { colors } = useTheme();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('carte');
  
  // Utiliser le hook useParishes pour obtenir la paroisse sélectionnée
  const { selectedParish } = useParishes();

  const paymentMethods = [
    {
      id: 'carte',
      title: 'Carte bancaire',
      subtitle: 'Visa, Mastercard',
      icon: 'card-outline',
      selected: selectedPaymentMethod === 'carte',
      isImage: false
    },
    {
      id: 'wave',
      title: 'Wave',
      subtitle: 'Paiement mobile',
      image: require('../../../../assets/images/logos/wave.png'),
      selected: selectedPaymentMethod === 'wave',
      isImage: true
    },
    {
      id: 'orange',
      title: 'Orange Money',
      subtitle: 'Paiement mobile',
      image: require('../../../../assets/images/logos/orange.png'),
      selected: selectedPaymentMethod === 'orange',
      isImage: true
    }
  ];

  const handlePayment = () => {
    // Logique de paiement ici
    console.log('Paiement effectué:', {
      method: selectedPaymentMethod,
      parish: selectedParish?.name || 'Paroisse',
      type: selectedDonationType,
      amount: selectedAmount
    });
    
    // Retour au dashboard après paiement
    setCurrentScreen('dashboard');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header vert avec gradient */}
      <LinearGradient
        colors={['#22c55e', '#16a34a']}
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
            <Text style={styles.churchName}>{selectedParish?.name || 'Paroisse'}</Text>
          </View>
        </View>
      </LinearGradient>

      <LinearGradient colors={['#f0fdf4', '#ffffff', '#eff6ff']} style={styles.content}>
        {/* Récapitulatif */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Récapitulatif</Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Type de don</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedDonationType}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Église</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedParish?.name || 'Paroisse'}</Text>
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
                  {method.isImage ? (
                    <Image 
                      source={method.image} 
                      style={styles.paymentLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons 
                      name={method.icon as any} 
                      size={24} 
                      color={method.selected ? colors.primary : colors.textSecondary} 
                    />
                  )}
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
      </LinearGradient>

      {/* Footer de confirmation vert */}
      <LinearGradient
        colors={['#22c55e', '#16a34a']}
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
    backgroundColor: '#f0fdf4', // from-green-50
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // bg-white/90 backdrop-blur-sm
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb', // border-gray-200
  },
  paymentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // bg-white/90 backdrop-blur-sm
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb', // border-gray-200
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937', // text-gray-800
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
    color: '#4b5563', // text-gray-600
  },
  summaryValue: {
    fontSize: 14,
    color: '#1f2937', // text-gray-800
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 16,
    color: '#16a34a', // text-green-600
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
    borderColor: '#e5e7eb', // border-gray-200
  },
  selectedPaymentMethod: {
    backgroundColor: '#f0fdf4', // bg-green-50
    borderColor: '#22c55e', // border-green-500
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
    color: '#1f2937', // text-gray-800
    marginBottom: 2,
  },
  selectedPaymentTitle: {
    color: '#16a34a', // text-green-600
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#4b5563', // text-gray-600
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0fdf4', // bg-green-50
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
    color: '#16a34a', // text-green-600
    marginRight: 8,
  },
  securityText: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  paymentLogo: {
    width: 24,
    height: 24,
  },
});