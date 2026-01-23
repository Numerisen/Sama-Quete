/**
 * Script de nettoyage Firestore
 * 
 * Supprime tous les dons et utilisateurs de Firestore
 * ⚠️ ATTENTION: Cette opération est irréversible !
 */

const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccountKey.json') // Vous devrez créer ce fichier

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

const db = admin.firestore()

// Collections à nettoyer
const collectionsToClean = [
  'donations',
  'admin_donations',
  'parish_donations',
  'users' // Attention: cela supprimera TOUS les utilisateurs, y compris les admins !
]

async function deleteCollection(collectionName, batchSize = 500) {
  const collectionRef = db.collection(collectionName)
  let deletedCount = 0

  console.log(`\n🗑️  Suppression de la collection: ${collectionName}`)

  while (true) {
    // Récupérer un batch de documents
    const snapshot = await collectionRef.limit(batchSize).get()

    if (snapshot.empty) {
      console.log(`✅ Collection ${collectionName} vidée (${deletedCount} documents supprimés)`)
      break
    }

    // Supprimer par batch
    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
      deletedCount++
    })

    await batch.commit()
    console.log(`  📦 ${deletedCount} documents supprimés...`)

    // Si on a moins de batchSize documents, on a fini
    if (snapshot.size < batchSize) {
      console.log(`✅ Collection ${collectionName} vidée (${deletedCount} documents supprimés)`)
      break
    }
  }

  return deletedCount
}

async function cleanupFirestore() {
  console.log('🚀 Démarrage du nettoyage Firestore...')
  console.log('⚠️  ATTENTION: Cette opération est irréversible !\n')

  const totalDeleted = {}

  try {
    for (const collectionName of collectionsToClean) {
      const count = await deleteCollection(collectionName)
      totalDeleted[collectionName] = count
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 RÉSUMÉ DU NETTOYAGE')
    console.log('='.repeat(60))
    
    let grandTotal = 0
    Object.entries(totalDeleted).forEach(([collection, count]) => {
      console.log(`  ${collection}: ${count} documents supprimés`)
      grandTotal += count
    })
    
    console.log(`\n  TOTAL: ${grandTotal} documents supprimés`)
    console.log('='.repeat(60))
    console.log('✅ Nettoyage terminé avec succès !')

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
    process.exit(1)
  }
}

// Alternative: Utiliser l'API client Firebase (sans serviceAccount)
async function cleanupFirestoreClient() {
  const { initializeApp } = require('firebase/app')
  const { getFirestore, collection, getDocs, deleteDoc, doc, query, limit } = require('firebase/firestore')

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAR8kwZE9ats8NmUVbIfTzxOZDzmiyToQQ",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "numerisen-14a03.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "numerisen-14a03",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "numerisen-14a03.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "764890122669",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:764890122669:web:6e07cde20ce346bb3b3924",
  }

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  console.log('🚀 Démarrage du nettoyage Firestore (mode client)...')
  console.log('⚠️  ATTENTION: Cette opération est irréversible !\n')

  const totalDeleted = {}

  async function deleteCollectionClient(collectionName, batchSize = 500) {
    let deletedCount = 0
    console.log(`\n🗑️  Suppression de la collection: ${collectionName}`)

    while (true) {
      const q = query(collection(db, collectionName), limit(batchSize))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        console.log(`✅ Collection ${collectionName} vidée (${deletedCount} documents supprimés)`)
        break
      }

      // Supprimer chaque document
      const deletePromises = []
      snapshot.docs.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, collectionName, docSnapshot.id)))
        deletedCount++
      })

      await Promise.all(deletePromises)
      console.log(`  📦 ${deletedCount} documents supprimés...`)

      if (snapshot.size < batchSize) {
        console.log(`✅ Collection ${collectionName} vidée (${deletedCount} documents supprimés)`)
        break
      }
    }

    return deletedCount
  }

  try {
    for (const collectionName of collectionsToClean) {
      const count = await deleteCollectionClient(collectionName)
      totalDeleted[collectionName] = count
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 RÉSUMÉ DU NETTOYAGE')
    console.log('='.repeat(60))
    
    let grandTotal = 0
    Object.entries(totalDeleted).forEach(([collection, count]) => {
      console.log(`  ${collection}: ${count} documents supprimés`)
      grandTotal += count
    })
    
    console.log(`\n  TOTAL: ${grandTotal} documents supprimés`)
    console.log('='.repeat(60))
    console.log('✅ Nettoyage terminé avec succès !')

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
    process.exit(1)
  }
}

// Exécuter le nettoyage
if (require.main === module) {
  // Utiliser la version client (plus simple, pas besoin de serviceAccount)
  cleanupFirestoreClient().catch(console.error)
}

module.exports = { cleanupFirestore, cleanupFirestoreClient }
