const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

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

async function createTestNotification() {
  try {
    console.log('📝 Création de notifications de test...\n');

    const realParishId = 'BRVgyxJZA6OjBt5VZszs'; // ID réel de Paroisse Saint Jean BOSCO

    // Créer plusieurs notifications de test
    const notifications = [
      {
        parishId: realParishId,
        type: 'prayer',
        title: '⏰ Nouvelle heure de prière',
        message: 'prière du soir à 19:00',
        icon: 'time',
        priority: 'normal',
        read: false,
        createdAt: serverTimestamp()
      },
      {
        parishId: realParishId,
        type: 'news',
        title: '📰 Nouvelle actualité',
        message: 'Célébration de la fête patronale ce dimanche',
        icon: 'newspaper',
        priority: 'high',
        read: false,
        createdAt: serverTimestamp()
      },
      {
        parishId: realParishId,
        type: 'activity',
        title: '📅 Nouvelle activité',
        message: 'Réunion des catéchistes - Samedi 15h00',
        icon: 'calendar',
        priority: 'normal',
        read: false,
        createdAt: serverTimestamp()
      }
    ];

    console.log('Création de', notifications.length, 'notifications...\n');

    for (const notif of notifications) {
      const docRef = await addDoc(collection(db, 'parish_notifications'), notif);
      console.log('✅', notif.title, '- ID:', docRef.id);
    }

    console.log('\n✅ Toutes les notifications ont été créées !');
    console.log('\n📱 Ouvrez l\'app mobile et allez dans "Notifications" pour les voir');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTestNotification();

