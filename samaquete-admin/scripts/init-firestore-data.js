/**
 * Script pour initialiser les données de base dans Firestore
 * 
 * Usage: node scripts/init-firestore-data.js
 * 
 * Ce script crée :
 * - Les 7 diocèses fixes du Sénégal
 * - Une paroisse de test (PAR_001) dans le diocèse de Thiès
 * - Une église de test (CH_001) dans cette paroisse
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// Normalisation de la clé privée
function normalizePrivateKey(key) {
  if (!key) return '';
  return key.replace(/\\n/g, '\n');
}

// Configuration Firebase Admin
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 
                    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.replace(/"/g, '') ||
                    'samaquete-admin-new';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!clientEmail || !privateKey) {
    console.error('❌ Service account non configuré dans .env.local');
    console.log('   Vérifiez que FIREBASE_CLIENT_EMAIL et FIREBASE_PRIVATE_KEY sont définis');
    process.exit(1);
  }

  return initializeApp({
    credential: cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    }),
  });
}

// Diocèses fixes du Sénégal
const FIXED_DIOCESES = [
  { dioceseId: "DAKAR", name: "Archidiocèse de Dakar", isMetropolitan: true },
  { dioceseId: "THIES", name: "Diocèse de Thiès", isMetropolitan: false },
  { dioceseId: "KAOLACK", name: "Diocèse de Kaolack", isMetropolitan: false },
  { dioceseId: "ZIGUINCHOR", name: "Diocèse de Ziguinchor", isMetropolitan: false },
  { dioceseId: "KOLDA", name: "Diocèse de Kolda", isMetropolitan: false },
  { dioceseId: "TAMBACOUNDA", name: "Diocèse de Tambacounda", isMetropolitan: false },
  { dioceseId: "SAINT_LOUIS", name: "Diocèse de Saint-Louis", isMetropolitan: false },
];

// Initialiser les diocèses
async function initDioceses(db) {
  console.log('\n📁 Initialisation des diocèses...');
  let created = 0;
  let updated = 0;

  for (const diocese of FIXED_DIOCESES) {
    try {
      const docRef = db.collection('dioceses').doc(diocese.dioceseId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        await docRef.update({
          ...diocese,
          updatedAt: Timestamp.now(),
        });
        console.log(`   ✅ Mis à jour: ${diocese.name}`);
        updated++;
      } else {
        await docRef.set({
          ...diocese,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        console.log(`   ✅ Créé: ${diocese.name}`);
        created++;
      }
    } catch (error) {
      console.error(`   ❌ Erreur pour ${diocese.name}:`, error.message);
    }
  }

  console.log(`\n   📊 Résumé: ${created} créés, ${updated} mis à jour`);
  return { created, updated };
}

// Créer une paroisse de test
async function createTestParish(db) {
  console.log('\n📁 Création de la paroisse de test...');
  
  const parish = {
    parishId: "PAR_001",
    name: "Paroisse Sainte Thérèse",
    dioceseId: "THIES",
    isActive: true,
    address: "Thiès, Sénégal",
    phone: "+221 XX XXX XX XX",
    email: "paroisse@example.com",
  };

  try {
    const docRef = db.collection('parishes').doc(parish.parishId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      await docRef.update({
        ...parish,
        updatedAt: Timestamp.now(),
      });
      console.log(`   ✅ Paroisse mise à jour: ${parish.name}`);
      return false;
    } else {
      await docRef.set({
        ...parish,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`   ✅ Paroisse créée: ${parish.name}`);
      return true;
    }
  } catch (error) {
    console.error(`   ❌ Erreur:`, error.message);
    throw error;
  }
}

// Créer une église de test
async function createTestChurch(db) {
  console.log('\n📁 Création de l\'église de test...');
  
  const church = {
    churchId: "CH_001",
    name: "Église Saint Paul",
    parishId: "PAR_001",
    dioceseId: "THIES",
    isActive: true,
    address: "Thiès, Sénégal",
  };

  try {
    const docRef = db.collection('churches').doc(church.churchId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      await docRef.update({
        ...church,
        updatedAt: Timestamp.now(),
      });
      console.log(`   ✅ Église mise à jour: ${church.name}`);
      return false;
    } else {
      await docRef.set({
        ...church,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`   ✅ Église créée: ${church.name}`);
      return true;
    }
  } catch (error) {
    console.error(`   ❌ Erreur:`, error.message);
    throw error;
  }
}

// Main
async function main() {
  console.log('🚀 Initialisation des données Firestore...\n');

  try {
    const app = initializeFirebaseAdmin();
    const db = getFirestore(app);

    // Initialiser les diocèses
    await initDioceses(db);

    // Créer la paroisse de test
    await createTestParish(db);

    // Créer l'église de test
    await createTestChurch(db);

    console.log('\n✅ Initialisation terminée avec succès!');
    console.log('\n📋 Données créées:');
    console.log('   - 7 diocèses (dont Archidiocèse de Dakar)');
    console.log('   - 1 paroisse de test (PAR_001) dans le diocèse de Thiès');
    console.log('   - 1 église de test (CH_001) dans la paroisse PAR_001');
    console.log('\n💡 Vous pouvez maintenant vous connecter avec:');
    console.log('   - parish@test.com (parish_admin)');
    console.log('   - church@test.com (church_admin)');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

main();
