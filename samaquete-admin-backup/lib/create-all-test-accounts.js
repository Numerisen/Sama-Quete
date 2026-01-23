/**
 * Script complet pour créer TOUS les comptes de test nécessaires
 * 
 * Ce script crée:
 * 1. Un diocèse de test
 * 2. Une paroisse de test (rattachée au diocèse)
 * 3. Une église de test (rattachée à la paroisse)
 * 4. Les comptes admin correspondants dans Firebase Auth ET Firestore
 * 
 * Usage: node lib/create-all-test-accounts.js
 * 
 * IMPORTANT: Ce script utilise le SDK client Firebase (pas firebase-admin)
 * Il nécessite que les variables d'environnement Firebase soient configurées
 */

const { initializeApp } = require('firebase/app')
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth')
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where
} = require('firebase/firestore')

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAR8kwZE9ats8NmUVbIfTzxOZDzmiyToQQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "numerisen-14a03.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "numerisen-14a03",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "numerisen-14a03.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "764890122669",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:764890122669:web:6e07cde20ce346bb3b3924"
}

// Initialiser Firebase
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

// Normaliser un nom pour créer un email/ID
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, '') // Supprimer les tirets en début/fin
}

// Créer un utilisateur dans Firebase Auth
async function createAuthUser(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    console.log(`   ✅ Utilisateur Auth créé: ${email} (UID: ${userCredential.user.uid})`)
    return userCredential.user.uid
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`   ⚠️  Email déjà utilisé: ${email}`)
      // Essayer de récupérer l'UID existant (nécessite une connexion)
      throw new Error('EMAIL_EXISTS')
    }
    throw error
  }
}

// Créer un profil dans Firestore
async function createFirestoreProfile(uid, userData) {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log(`   ✅ Profil Firestore créé pour UID: ${uid}`)
    return true
  } catch (error) {
    console.error(`   ❌ Erreur création profil Firestore:`, error.message)
    throw error
  }
}

// Créer un diocèse
async function createDiocese(name, city = 'Dakar') {
  try {
    const dioceseId = normalizeName(name)
    
    // Vérifier si le diocèse existe déjà
    const diocesesRef = collection(db, 'dioceses')
    const q = query(diocesesRef, where('name', '==', name))
    const existing = await getDocs(q)
    
    if (!existing.empty) {
      const existingDoc = existing.docs[0]
      console.log(`   ⚠️  Diocèse existe déjà: ${name} (ID: ${existingDoc.id})`)
      return existingDoc.id
    }
    
    const dioceseData = {
      name: name,
      location: city,
      city: city,
      type: 'Diocèse',
      bishop: 'Évêque de test',
      contactInfo: {
        email: `contact@${dioceseId}.sn`,
        phone: '+221 33 XXX XX XX'
      },
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    await setDoc(doc(db, 'dioceses', dioceseId), dioceseData)
    console.log(`   ✅ Diocèse créé: ${name} (ID: ${dioceseId})`)
    return dioceseId
  } catch (error) {
    console.error(`   ❌ Erreur création diocèse:`, error.message)
    throw error
  }
}

// Créer une paroisse
async function createParish(name, dioceseId, dioceseName, city = 'Dakar') {
  try {
    const parishId = normalizeName(name)
    
    // Vérifier si la paroisse existe déjà
    const parishesRef = collection(db, 'parishes')
    const q = query(parishesRef, where('name', '==', name))
    const existing = await getDocs(q)
    
    if (!existing.empty) {
      const existingDoc = existing.docs[0]
      console.log(`   ⚠️  Paroisse existe déjà: ${name} (ID: ${existingDoc.id})`)
      return existingDoc.id
    }
    
    const parishData = {
      name: name,
      dioceseId: dioceseId,
      dioceseName: dioceseName,
      location: city,
      city: city,
      priest: 'Curé de test',
      contactInfo: {
        email: `contact@${parishId}.sn`,
        phone: '+221 33 XXX XX XX',
        address: `${city}, Sénégal`
      },
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    await setDoc(doc(db, 'parishes', parishId), parishData)
    console.log(`   ✅ Paroisse créée: ${name} (ID: ${parishId})`)
    return parishId
  } catch (error) {
    console.error(`   ❌ Erreur création paroisse:`, error.message)
    throw error
  }
}

// Créer une église
async function createChurch(name, parishId, city = 'Dakar') {
  try {
    const churchId = normalizeName(name)
    
    // Vérifier si l'église existe déjà
    const churchesRef = collection(db, 'churches')
    const q = query(churchesRef, where('name', '==', name), where('parishId', '==', parishId))
    const existing = await getDocs(q)
    
    if (!existing.empty) {
      const existingDoc = existing.docs[0]
      console.log(`   ⚠️  Église existe déjà: ${name} (ID: ${existingDoc.id})`)
      return existingDoc.id
    }
    
    const churchData = {
      name: name,
      parishId: parishId,
      description: `Église ${name} - Paroisse de test`,
      address: `${city}, Sénégal`,
      city: city,
      contactInfo: {
        email: `contact@${churchId}.sn`,
        phone: '+221 33 XXX XX XX'
      },
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    await setDoc(doc(db, 'churches', churchId), churchData)
    console.log(`   ✅ Église créée: ${name} (ID: ${churchId})`)
    return churchId
  } catch (error) {
    console.error(`   ❌ Erreur création église:`, error.message)
    throw error
  }
}

// Fonction principale
async function createAllTestAccounts() {
  console.log('🚀 Création de tous les comptes de test...\n')
  console.log('='.repeat(60))
  
  const results = {
    diocese: null,
    parish: null,
    church: null,
    accounts: []
  }
  
  try {
    // 1. Créer le diocèse
    console.log('\n📝 ÉTAPE 1: Création du diocèse de test')
    console.log('-'.repeat(60))
    const dioceseName = 'Diocèse de Dakar'
    const dioceseId = await createDiocese(dioceseName, 'Dakar')
    results.diocese = { id: dioceseId, name: dioceseName }
    
    // 2. Créer le compte Admin Diocèse
    console.log('\n📝 ÉTAPE 2: Création du compte Admin Diocèse')
    console.log('-'.repeat(60))
    const dioceseEmail = 'diocese.dakar.test@samaquete.sn'
    const diocesePassword = 'Admin123'
    
    try {
      const dioceseUid = await createAuthUser(dioceseEmail, diocesePassword, 'Admin Diocèse Dakar')
      await createFirestoreProfile(dioceseUid, {
        email: dioceseEmail,
        displayName: 'Admin Diocèse Dakar',
        role: 'diocese_admin',
        dioceseId: dioceseId,
        permissions: getPermissionsByRole('diocese_admin'),
        isActive: true
      })
      results.accounts.push({
        type: 'diocese_admin',
        email: dioceseEmail,
        password: diocesePassword,
        uid: dioceseUid,
        role: 'diocese_admin'
      })
    } catch (error) {
      if (error.message === 'EMAIL_EXISTS') {
        console.log(`   ⚠️  Compte existe déjà, récupération de l'UID...`)
        // Pour récupérer l'UID, il faudrait se connecter, on skip pour l'instant
      } else {
        console.error(`   ❌ Erreur: ${error.message}`)
      }
    }
    
    // 3. Créer la paroisse
    console.log('\n📝 ÉTAPE 3: Création de la paroisse de test')
    console.log('-'.repeat(60))
    const parishName = 'Paroisse Saint-Joseph de Médina'
    const parishId = await createParish(parishName, dioceseId, dioceseName, 'Dakar')
    results.parish = { id: parishId, name: parishName }
    
    // 4. Créer le compte Admin Paroisse
    console.log('\n📝 ÉTAPE 4: Création du compte Admin Paroisse')
    console.log('-'.repeat(60))
    const parishEmail = `paroisse-${normalizeName(parishName)}@samaquete.sn`
    const parishPassword = 'Admin123'
    
    try {
      const parishUid = await createAuthUser(parishEmail, parishPassword, parishName)
      await createFirestoreProfile(parishUid, {
        email: parishEmail,
        displayName: parishName,
        role: 'parish_admin',
        parishId: parishId,
        dioceseId: dioceseId,
        permissions: getPermissionsByRole('parish_admin'),
        isActive: true
      })
      results.accounts.push({
        type: 'parish_admin',
        email: parishEmail,
        password: parishPassword,
        uid: parishUid,
        role: 'parish_admin'
      })
    } catch (error) {
      if (error.message === 'EMAIL_EXISTS') {
        console.log(`   ⚠️  Compte existe déjà`)
      } else {
        console.error(`   ❌ Erreur: ${error.message}`)
      }
    }
    
    // 5. Créer l'église
    console.log('\n📝 ÉTAPE 5: Création de l\'église de test')
    console.log('-'.repeat(60))
    const churchName = 'Église Saint Jean Bosco'
    const churchId = await createChurch(churchName, parishId, 'Dakar')
    results.church = { id: churchId, name: churchName }
    
    // 6. Créer le compte Admin Église
    console.log('\n📝 ÉTAPE 6: Création du compte Admin Église')
    console.log('-'.repeat(60))
    const churchEmail = `eglise-${normalizeName(churchName)}@samaquete.sn`
    const churchPassword = 'Admin123'
    
    try {
      const churchUid = await createAuthUser(churchEmail, churchPassword, churchName)
      await createFirestoreProfile(churchUid, {
        email: churchEmail,
        displayName: churchName,
        role: 'church_admin',
        parishId: parishId,
        churchId: churchId,
        dioceseId: dioceseId,
        permissions: getPermissionsByRole('church_admin'),
        isActive: true
      })
      results.accounts.push({
        type: 'church_admin',
        email: churchEmail,
        password: churchPassword,
        uid: churchUid,
        role: 'church_admin'
      })
    } catch (error) {
      if (error.message === 'EMAIL_EXISTS') {
        console.log(`   ⚠️  Compte existe déjà`)
      } else {
        console.error(`   ❌ Erreur: ${error.message}`)
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(60))
    console.log('📊 RÉSUMÉ DE LA CRÉATION')
    console.log('='.repeat(60))
    console.log(`\n✅ Diocèse créé:`)
    console.log(`   - Nom: ${results.diocese.name}`)
    console.log(`   - ID: ${results.diocese.id}`)
    console.log(`\n✅ Paroisse créée:`)
    console.log(`   - Nom: ${results.parish.name}`)
    console.log(`   - ID: ${results.parish.id}`)
    console.log(`\n✅ Église créée:`)
    console.log(`   - Nom: ${results.church.name}`)
    console.log(`   - ID: ${results.church.id}`)
    console.log(`\n📋 COMPTES DE TEST CRÉÉS:\n`)
    
    results.accounts.forEach(account => {
      console.log(`✅ ${account.type.toUpperCase()}`)
      console.log(`   Email: ${account.email}`)
      console.log(`   Mot de passe: ${account.password}`)
      console.log(`   Rôle: ${account.role}`)
      console.log(`   UID: ${account.uid}\n`)
    })
    
    console.log('='.repeat(60))
    console.log('\n🧪 PROCHAINES ÉTAPES:')
    console.log('1. Allez sur http://localhost:3000/login')
    console.log('2. Connectez-vous avec un des comptes ci-dessus')
    console.log('3. Vous serez redirigé automatiquement selon votre rôle')
    console.log('\n📝 NOTE:')
    console.log('Si un compte existe déjà, vous devrez le créer manuellement')
    console.log('dans Firebase Console > Authentication')
    console.log('\n')
    
  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Exécuter le script
createAllTestAccounts()
  .then(() => {
    console.log('✅ Script terminé avec succès')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
