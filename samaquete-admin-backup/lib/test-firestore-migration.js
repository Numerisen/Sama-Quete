const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Configuration Firebase (remplacez par vos vraies clés)
const firebaseConfig = {
  apiKey: "AIzaSyBvOkBwJ1BqF8YqQqQqQqQqQqQqQqQqQqQ",
  authDomain: "numerisen-14a03.firebaseapp.com",
  projectId: "numerisen-14a03",
  storageBucket: "numerisen-14a03.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirestoreMigration() {
  console.log('🧪 Test de la migration Firestore...\n');

  const collections = [
    'admin_users',
    'admin_news', 
    'admin_parishes',
    'admin_donations',
    'admin_liturgy'
  ];

  let allTestsPassed = true;

  for (const collectionName of collections) {
    try {
      console.log(`📋 Test de la collection: ${collectionName}`);
      
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.empty) {
        console.log(`❌ Collection ${collectionName} est vide`);
        allTestsPassed = false;
      } else {
        console.log(`✅ Collection ${collectionName}: ${snapshot.size} documents`);
        
        // Afficher le premier document comme exemple
        const firstDoc = snapshot.docs[0];
        console.log(`   📄 Exemple de document:`, {
          id: firstDoc.id,
          data: firstDoc.data()
        });
      }
      
    } catch (error) {
      console.log(`❌ Erreur avec la collection ${collectionName}:`, error.message);
      allTestsPassed = false;
    }
    
    console.log(''); // Ligne vide
  }

  // Test des règles de sécurité
  console.log('🔒 Test des règles de sécurité...');
  try {
    // Tenter de lire sans authentification (devrait échouer)
    const testCollection = collection(db, 'admin_users');
    await getDocs(testCollection);
    console.log('⚠️  Les règles de sécurité pourraient être trop permissives');
  } catch (error) {
    console.log('✅ Règles de sécurité actives (lecture refusée sans auth)');
  }

  // Résumé
  console.log('📊 Résumé des tests:');
  if (allTestsPassed) {
    console.log('🎉 Tous les tests sont passés ! La migration est réussie.');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Tester l\'application web');
    console.log('2. Vérifier la synchronisation en temps réel');
    console.log('3. Supprimer les références localStorage restantes');
  } else {
    console.log('❌ Certains tests ont échoué. Vérifiez la configuration.');
    console.log('\n🔧 Actions recommandées:');
    console.log('1. Vérifier la configuration Firebase');
    console.log('2. Exécuter le script de migration');
    console.log('3. Vérifier les règles Firestore');
  }
}

// Exécuter les tests
testFirestoreMigration().catch(console.error);
