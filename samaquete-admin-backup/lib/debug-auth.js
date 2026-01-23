// Script de diagnostic pour l'authentification
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAR8kwZE9ats8NmUVbIfTzxOZDzmiyToQQ",
  authDomain: "numerisen-14a03.firebaseapp.com",
  projectId: "numerisen-14a03",
  storageBucket: "numerisen-14a03.firebasestorage.app",
  messagingSenderId: "764890122669",
  appId: "1:764890122669:web:6e07cde20ce346bb3b3924",
  measurementId: "G-7KNWL23FBB"
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function debugAuth() {
  console.log('🔍 Diagnostic de l\'authentification...')
  
  try {
    // Test 1: Authentification
    console.log('\n1️⃣ Test d\'authentification avec admin@admin.com...')
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@admin.com', 'admin123')
    console.log('✅ Authentification réussie !')
    console.log('   UID:', userCredential.user.uid)
    console.log('   Email:', userCredential.user.email)
    
    // Test 2: Récupération du profil Firestore
    console.log('\n2️⃣ Test de récupération du profil Firestore...')
    const userRef = doc(db, 'users', userCredential.user.uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const userData = userSnap.data()
      console.log('✅ Profil Firestore trouvé !')
      console.log('   Email:', userData.email)
      console.log('   Rôle:', userData.role)
      console.log('   Display Name:', userData.displayName)
      console.log('   Permissions:', userData.permissions)
      console.log('   Actif:', userData.isActive)
    } else {
      console.log('❌ Profil Firestore non trouvé !')
      console.log('   UID recherché:', userCredential.user.uid)
    }
    
    // Test 3: Vérifier les autres profils
    console.log('\n3️⃣ Vérification des autres profils...')
    const adminRef = doc(db, 'users', 'IhVf2ekzGNPX5LWzaaTGHQHzMTk1')
    const adminSnap = await getDoc(adminRef)
    
    if (adminSnap.exists()) {
      console.log('✅ Profil admin trouvé avec UID fixe')
    } else {
      console.log('❌ Profil admin non trouvé avec UID fixe')
    }
    
    const dioceseRef = doc(db, 'users', 'aC9QNeVKXFNKlMQvtTyO1YyAnsi2')
    const dioceseSnap = await getDoc(dioceseRef)
    
    if (dioceseSnap.exists()) {
      console.log('✅ Profil diocese trouvé avec UID fixe')
    } else {
      console.log('❌ Profil diocese non trouvé avec UID fixe')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message)
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 L\'utilisateur n\'existe pas dans Firebase Auth')
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 Mot de passe incorrect')
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 Email invalide')
    } else if (error.code === 'auth/too-many-requests') {
      console.log('💡 Trop de tentatives de connexion')
    }
  }
}

// Exécuter le diagnostic
debugAuth().catch(console.error)