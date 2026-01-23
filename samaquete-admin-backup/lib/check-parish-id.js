const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function checkParishIds() {
  try {
    console.log('🔍 Recherche des paroisses...\n');

    // Chercher toutes les paroisses
    const parishesSnapshot = await getDocs(collection(db, 'parishes'));
    
    console.log(`📊 Nombre de paroisses: ${parishesSnapshot.size}\n`);
    
    parishesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('🏛️ Paroisse:', {
        id: doc.id,
        name: data.name,
        city: data.city
      });
    });

    // Chercher spécifiquement Saint Jean Bosco
    console.log('\n🔍 Recherche de Saint Jean Bosco...');
    const saintJeanQuery = query(
      collection(db, 'parishes'),
      where('name', '==', 'Paroisse Saint Jean BOSCO')
    );
    const saintJeanSnapshot = await getDocs(saintJeanQuery);
    
    if (!saintJeanSnapshot.empty) {
      saintJeanSnapshot.forEach((doc) => {
        console.log('✅ Saint Jean Bosco trouvée:',{
          id: doc.id,
          name: doc.data().name
        });
      });
    } else {
      console.log('❌ Saint Jean Bosco non trouvée');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkParishIds();

