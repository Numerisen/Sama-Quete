const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, limit } = require('firebase/firestore');

const firebaseConfig = {
  // Configuration Firebase (à remplacer par la vraie config)
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testPerformance() {
  console.log('🚀 Test de performance des requêtes Firebase...\n');
  
  const startTime = Date.now();
  
  try {
    // Test 1: Récupération des profils utilisateurs
    console.log('📊 Test 1: Récupération des profils utilisateurs');
    const profileStart = Date.now();
    const profilesQuery = query(collection(db, 'user_profiles'), limit(10));
    const profilesSnapshot = await getDocs(profilesQuery);
    const profileTime = Date.now() - profileStart;
    console.log(`✅ ${profilesSnapshot.docs.length} profils récupérés en ${profileTime}ms\n`);
    
    // Test 2: Récupération des paramètres de paroisse
    console.log('📊 Test 2: Récupération des paramètres de paroisse');
    const settingsStart = Date.now();
    const settingsQuery = query(collection(db, 'parish_settings'), limit(5));
    const settingsSnapshot = await getDocs(settingsQuery);
    const settingsTime = Date.now() - settingsStart;
    console.log(`✅ ${settingsSnapshot.docs.length} paramètres récupérés en ${settingsTime}ms\n`);
    
    // Test 3: Récupération des notifications
    console.log('📊 Test 3: Récupération des notifications');
    const notifStart = Date.now();
    const notifQuery = query(collection(db, 'notifications'), limit(20));
    const notifSnapshot = await getDocs(notifQuery);
    const notifTime = Date.now() - notifStart;
    console.log(`✅ ${notifSnapshot.docs.length} notifications récupérées en ${notifTime}ms\n`);
    
    // Test 4: Récupération des journaux d'activité
    console.log('📊 Test 4: Récupération des journaux d\'activité');
    const logsStart = Date.now();
    const logsQuery = query(collection(db, 'activity_logs'), limit(20));
    const logsSnapshot = await getDocs(logsQuery);
    const logsTime = Date.now() - logsStart;
    console.log(`✅ ${logsSnapshot.docs.length} journaux récupérés en ${logsTime}ms\n`);
    
    const totalTime = Date.now() - startTime;
    
    console.log('📈 Résumé des performances:');
    console.log(`   • Profils: ${profileTime}ms`);
    console.log(`   • Paramètres: ${settingsTime}ms`);
    console.log(`   • Notifications: ${notifTime}ms`);
    console.log(`   • Journaux: ${logsTime}ms`);
    console.log(`   • Total: ${totalTime}ms`);
    
    if (totalTime < 2000) {
      console.log('\n🎉 Excellent! Chargement très rapide (< 2s)');
    } else if (totalTime < 5000) {
      console.log('\n✅ Bon! Chargement acceptable (< 5s)');
    } else {
      console.log('\n⚠️  Lent! Chargement > 5s - Optimisation nécessaire');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testPerformance();
