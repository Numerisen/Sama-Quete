import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAR8kwZE9ats8NmUVbIfTzxOZDzmiyToQQ",
  authDomain: "numerisen-14a03.firebaseapp.com",
  projectId: "numerisen-14a03",
  storageBucket: "numerisen-14a03.firebasestorage.app",
  messagingSenderId: "764890122669",
  appId: "1:764890122669:web:8b8c8c8c8c8c8c8c8c8c8c8c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dioceseName = "Archidiocèse de Dakar";

// Types de dons par défaut
const donationTypesData = [
  {
    name: "Quête dominicale",
    description: "Collecte lors de la messe dominicale",
    suggestedAmount: 1000,
    isActive: true,
    diocese: dioceseName
  },
  {
    name: "Denier du culte",
    description: "Contribution mensuelle pour le fonctionnement de l'Église",
    suggestedAmount: 5000,
    isActive: true,
    diocese: dioceseName
  },
  {
    name: "Cierge pascal",
    description: "Offrande pour les cierges de Pâques",
    suggestedAmount: 2000,
    isActive: true,
    diocese: dioceseName
  },
  {
    name: "Messe intentionnelle",
    description: "Offrande pour une messe avec intention particulière",
    suggestedAmount: 10000,
    isActive: true,
    diocese: dioceseName
  },
  {
    name: "Aide aux pauvres",
    description: "Don pour les œuvres caritatives et l'aide aux démunis",
    suggestedAmount: 0,
    isActive: true,
    diocese: dioceseName
  },
  {
    name: "Construction d'église",
    description: "Contribution pour la construction ou rénovation d'églises",
    suggestedAmount: 0,
    isActive: true,
    diocese: dioceseName
  },
  {
    name: "Formation des catéchistes",
    description: "Don pour la formation et l'éducation religieuse",
    suggestedAmount: 0,
    isActive: true,
    diocese: dioceseName
  },
  {
    name: "Missions",
    description: "Soutien aux missions et évangélisation",
    suggestedAmount: 0,
    isActive: true,
    diocese: dioceseName
  }
];

async function initializeDonationTypes() {
  console.log('🚀 Initialisation des types de dons pour l\'Archidiocèse de Dakar...');
  
  try {
    // Ajouter chaque type de don
    for (const typeData of donationTypesData) {
      const docRef = await addDoc(collection(db, 'admin_donation_types'), {
        ...typeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Type de don ajouté: ${typeData.name} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 Tous les types de dons ont été initialisés avec succès !');
    console.log(`📊 ${donationTypesData.length} types de dons créés pour ${dioceseName}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des types de dons:', error);
  }
}

initializeDonationTypes();
