/**
 * Script pour créer les comptes de test admin
 * 
 * Usage: node lib/create-test-accounts.js
 * 
 * IMPORTANT: Ce script nécessite firebase-admin pour fonctionner côté serveur
 * Alternative: Créer les comptes manuellement via Firebase Console
 */

// Pour utiliser firebase-admin (recommandé pour scripts Node.js)
const admin = require('firebase-admin')

// Si firebase-admin n'est pas installé, utiliser cette alternative:
// Créer les comptes manuellement via Firebase Console > Authentication
// Puis créer les profils Firestore manuellement

// Initialiser Firebase Admin (si disponible)
let auth, db
try {
  if (admin.apps.length === 0) {
    // Utiliser le fichier de service account ou les variables d'environnement
    const serviceAccount = require('../../samaquete-mobile/google-services.json')
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })
  }
  auth = admin.auth()
  db = admin.firestore()
} catch (error) {
  console.error('❌ Erreur d\'initialisation Firebase Admin:', error.message)
  console.log('\n💡 SOLUTION ALTERNATIVE:')
  console.log('1. Créez les comptes manuellement dans Firebase Console > Authentication')
  console.log('2. Créez les profils Firestore manuellement dans la collection "users"')
  console.log('3. Utilisez les identifiants ci-dessous:\n')
  process.exit(1)
}

// Configuration Firebase - À ADAPTER avec vos propres clés
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAR8kwZE9ats8NmUVbIfTzxOZDzmiyToQQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "numerisen-14a03.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "numerisen-14a03",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "numerisen-14a03.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "764890122669",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:764890122669:web:6e07cde20ce346bb3b3924"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Permissions par rôle
const getPermissionsByRole = (role) => {
  switch (role) {
    case 'super_admin':
      return {
        canManageUsers: true,
        canManageArchdioceses: true,
        canManageDioceses: true,
        canManageParishes: true,
        canManageChurches: true,
        canManageContent: true,
        canValidateContent: true,
        canCreateContent: true,
        canViewReports: true,
        canViewDonations: true,
        canManageDonations: true,
        canManageSettings: true
      }
    case 'archdiocese_admin':
      return {
        canManageUsers: false,
        canManageArchdioceses: false,
        canManageDioceses: false,
        canManageParishes: false,
        canManageChurches: false,
        canManageContent: true,
        canValidateContent: false,
        canCreateContent: true,
        canViewReports: true,
        canViewDonations: true,
        canManageDonations: false,
        canManageSettings: false
      }
    case 'diocese_admin':
      return {
        canManageUsers: false,
        canManageArchdioceses: false,
        canManageDioceses: false,
        canManageParishes: false,
        canManageChurches: false,
        canManageContent: true,
        canValidateContent: false,
        canCreateContent: true,
        canViewReports: true,
        canViewDonations: true,
        canManageDonations: false,
        canManageSettings: false
      }
    case 'parish_admin':
      return {
        canManageUsers: true,
        canManageArchdioceses: false,
        canManageDioceses: false,
        canManageParishes: true,
        canManageChurches: true,
        canManageContent: true,
        canValidateContent: true,
        canCreateContent: true,
        canViewReports: true,
        canViewDonations: true,
        canManageDonations: true,
        canManageSettings: false
      }
    case 'church_admin':
      return {
        canManageUsers: false,
        canManageArchdioceses: false,
        canManageDioceses: false,
        canManageParishes: false,
        canManageChurches: false,
        canManageContent: false,
        canValidateContent: false,
        canCreateContent: true,
        canViewReports: false,
        canViewDonations: true,
        canManageDonations: true,
        canManageSettings: false
      }
    default:
      return {
        canManageUsers: false,
        canManageArchdioceses: false,
        canManageDioceses: false,
        canManageParishes: false,
        canManageChurches: false,
        canManageContent: false,
        canValidateContent: false,
        canCreateContent: false,
        canViewReports: false,
        canViewDonations: false,
        canManageDonations: false,
        canManageSettings: false
      }
  }
}

async function createTestAccounts() {
  console.log('🚀 Création des comptes de test admin...\n')

  const accounts = [
    {
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'super_admin',
      displayName: 'Super Administrateur',
      description: '🔴 Super Admin - Accès global'
    },
    {
      email: 'diocese@admin.com',
      password: 'diocese123',
      role: 'diocese_admin',
      displayName: 'Administrateur Diocèse',
      dioceseId: 'dakar',
      description: '🟡 Admin Diocèse - Gestion diocèse uniquement'
    },
    {
      email: 'archdiocese.dakar@samaquete.sn',
      password: 'Admin123',
      role: 'archdiocese_admin',
      displayName: 'Admin Archidiocèse Dakar',
      archdioceseId: 'dakar',
      description: '🟠 Admin Archidiocèse - Lecture globale'
    }
  ]

  let successCount = 0
  let errorCount = 0
  const results = []

  for (const account of accounts) {
    try {
      console.log(`📝 Création: ${account.description}`)
      console.log(`   Email: ${account.email}`)
      
      // Créer l'utilisateur dans Firebase Auth
      const userRecord = await auth.createUser({
        email: account.email,
        password: account.password,
        displayName: account.displayName
      })
      console.log(`   ✅ UID: ${userRecord.uid}`)

      // Créer le profil Firestore
      const userData = {
        email: account.email,
        displayName: account.displayName,
        role: account.role,
        permissions: getPermissionsByRole(account.role),
        dioceseId: account.dioceseId || null,
        archdioceseId: account.archdioceseId || null,
        parishId: account.parishId || null,
        churchId: account.churchId || null,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }

      await db.collection('users').doc(userRecord.uid).set(userData)
      console.log(`   ✅ Profil Firestore créé\n`)

      results.push({
        success: true,
        email: account.email,
        password: account.password,
        role: account.role,
        uid: userRecord.uid
      })
      successCount++

    } catch (error) {
      if (error.code === 'auth/email-already-exists' || error.code === 'auth/email-already-in-use') {
        console.log(`   ⚠️  Compte existe déjà: ${account.email}\n`)
        results.push({
          success: false,
          email: account.email,
          password: account.password,
          role: account.role,
          error: 'Compte existe déjà'
        })
      } else {
        console.error(`   ❌ Erreur: ${error.message}\n`)
        results.push({
          success: false,
          email: account.email,
          password: account.password,
          role: account.role,
          error: error.message
        })
        errorCount++
      }
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ DE LA CRÉATION')
  console.log('='.repeat(60))
  console.log(`✅ Comptes créés avec succès: ${successCount}`)
  console.log(`❌ Erreurs: ${errorCount}`)
  console.log('\n📋 COMPTES DE TEST DISPONIBLES:\n')

  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.email} / ${result.password}`)
      console.log(`   Rôle: ${result.role}`)
      console.log(`   UID: ${result.uid}\n`)
    } else {
      console.log(`⚠️  ${result.email} / ${result.password}`)
      console.log(`   Rôle: ${result.role}`)
      console.log(`   Erreur: ${result.error}\n`)
    }
  })

  console.log('='.repeat(60))
  console.log('\n🧪 PROCHAINES ÉTAPES:')
  console.log('1. Allez sur http://localhost:3000/login')
  console.log('2. Connectez-vous avec un des comptes ci-dessus')
  console.log('3. Vous serez redirigé automatiquement selon votre rôle')
  console.log('\n📝 NOTE:')
  console.log('Pour créer des comptes Admin Paroisse et Admin Église,')
  console.log('vous devez d\'abord créer une paroisse et une église,')
  console.log('puis utiliser les fonctions createParishAdmin() et createChurchAdmin()')
  console.log('dans lib/admin-user-creation.ts\n')
}

// Exécuter le script
createTestAccounts()
  .then(() => {
    console.log('✅ Script terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
