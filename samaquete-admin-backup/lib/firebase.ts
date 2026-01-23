import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuration Firebase basée sur votre projet "numerisen"
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAR8kwZE9ats8NmUVbIfTzxOZDzmiyToQQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "numerisen-14a03.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "numerisen-14a03",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "numerisen-14a03.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "764890122669",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:764890122669:web:6e07cde20ce346bb3b3924",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-7KNWL23FBB"
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)

// Initialiser les services Firebase
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app