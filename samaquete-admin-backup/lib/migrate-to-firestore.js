const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

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

// Données initiales pour migration
const initialUsers = [
  {
    name: "Mgr Jean Ndiaye",
    email: "jean.ndiaye@ces.sn",
    role: "super_admin",
    status: "Actif"
    // Pas de diocese/parish pour super_admin
  },
  {
    name: "Père Martin Sarr",
    email: "martin.sarr@diocese.sn",
    role: "admin_diocesan",
    status: "Actif",
    diocese: "Archidiocèse de Dakar"
    // Pas de parish pour admin_diocesan
  },
  {
    name: "Sœur Marie Diop",
    email: "marie.diop@paroisse.sn",
    role: "admin_parishial",
    status: "Inactif",
    diocese: "Archidiocèse de Dakar",
    parish: "Paroisse Saint-Pierre"
  }
];

const initialNews = [
  {
    title: "prière de Pâques 2024",
    excerpt: "Célébration solennelle de la Résurrection du Christ",
    content: "Rejoignez-nous pour la célébration de la prière de Pâques...",
    date: "2024-03-31",
    time: "10:00",
    location: "Cathédrale de Dakar",
    category: "Événement",
    priority: "high",
    image: "/placeholder.svg?height=200&width=300",
    diocese: "Archidiocèse de Dakar",
    published: true
  },
  {
    title: "Collecte pour les nécessiteux",
    excerpt: "Soutenez notre action caritative",
    content: "Votre générosité permet d'aider les plus démunis...",
    date: "2024-04-15",
    time: "14:00",
    location: "Centre paroissial",
    category: "Solidarité",
    priority: "medium",
    image: "/placeholder.svg?height=200&width=300",
    diocese: "Archidiocèse de Dakar",
    published: true
  }
];

const initialParishes = [
  {
    name: "Paroisse Saint-Pierre",
    diocese: "Archidiocèse de Dakar",
    city: "Dakar",
    cure: "Père Antoine Diop",
    vicaire: "Père Jean Sarr",
    catechists: "Marie Ndiaye, Paul Fall",
    contactInfo: {
      email: "saint-pierre@diocese.sn",
      phone: "+221 33 123 45 67",
      address: "Rue de la République, Dakar"
    }
  },
  {
    name: "Paroisse Notre-Dame de la Paix",
    diocese: "Archidiocèse de Dakar",
    city: "Dakar",
    cure: "Père Michel Ba",
    vicaire: "Père Joseph Ndiaye",
    catechists: "Fatou Diop, Amadou Fall",
    contactInfo: {
      email: "notre-dame@diocese.sn",
      phone: "+221 33 987 65 43",
      address: "Avenue Léopold Sédar Senghor, Dakar"
    }
  }
];

const initialDonations = [
  {
    donorName: "Famille Diop",
    amount: 50000,
    type: "quete",
    date: "2024-03-15",
    diocese: "Archidiocèse de Dakar",
    parish: "Paroisse Saint-Pierre",
    description: "Don pour la quête dominicale",
    status: "confirmed"
  },
  {
    donorName: "Entreprise Sénégal Telecom",
    amount: 200000,
    type: "denier",
    date: "2024-03-20",
    diocese: "Archidiocèse de Dakar",
    parish: "Paroisse Notre-Dame de la Paix",
    description: "Contribution au denier du culte",
    status: "confirmed"
  }
];

const initialLiturgy = [
  {
    title: "prière dominicale",
    date: "2024-04-07",
    time: "10:00",
    type: "prière",
    diocese: "Archidiocèse de Dakar",
    parish: "Paroisse Saint-Pierre",
    description: "Célébration eucharistique dominicale"
  },
  {
    title: "Office des Ténèbres",
    date: "2024-04-02",
    time: "19:00",
    type: "office",
    diocese: "Archidiocèse de Dakar",
    parish: "Paroisse Notre-Dame de la Paix",
    description: "Office des Ténèbres du Mercredi Saint"
  }
];

async function migrateData() {
  try {
    console.log('🚀 Début de la migration vers Firestore...');

    // Migrer les utilisateurs
    console.log('📝 Migration des utilisateurs...');
    for (const user of initialUsers) {
      await addDoc(collection(db, 'admin_users'), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('✅ Utilisateurs migrés');

    // Migrer les actualités
    console.log('📰 Migration des actualités...');
    for (const news of initialNews) {
      await addDoc(collection(db, 'admin_news'), {
        ...news,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('✅ Actualités migrées');

    // Migrer les paroisses
    console.log('⛪ Migration des paroisses...');
    for (const parish of initialParishes) {
      await addDoc(collection(db, 'admin_parishes'), {
        ...parish,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('✅ Paroisses migrées');

    // Migrer les dons
    console.log('💰 Migration des dons...');
    for (const donation of initialDonations) {
      await addDoc(collection(db, 'admin_donations'), {
        ...donation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('✅ Dons migrés');

    // Migrer la liturgie
    console.log('📖 Migration de la liturgie...');
    for (const liturgy of initialLiturgy) {
      await addDoc(collection(db, 'admin_liturgy'), {
        ...liturgy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('✅ Liturgie migrée');

    console.log('🎉 Migration terminée avec succès !');
    console.log('📋 Collections créées :');
    console.log('  - admin_users');
    console.log('  - admin_news');
    console.log('  - admin_parishes');
    console.log('  - admin_donations');
    console.log('  - admin_liturgy');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

// Exécuter la migration
migrateData();
