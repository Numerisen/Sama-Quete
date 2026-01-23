const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

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

async function updateParishUserName() {
  try {
    console.log('🔧 Mise à jour du nom de la paroisse dans le profil utilisateur...\n');

    const userId = 'oqh4VT0W2OWfzNd8p3cWnwo4wNn2';
    const parishId = 'BRVgyxJZA6OjBt5VZszs';
    const parishName = 'Paroisse Saint Jean BOSCO';

    console.log('👤 User ID:', userId);
    console.log('🏛️ Parish ID:', parishId);
    console.log('📝 Parish Name:', parishName);

    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      parishId: parishId,
      parishName: parishName,  // Ajouter le nom de la paroisse
      parish: parishName       // Pour la compatibilité
    });

    console.log('\n✅ Profil utilisateur mis à jour avec succès !');
    console.log('✅ parishId:', parishId);
    console.log('✅ parishName:', parishName);
    console.log('\n📝 Veuillez vous déconnecter et vous reconnecter dans l\'admin.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

updateParishUserName();

