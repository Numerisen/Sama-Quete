import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../../../lib/numberFormat';
import { useTheme } from '../../../lib/ThemeContext';

interface AuthScreenProps {
  setCurrentScreen: (screen: string) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setUserProfile: (profile: any) => void;
  userProfile: any;
  selectedAmount?: string;
}

export default function AuthScreen({ setCurrentScreen, selectedAmount }: AuthScreenProps) {
  const { colors } = useTheme();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pinCode, setPinCode] = useState('');

  const handleContinue = () => {
    if (fullName.trim() && phoneNumber.trim()) {
      setCurrentScreen('payment');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* En-tête avec icône et titre */}
          <View style={[styles.header, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentScreen('donation-type')}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="add" size={40} color="#ffffff" />
              </View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Authentification</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Confirmez vos informations pour finaliser</Text>
              <Text style={[styles.amountDisplay, { color: colors.primary }]}>{selectedAmount ? formatNumber(selectedAmount.replace(/[^\d]/g, '')) : '122 222'} FCFA</Text>
            </View>
          </View>

          {/* Formulaire principal */}
          <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.inputField, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="person" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="Nom complet"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={[styles.inputField, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="call" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="Numéro de téléphone"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={[styles.inputField, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="lock-closed" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="Code PIN (optionnel)"
                value={pinCode}
                onChangeText={setPinCode}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={[styles.continueButton, { backgroundColor: colors.primary }]} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continuer vers le paiement</Text>
              <Ionicons name="chevron-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Texte informatif */}
          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>Ces informations sécurisent votre transaction</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefce8',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 15,
    textAlign: 'center',
  },
  amountDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  continueButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
