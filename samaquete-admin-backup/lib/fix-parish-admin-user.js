const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, updateDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDdF4W5v_H1a8BQWL0_VrJh-Vk6a8H7xYc",
  authDomain: "numerisen-14a03.firebaseapp.com",
  projectId: "numerisen-14a03",
  storageBucket: "numerisen-14a03.firebasestorage.app",
  messagingSenderId: "475854989312",
  appId: "1:475854989312:web:67d75b2fcf8e5b7f2f0c4a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixParishAdminUser() {
  try {
    console.log('🔧 Correction de l\'utilisateur admin paroisse...\n');

    // Le vrai ID de la paroisse Saint Jean Bosco
    const realParishId = 'BRVgyxJZA6OjBt5VZszs';

    // Trouver l'utilisateur admin.paroisse@test.com
    const q = query(
      collection(db, 'users'),
      where('email', '==', 'admin.paroisse@test.com')
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('❌ Utilisateur admin.paroisse@test.com non trouvé');
      process.exit(1);
    }

    querySnapshot.forEach(async (userDoc) => {
      console.log('✅ Utilisateur trouvé:', userDoc.id);
      console.log('📝 Données actuelles:', userDoc.data());

      // Mettre à jour avec le bon parishId
      await updateDoc(doc(db, 'users', userDoc.id), {
        parishId: realParishId
      });

      console.log('\n✅ Utilisateur mis à jour avec parishId:', realParishId);
    });

    console.log('\n✅ Correction terminée !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

fixParishAdminUser();

