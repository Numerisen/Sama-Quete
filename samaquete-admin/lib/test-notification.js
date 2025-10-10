const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where } = require('firebase/firestore');

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

async function testNotifications() {
  try {
    console.log('📝 Test des notifications Firestore...\n');

    const parishId = 'paroisse-saint-jean-bosco';

    // 1. Créer une notification de test
    console.log('1️⃣ Création d\'une notification de test...');
    const notificationData = {
      parishId,
      type: 'prayer',
      title: '⏰ Test notification',
      message: 'Ceci est une notification de test - Messe à 19:00',
      icon: 'time',
      priority: 'normal',
      read: false,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'parish_notifications'), notificationData);
    console.log('✅ Notification créée avec ID:', docRef.id);

    // 2. Lire toutes les notifications
    console.log('\n2️⃣ Lecture de toutes les notifications...');
    const q = query(
      collection(db, 'parish_notifications'),
      where('parishId', '==', parishId)
    );
    const querySnapshot = await getDocs(q);
    
    console.log('📊 Nombre de notifications trouvées:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📬 Notification:', {
        id: doc.id,
        title: data.title,
        message: data.message,
        type: data.type,
        read: data.read,
        createdAt: data.createdAt ? 'présent' : 'manquant'
      });
    });

    console.log('\n✅ Test terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testNotifications();

