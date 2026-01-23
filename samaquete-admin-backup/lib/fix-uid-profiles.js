// Script pour corriger les profils avec les bons UIDs
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'

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

// Fonction pour créer un profil utilisateur
async function createUserProfile(uid, email, displayName, role) {
  const userRef = doc(db, 'users', uid)
  
  // Définir les permissions selon le rôle
  let permissions = {}
  switch (role) {
    case 'super_admin':
      permissions = {
        canManageUsers: true,
        canManageDioceses: true,
        canManageParishes: true,
        canManageContent: true,
        canViewReports: true,
        canManageDonations: true
      }
      break
    case 'diocese_admin':
      permissions = {
        canManageUsers: true,
        canManageDioceses: false,
        canManageParishes: true,
        canManageContent: true,
        canViewReports: true,
        canManageDonations: true
      }
      break
    default:
      permissions = {
        canManageUsers: false,
        canManageDioceses: false,
        canManageParishes: false,
        canManageContent: false,
        canViewReports: false,
        canManageDonations: false
      }
  }
  
  const userData = {
    email,
    displayName,
    role,
    permissions,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  try {
    await setDoc(userRef, userData)
    console.log(`✅ Profil créé avec succès pour ${email} (${role}) avec UID: ${uid}`)
    return true
  } catch (error) {
    console.error(`❌ Erreur lors de la création du profil pour ${email}:`, error.message)
    return false
  }
}

// Créer les profils avec les bons UIDs
async function fixProfilesWithCorrectUIDs() {
  console.log('🔧 Correction des profils avec les bons UIDs...')
  
  try {
    // S'authentifier avec admin@admin.com pour récupérer le vrai UID
    console.log('🔐 Authentification avec admin@admin.com...')
    const adminCredential = await signInWithEmailAndPassword(auth, 'admin@admin.com', 'admin123')
    const adminUID = adminCredential.user.uid
    console.log('✅ UID réel admin:', adminUID)
    
    // S'authentifier avec diocese@admin.com pour récupérer le vrai UID
    console.log('🔐 Authentification avec diocese@admin.com...')
    const dioceseCredential = await signInWithEmailAndPassword(auth, 'diocese@admin.com', 'diocese123')
    const dioceseUID = dioceseCredential.user.uid
    console.log('✅ UID réel diocese:', dioceseUID)
    
    // Créer les profils avec les vrais UIDs
    const users = [
      {
        uid: adminUID,
        email: 'admin@admin.com',
        displayName: 'Super Administrateur',
        role: 'super_admin'
      },
      {
        uid: dioceseUID,
        email: 'diocese@admin.com',
        displayName: 'Administrateur Diocèse',
        role: 'diocese_admin'
      }
    ]

    let successCount = 0
    let errorCount = 0

    for (const user of users) {
      const success = await createUserProfile(user.uid, user.email, user.displayName, user.role)
      if (success) {
        successCount++
      } else {
        errorCount++
      }
    }
    
    console.log('\n🎉 Résumé de la correction :')
    console.log(`✅ Profils créés avec succès : ${successCount}`)
    console.log(`❌ Erreurs : ${errorCount}`)
    
    if (successCount > 0) {
      console.log('\n📋 Maintenant vous pouvez :')
      console.log('1. Allez sur http://localhost:3000/login')
      console.log('2. Connectez-vous avec admin@admin.com / admin123')
      console.log('3. Vous devriez être redirigé vers /admin/dashboard')
      console.log('4. Testez avec diocese@admin.com / diocese123')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction :', error.message)
  }
}

// Exécuter le script
fixProfilesWithCorrectUIDs().catch(console.error)