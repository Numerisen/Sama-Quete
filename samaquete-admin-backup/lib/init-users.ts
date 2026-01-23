import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase'
import { createUserWithRole } from './user-service'

// Script pour initialiser les utilisateurs avec leurs rôles
export async function initializeUsers() {
  console.log('🚀 Initialisation des utilisateurs...')

  const users = [
    {
      email: 'admin@admin.com',
      password: 'admin123', // Changez ce mot de passe en production !
      displayName: 'Super Administrateur',
      role: 'super_admin' as const
    },
    {
      email: 'diocese@admin.com',
      password: 'diocese123', // Changez ce mot de passe en production !
      displayName: 'Administrateur Diocèse',
      role: 'diocese_admin' as const
    }
  ]

  for (const userData of users) {
    try {
      console.log(`📝 Création de l'utilisateur: ${userData.email}`)
      
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      )
      
      // Créer le profil utilisateur dans Firestore
      await createUserWithRole(
        userCredential.user.uid,
        userData.email,
        userData.displayName,
        userData.role
      )
      
      console.log(`✅ Utilisateur créé avec succès: ${userData.email}`)
      
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  L'utilisateur ${userData.email} existe déjà dans Firebase Auth`)
        
        // Si l'utilisateur existe déjà dans Auth, on peut quand même créer son profil Firestore
        // Vous devrez récupérer l'UID depuis la console Firebase
        console.log(`💡 Créez manuellement le profil Firestore pour cet utilisateur`)
      } else {
        console.error(`❌ Erreur lors de la création de ${userData.email}:`, error.message)
      }
    }
  }
  
  console.log('🎉 Initialisation terminée !')
}

// Fonction pour créer un profil Firestore pour un utilisateur existant
export async function createFirestoreProfileForExistingUser(
  uid: string, 
  email: string, 
  displayName: string, 
  role: 'super_admin' | 'diocese_admin' | 'parish_admin' | 'user'
) {
  try {
    await createUserWithRole(uid, email, displayName, role)
    console.log(`✅ Profil Firestore créé pour ${email}`)
  } catch (error) {
    console.error(`❌ Erreur lors de la création du profil Firestore:`, error)
  }
}

// Instructions pour utiliser ce script
console.log(`
📋 INSTRUCTIONS D'UTILISATION:

1. Pour initialiser les utilisateurs (première fois):
   - Exécutez: initializeUsers()
   - Cela créera les comptes Auth + profils Firestore

2. Pour les utilisateurs existants dans Firebase Auth:
   - Récupérez l'UID depuis la console Firebase
   - Exécutez: createFirestoreProfileForExistingUser(uid, email, displayName, role)

3. UIDs des utilisateurs existants (à récupérer depuis Firebase Console):
   - admin@admin.com: [UID à récupérer]
   - diocese@admin.com: [UID à récupérer]
`)