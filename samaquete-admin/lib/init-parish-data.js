const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  setDoc
} = require('firebase/firestore');

// Configuration Firebase (remplacez par votre configuration)
const firebaseConfig = {
  // Votre configuration Firebase ici
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ID de la paroisse de test
const PARISH_ID = "paroisse-saint-jean-bosco";
const PARISH_NAME = "Paroisse Saint Jean Bosco";

// Données de test pour les heures de prières
const prayerTimes = [
  {
    name: "Messe du matin",
    time: "07:00",
    days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
    active: true,
    description: "Messe quotidienne du matin",
    parishId: PARISH_ID
  },
  {
    name: "Messe du dimanche",
    time: "10:00",
    days: ["Dimanche"],
    active: true,
    description: "Messe dominicale principale",
    parishId: PARISH_ID
  },
  {
    name: "Vêpres",
    time: "18:00",
    days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    active: true,
    description: "Office des vêpres",
    parishId: PARISH_ID
  },
  {
    name: "Messe du soir",
    time: "19:00",
    days: ["Samedi"],
    active: false,
    description: "Messe anticipée du dimanche",
    parishId: PARISH_ID
  }
];

// Données de test pour les dons
const donations = [
  {
    fullname: "Marie Diop",
    amount: 5000,
    date: "2024-01-15",
    type: "Offrande",
    description: "Don pour les pauvres",
    phone: "+221 77 123 45 67",
    status: "confirmed",
    parishId: PARISH_ID
  },
  {
    fullname: "Jean Ndiaye",
    amount: 10000,
    date: "2024-01-14",
    type: "Dîme",
    phone: "+221 78 234 56 78",
    status: "confirmed",
    parishId: PARISH_ID
  },
  {
    fullname: "Fatou Sarr",
    amount: 2500,
    date: "2024-01-13",
    type: "Offrande",
    description: "Don pour la construction",
    status: "pending",
    parishId: PARISH_ID
  },
  {
    fullname: "Amadou Ba",
    amount: 15000,
    date: "2024-01-12",
    type: "Dîme",
    phone: "+221 76 345 67 89",
    status: "confirmed",
    parishId: PARISH_ID
  },
  {
    fullname: "Aïcha Fall",
    amount: 7500,
    date: "2024-01-11",
    type: "Offrande",
    description: "Don pour les activités",
    status: "confirmed",
    parishId: PARISH_ID
  }
];

// Données de test pour les activités
const activities = [
  {
    title: "Messe dominicale",
    description: "Messe principale du dimanche avec la communauté",
    date: "2024-01-21",
    time: "10:00",
    location: "Église principale",
    type: "Liturgie",
    status: "upcoming",
    participants: 150,
    maxParticipants: 200,
    organizer: "Père Jean",
    contact: "+221 77 123 45 67",
    parishId: PARISH_ID
  },
  {
    title: "Catéchisme enfants",
    description: "Séance de catéchisme pour les enfants de 7-12 ans",
    date: "2024-01-22",
    time: "16:00",
    location: "Salle de catéchisme",
    type: "Formation",
    status: "upcoming",
    participants: 25,
    maxParticipants: 30,
    organizer: "Sœur Marie",
    contact: "+221 78 234 56 78",
    parishId: PARISH_ID
  },
  {
    title: "Groupe de prière",
    description: "Réunion hebdomadaire du groupe de prière",
    date: "2024-01-23",
    time: "19:00",
    location: "Chapelle",
    type: "Spiritualité",
    status: "upcoming",
    participants: 12,
    organizer: "Mme Diop",
    contact: "+221 76 345 67 89",
    parishId: PARISH_ID
  },
  {
    title: "Collecte pour les pauvres",
    description: "Collecte de vêtements et nourriture pour les familles démunies",
    date: "2024-01-20",
    time: "14:00",
    location: "Cour de l'église",
    type: "Charité",
    status: "completed",
    participants: 8,
    organizer: "Comité de charité",
    contact: "+221 77 456 78 90",
    parishId: PARISH_ID
  }
];

// Données de test pour les actualités
const news = [
  {
    title: "Messe de dimanche",
    content: "Nous vous invitons à participer à la messe dominicale qui aura lieu ce dimanche à 10h00. Cette célébration sera animée par la chorale paroissiale.",
    excerpt: "Invitation à la messe dominicale avec la chorale paroissiale",
    category: "Liturgie",
    published: true,
    parishId: PARISH_ID
  },
  {
    title: "Retraite spirituelle",
    content: "Une retraite spirituelle de 3 jours est organisée pour les jeunes adultes du 25 au 27 janvier. Inscriptions ouvertes au presbytère.",
    excerpt: "Retraite spirituelle pour les jeunes adultes",
    category: "Spiritualité",
    published: true,
    parishId: PARISH_ID
  },
  {
    title: "Collecte pour les pauvres",
    content: "Nous organisons une collecte de vêtements et de nourriture pour aider les familles démunies de notre paroisse. Votre générosité est la bienvenue.",
    excerpt: "Collecte de vêtements et nourriture pour les familles démunies",
    category: "Charité",
    published: false,
    parishId: PARISH_ID
  }
];

// Données de test pour les utilisateurs paroissiaux
const users = [
  {
    name: "Moussa Diallo",
    email: "moussa.diallo@email.com",
    phone: "+221 77 111 22 33",
    role: "fidele",
    status: "active",
    parishId: PARISH_ID
  },
  {
    name: "Khadija Mbaye",
    email: "khadija.mbaye@email.com",
    phone: "+221 78 222 33 44",
    role: "catechiste",
    status: "active",
    parishId: PARISH_ID
  },
  {
    name: "Ibrahima Sow",
    email: "ibrahima.sow@email.com",
    phone: "+221 76 333 44 55",
    role: "animateur",
    status: "active",
    parishId: PARISH_ID
  },
  {
    name: "Admin Paroisse",
    email: "admin.paroisse@email.com",
    phone: "+221 77 444 55 66",
    role: "admin",
    status: "active",
    parishId: PARISH_ID
  }
];

// Données de test pour les paramètres paroissiaux
const settings = {
  parishId: PARISH_ID,
  name: PARISH_NAME,
  address: "Rue de la Paix, Dakar, Sénégal",
  phone: "+221 33 123 45 67",
  email: "contact@saintjeanbosco.sn",
  website: "www.saintjeanbosco.sn",
  description: "Paroisse Saint Jean Bosco, une communauté vivante au service de l'Évangile",
  socialMedia: {
    facebook: "https://facebook.com/saintjeanbosco",
    twitter: "https://twitter.com/saintjeanbosco",
    instagram: "https://instagram.com/saintjeanbosco"
  }
};

// Fonction pour ajouter les données
async function initializeParishData() {
  try {
    console.log('🚀 Initialisation des données paroissiales...');

    // Ajouter les heures de prières
    console.log('📅 Ajout des heures de prières...');
    for (const prayer of prayerTimes) {
      await addDoc(collection(db, 'parish_prayer_times'), {
        ...prayer,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('✅ Heures de prières ajoutées');

    // Ajouter les dons
    console.log('💰 Ajout des dons...');
    for (const donation of donations) {
      await addDoc(collection(db, 'parish_donations'), {
        ...donation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('✅ Dons ajoutés');

    // Ajouter les activités
    console.log('🎯 Ajout des activités...');
    for (const activity of activities) {
      await addDoc(collection(db, 'parish_activities'), {
        ...activity,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('✅ Activités ajoutées');

    // Ajouter les actualités
    console.log('📰 Ajout des actualités...');
    for (const newsItem of news) {
      await addDoc(collection(db, 'parish_news'), {
        ...newsItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('✅ Actualités ajoutées');

    // Ajouter les utilisateurs
    console.log('👥 Ajout des utilisateurs...');
    for (const user of users) {
      await addDoc(collection(db, 'parish_users'), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('✅ Utilisateurs ajoutés');

    // Ajouter les paramètres
    console.log('⚙️ Ajout des paramètres...');
    await addDoc(collection(db, 'parish_settings'), {
      ...settings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Paramètres ajoutés');

    console.log('🎉 Initialisation terminée avec succès!');
    console.log(`📊 Données créées pour la paroisse: ${PARISH_NAME}`);
    console.log(`🆔 ID de la paroisse: ${PARISH_ID}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  }
}

// Exécuter l'initialisation
initializeParishData();
