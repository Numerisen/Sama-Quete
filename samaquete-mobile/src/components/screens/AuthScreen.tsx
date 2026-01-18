import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../../../lib/numberFormat';
import { useTheme } from '../../../lib/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { Country, countries } from '../../../lib/countries';
import CountryPicker from '../ui/CountryPicker';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthScreenProps {
  setCurrentScreen: (screen: string) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setUserProfile: (profile: any) => void;
  userProfile: any;
  selectedAmount?: string;
  initialMode?: 'signin' | 'signup';
}

export default function AuthScreen({ setCurrentScreen, setIsAuthenticated, setUserProfile, selectedAmount, initialMode = 'signin' }: AuthScreenProps) {
  const { colors } = useTheme();
  const { signUp, signIn, loading: authLoading } = useAuth();
  
  // État pour basculer entre connexion et inscription
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [loading, setLoading] = useState(false);
  
  React.useEffect(() => {
    setIsSignUp(initialMode === 'signup');
  }, [initialMode]);
  
  // États pour l'inscription
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: null as Country | null,
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  // États pour la connexion
  const [signInData, setSignInData] = useState({
    identifier: '',
    password: ''
  });

  const handleSignUp = async () => {
    if (!validateSignUp()) return;
    
    setLoading(true);
    try {
      const result = await signUp({
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        email: signUpData.email,
        phone: `${signUpData.country?.phoneCode}${signUpData.phone}`,
        country: signUpData.country?.code || 'SN',
        username: signUpData.username,
        password: signUpData.password
      });

      if (result.success) {
        setUserProfile(result.user);
        setIsAuthenticated(true);
        Alert.alert('Succès', 'Compte créé avec succès !', [
          { text: 'Continuer', onPress: () => setCurrentScreen('settings') }
        ]);
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!validateSignIn()) return;
    
    setLoading(true);
    try {
      const result = await signIn(signInData.identifier, signInData.password);
      
      if (result.success) {
        setUserProfile(result.user);
        setIsAuthenticated(true);
        Alert.alert('Succès', 'Connexion réussie !', [
          { text: 'Continuer', onPress: () => setCurrentScreen('settings') }
        ]);
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de la connexion');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const validateSignUp = () => {
    if (!signUpData.firstName.trim()) {
      Alert.alert('Erreur', 'Le prénom est requis');
      return false;
    }
    if (!signUpData.lastName.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return false;
    }
    if (!signUpData.email.trim() || !signUpData.email.includes('@')) {
      Alert.alert('Erreur', 'Une adresse email valide est requise');
      return false;
    }
    if (!signUpData.phone.trim()) {
      Alert.alert('Erreur', 'Le numéro de téléphone est requis');
      return false;
    }
    if (!signUpData.country) {
      Alert.alert('Erreur', 'Le pays est requis');
      return false;
    }
    if (!signUpData.username.trim()) {
      Alert.alert('Erreur', 'Le nom d\'utilisateur est requis');
      return false;
    }
    if (signUpData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const validateSignIn = () => {
    if (!signInData.identifier.trim()) {
      Alert.alert('Erreur', 'L\'identifiant est requis');
      return false;
    }
    if (!signInData.password.trim()) {
      Alert.alert('Erreur', 'Le mot de passe est requis');
      return false;
    }
    return true;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* En-tête */}
          <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentScreen('donation-type')}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-add" size={40} color="#ffffff" />
              </View>
              <Text style={styles.headerTitle}>
                {isSignUp ? 'Créer un compte' : 'Se connecter'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isSignUp ? 'Rejoignez la communauté SamaQuête' : 'Accédez à votre compte'}
              </Text>
              {selectedAmount && (
                <Text style={styles.amountDisplay}>
                  {formatNumber(selectedAmount.replace(/[^\d]/g, ''))} FCFA
                </Text>
              )}
            </View>
          </LinearGradient>

          {/* Toggle Connexion/Inscription */}
          <View style={[styles.toggleContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.toggleButton, !isSignUp && styles.activeToggleButton]}
              onPress={() => setIsSignUp(false)}
            >
              <Text style={[styles.toggleText, !isSignUp && styles.activeToggleText]}>
                Connexion
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, isSignUp && styles.activeToggleButton]}
              onPress={() => setIsSignUp(true)}
            >
              <Text style={[styles.toggleText, isSignUp && styles.activeToggleText]}>
                Inscription
              </Text>
            </TouchableOpacity>
          </View>

          {/* Formulaire */}
          <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
            {isSignUp ? (
              // Formulaire d'inscription
              <>
                <View style={styles.inputRow}>
                  <View style={[styles.inputField, styles.halfInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="person" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="Prénom"
                      value={signUpData.firstName}
                      onChangeText={(text) => setSignUpData({...signUpData, firstName: text})}
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                  <View style={[styles.inputField, styles.halfInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="person" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="Nom"
                      value={signUpData.lastName}
                      onChangeText={(text) => setSignUpData({...signUpData, lastName: text})}
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={[styles.inputField, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="mail" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Adresse email"
                    value={signUpData.email}
                    onChangeText={(text) => setSignUpData({...signUpData, email: text})}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <CountryPicker
                  selectedCountry={signUpData.country}
                  onCountrySelect={(country) => setSignUpData({...signUpData, country})}
                />

                <View style={[styles.inputField, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="call" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <Text style={[styles.phonePrefix, { color: colors.textSecondary }]}>
                    {signUpData.country?.phoneCode || '+221'}
                  </Text>
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Numéro de téléphone"
                    value={signUpData.phone}
                    onChangeText={(text) => setSignUpData({...signUpData, phone: text})}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={[styles.inputField, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="at" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Nom d'utilisateur"
                    value={signUpData.username}
                    onChangeText={(text) => setSignUpData({...signUpData, username: text})}
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                  />
                </View>

                <View style={[styles.inputField, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="lock-closed" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Mot de passe (min. 6 caractères)"
                    value={signUpData.password}
                    onChangeText={(text) => setSignUpData({...signUpData, password: text})}
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry
                  />
                </View>

                <View style={[styles.inputField, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="lock-closed" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Confirmer le mot de passe"
                    value={signUpData.confirmPassword}
                    onChangeText={(text) => setSignUpData({...signUpData, confirmPassword: text})}
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, { backgroundColor: colors.primary }]} 
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Créer mon compte</Text>
                      <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              // Formulaire de connexion
              <>
                <View style={[styles.inputField, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="person" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Email, nom d'utilisateur ou téléphone"
                    value={signInData.identifier}
                    onChangeText={(text) => setSignInData({...signInData, identifier: text})}
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                  />
                </View>

                <View style={[styles.inputField, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="lock-closed" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Mot de passe"
                    value={signInData.password}
                    onChangeText={(text) => setSignInData({...signInData, password: text})}
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, { backgroundColor: colors.primary }]} 
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Se connecter</Text>
                      <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.guestButton, { borderColor: colors.primary }]} 
                  onPress={() => setCurrentScreen('donation-type')}
                >
                  <Text style={[styles.guestButtonText, { color: colors.primary }]}>
                    Continuer en tant qu'invité
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Texte informatif */}
          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {isSignUp 
                ? 'En créant un compte, vous acceptez nos conditions d\'utilisation'
                : 'Vos informations sont sécurisées et protégées'
              }
            </Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
    textAlign: 'center',
  },
  amountDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 20,
    borderRadius: 12,
    padding: 4,
    backgroundColor: '#f1f5f9',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: '#f59e0b',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  activeToggleText: {
    color: '#ffffff',
  },
  formContainer: {
    margin: 20,
    borderRadius: 20,
    padding: 25,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  halfInput: {
    width: '48%',
  },
  inputIcon: {
    marginRight: 15,
  },
  phonePrefix: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: '500',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  submitButton: {
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
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    alignItems: 'center',
    marginTop: 15,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
