// Script pour créer automatiquement les profils Firestore
import { initializeApp } from 'firebase/app'
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'

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
    console.log(`✅ Profil créé avec succès pour ${email} (${role})`)
    return true
  } catch (error) {
    console.error(`❌ Erreur lors de la création du profil pour ${email}:`, error)
    return false
  }
}

// Créer les profils
async function createAllProfiles() {
  console.log('🚀 Création des profils Firestore...')
  
  const users = [
    {
      uid: 'IhVf2ekzGNPX5LWzaaTGHQHzMTk1',
      email: 'admin@admin.com',
      displayName: 'Super Administrateur',
      role: 'super_admin'
    },
    {
      uid: 'aC9QNeVKXFNKlMQvtTyO1YyAnsi2',
      email: 'diocese@diocese.com',
      displayName: 'Administrateur Diocèse',
      role: 'diocese_admin'
    }
  ]

  for (const user of users) {
    await createUserProfile(user.uid, user.email, user.displayName, user.role)
  }
  
  console.log('🎉 Tous les profils ont été créés !')
  console.log('📋 Vous pouvez maintenant tester la connexion sur http://localhost:3000/login')
}

// Exécuter le script
createAllProfiles().catch(console.error)