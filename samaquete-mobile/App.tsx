import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { ThemeProvider } from './lib/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { paymentService } from './lib/payment-service';

// Import des écrans
import SplashScreenComponent from './src/components/screens/SplashScreen';
import DashboardScreen from './src/components/screens/DashboardScreen';
import ParishSelectionScreen from './src/components/screens/ParishSelectionScreen';
import DonationsScreen from './src/components/screens/donations/DonationsScreen';
import DonationTypeScreen from './src/components/screens/donations/DonationTypeScreen';
import DonationHistoryScreen from './src/components/screens/donations/DonationHistoryScreen';
import AuthScreen from './src/components/screens/AuthScreen';
import LiturgyScreen from './src/components/screens/liturgy/LiturgyScreen';
import PrayerCalendarScreen from './src/components/screens/prayer/PrayerCalendarScreen';
import NewsScreen from './src/components/screens/news/NewsScreen';
import AssistantScreenEnhanced from './src/components/screens/assistant/AssistantScreenEnhanced';
import HistoryScreen from './src/components/screens/history/HistoryScreen';
import NotificationsScreen from './src/components/screens/notifications/NotificationsScreen';
import SettingsScreen from './src/components/screens/settings/SettingsScreen';

// Garder l'écran de démarrage visible pendant le chargement des ressources
SplashScreen.preventAutoHideAsync();

// Recommandé par expo-web-browser quand on utilise openAuthSessionAsync
WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [selectedDonationType, setSelectedDonationType] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectionContext, setSelectionContext] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Utiliser le hook useAuth pour gérer l'authentification
  const { user, profile, signOut, updateProfile } = useAuth();
  const isAuthenticated = !!user && !!profile;
  
  // Profil utilisateur basé sur les données Firebase
  const baseUserProfile = profile ? {
    name: `${profile.firstName} ${profile.lastName}`,
    phone: profile.phone,
    totalDonations: profile.totalDonations || 0,
    prayerDays: 12, // Valeur par défaut
    email: profile.email,
    username: profile.username,
    country: profile.country
  } : {
    name: '',
    phone: '',
    totalDonations: 0,
    prayerDays: 12,
    email: '',
    username: '',
    country: ''
  };

  const [userProfile, setUserProfile] = useState(baseUserProfile);

  useEffect(() => {
    setUserProfile(baseUserProfile);
  }, [profile]);

  const [loaded, error] = useFonts({
    // Ajouter des polices personnalisées ici si nécessaire
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => setCurrentScreen('dashboard'), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Gérer les deep links pour le retour de paiement
  useEffect(() => {
    // Écouter les deep links au démarrage de l'app
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl && initialUrl.includes('payment/return')) {
        handlePaymentReturn(initialUrl);
      }
    };

    // Écouter les deep links pendant l'exécution de l'app
    const subscription = Linking.addEventListener('url', (event) => {
      if (event.url && event.url.includes('payment/return')) {
        handlePaymentReturn(event.url);
      }
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Gérer le retour de paiement depuis PayDunya
   */
  const handlePaymentReturn = async (url: string) => {
    try {
      const status = await paymentService.handlePaymentReturn(url);
      
      if (status) {
        if (status.status === 'COMPLETED') {
          Alert.alert(
            '✅ Paiement réussi',
            `Votre don de ${status.amount ? `${status.amount} ${status.currency || 'XOF'}` : ''} a été confirmé avec succès.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  setCurrentScreen('donation-history');
                }
              }
            ]
          );
        } else if (status.status === 'PENDING') {
          Alert.alert(
            '⏳ Paiement en cours',
            'Votre paiement est en cours de traitement. Vous recevrez une notification une fois confirmé.',
            [{ text: 'OK', onPress: () => setCurrentScreen('donation-history') }]
          );
        } else {
          Alert.alert(
            '❌ Paiement échoué',
            'Le paiement n\'a pas pu être confirmé. Veuillez réessayer.',
            [{ text: 'OK', onPress: () => setCurrentScreen('donation-history') }]
          );
        }
      } else {
        // Si pas de statut (token manquant), rediriger quand même vers l'historique
        // L'utilisateur pourra voir son paiement récent
        Alert.alert(
          '✅ Retour de paiement',
          'Votre paiement a été effectué. Consultez l\'historique pour voir les détails.',
          [{ text: 'OK', onPress: () => setCurrentScreen('donation-history') }]
        );
      }
    } catch (error: any) {
      console.error('Erreur lors du traitement du retour de paiement:', error);
      // Même en cas d'erreur, rediriger vers l'historique
      Alert.alert(
        'Retour de paiement',
        'Votre paiement a été effectué. Consultez l\'historique pour voir les détails.',
        [{ text: 'OK', onPress: () => setCurrentScreen('donation-history') }]
      );
    }
  };

  // L'authentification est maintenant gérée par les écrans individuels

  if (!loaded && !error) {
    return null;
  }

  const handleSetUserProfile = (updatedProfile: any) => {
    setUserProfile(updatedProfile);
  };

  const handleSetIsAuthenticated = async (auth: boolean) => {
    if (!auth) {
      try {
        await signOut();
      } catch (error) {
        console.warn('Erreur lors de la déconnexion:', error);
      } finally {
        setCurrentScreen('auth');
      }
    }
  };

  const screenProps = {
    setCurrentScreen,
    selectedDonationType,
    setSelectedDonationType,
    selectedAmount,
    setSelectedAmount,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    userProfile,
    setUserProfile: handleSetUserProfile,
    isAuthenticated,
    selectionContext,
    setSelectionContext,
    setIsAuthenticated: handleSetIsAuthenticated,
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreenComponent {...screenProps} />;
      case 'dashboard':
        return <DashboardScreen {...screenProps} />;
      case 'parish-selection':
        return <ParishSelectionScreen setCurrentScreen={setCurrentScreen} />;
      case 'donations':
        return <DonationsScreen 
          setCurrentScreen={setCurrentScreen}
          setSelectionContext={setSelectionContext}
          setSelectedDonationType={setSelectedDonationType}
          setSelectedAmount={setSelectedAmount}
        />;
      case 'donation-type':
        return <DonationTypeScreen 
          setCurrentScreen={setCurrentScreen}
          setSelectedAmount={setSelectedAmount}
          setSelectedDonationType={setSelectedDonationType}
          selectionContext={selectionContext}
        />;
      case 'donation-history':
        return <DonationHistoryScreen {...screenProps} />;
      case 'auth':
        return <AuthScreen {...screenProps} initialMode={authMode} />;
      case 'liturgy':
        return <LiturgyScreen {...screenProps} />;
      case 'prayer-calendar':
        return <PrayerCalendarScreen {...screenProps} />;
      case 'news':
        return <NewsScreen {...screenProps} />;
      case 'assistant':
        return <AssistantScreenEnhanced setCurrentScreen={setCurrentScreen} />;
      case 'history':
        return <HistoryScreen {...screenProps} />;
      case 'notifications':
        return <NotificationsScreen {...screenProps} />;
      case 'settings':
        return (
          <SettingsScreen
            setCurrentScreen={setCurrentScreen}
            setIsAuthenticated={handleSetIsAuthenticated}
            isAuthenticated={isAuthenticated}
            user={user}
            profile={profile}
            updateProfile={updateProfile}
            setAuthMode={setAuthMode}
          />
        );
      default:
        return <DashboardScreen {...screenProps} />;
    }
  };

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.appContainer}>
          {renderScreen()}
        </View>
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
