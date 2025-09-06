import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Firebase - même projet que l'admin
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Remplacez par votre vraie clé API
  authDomain: "numerisen-14a03.firebaseapp.com",
  projectId: "numerisen-14a03",
  storageBucket: "numerisen-14a03.appspot.com",
  messagingSenderId: "123456789012", // Remplacez par votre vraie clé
  appId: "1:123456789012:web:xxxxxxxxxxxxxxxxxxxxx" // Remplacez par votre vraie clé
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services Firebase avec AsyncStorage pour la persistance
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);

export default app;
