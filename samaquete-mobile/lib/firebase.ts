import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase via variables d'environnement Expo
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Vérification minimale pour éviter un démarrage silencieux sans config
if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
  console.warn('[Firebase] Configuration manquante : vérifiez vos variables EXPO_PUBLIC_*');
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services Firebase
let auth: Auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getReactNativePersistence } = require('firebase/auth');
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // En cas de rechargement à chaud ou d'initialisation multiple,
    // on récupère l'instance existante.
    auth = getAuth(app);
  }
}

export { auth };
export const db = getFirestore(app);

export default app;
