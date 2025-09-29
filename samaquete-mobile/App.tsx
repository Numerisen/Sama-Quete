import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './lib/ThemeContext';

// Import des écrans
import SplashScreenComponent from './src/components/screens/SplashScreen';
import DashboardScreen from './src/components/screens/DashboardScreen';
import ParishSelectionScreen from './src/components/screens/ParishSelectionScreen';
import DonationsScreen from './src/components/screens/donations/DonationsScreen';
import DonationTypeScreen from './src/components/screens/donations/DonationTypeScreen';
import DonationHistoryScreen from './src/components/screens/donations/DonationHistoryScreen';
import AuthScreen from './src/components/screens/AuthScreen';
import PaymentScreen from './src/components/screens/donations/PaymentScreen';
import LiturgyScreen from './src/components/screens/liturgy/LiturgyScreen';
import PrayerCalendarScreen from './src/components/screens/prayer/PrayerCalendarScreen';
import NewsScreen from './src/components/screens/news/NewsScreen';
import AssistantScreen from './src/components/screens/assistant/AssistantScreen';
import HistoryScreen from './src/components/screens/history/HistoryScreen';
import NotificationsScreen from './src/components/screens/notifications/NotificationsScreen';
import SettingsScreen from './src/components/screens/settings/SettingsScreen';

// Garder l'écran de démarrage visible pendant le chargement des ressources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [selectedParish, setSelectedParish] = useState('');
  const [selectedDonationType, setSelectedDonationType] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectionContext, setSelectionContext] = useState('');
  const [userProfile, setUserProfile] = useState({
    name: '',
    phone: '',
    totalDonations: 0,
    prayerDays: 12,
  });

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

  if (!loaded && !error) {
    return null;
  }

  const screenProps = {
    setCurrentScreen,
    selectedParish,
    setSelectedParish,
    selectedDonationType,
    setSelectedDonationType,
    selectedAmount,
    setSelectedAmount,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    userProfile,
    setUserProfile,
    isAuthenticated,
    setIsAuthenticated,
    selectionContext,
    setSelectionContext,
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreenComponent {...screenProps} />;
      case 'dashboard':
        return <DashboardScreen {...screenProps} />;
      case 'parish-selection':
        return <ParishSelectionScreen {...screenProps} />;
      case 'donations':
        return <DonationsScreen 
          setCurrentScreen={setCurrentScreen}
          selectedParish={selectedParish}
          setSelectedParish={setSelectedParish}
          setSelectionContext={setSelectionContext}
          setSelectedDonationType={setSelectedDonationType}
          setSelectedAmount={setSelectedAmount}
        />;
      case 'donation-type':
        return <DonationTypeScreen {...screenProps} />;
      case 'donation-history':
        return <DonationHistoryScreen {...screenProps} />;
      case 'auth':
        return <AuthScreen {...screenProps} />;
      case 'payment':
        return <PaymentScreen 
          setCurrentScreen={setCurrentScreen}
          selectedParish={selectedParish}
          selectedDonationType={selectedDonationType}
          selectedAmount={selectedAmount}
        />;
      case 'liturgy':
        return <LiturgyScreen {...screenProps} />;
      case 'prayer-calendar':
        return <PrayerCalendarScreen {...screenProps} />;
      case 'news':
        return <NewsScreen {...screenProps} />;
      case 'assistant':
        return <AssistantScreen {...screenProps} />;
      case 'history':
        return <HistoryScreen {...screenProps} />;
      case 'notifications':
        return <NotificationsScreen {...screenProps} />;
      case 'settings':
        return <SettingsScreen {...screenProps} />;
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
