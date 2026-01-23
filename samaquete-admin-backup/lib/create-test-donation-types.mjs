import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Configuration Firebase (à adapter avec vos vraies credentials)
const firebaseConfig = {
  apiKey: "AIzaSyDgLyN_XqPQm9bfp2F7y9dGEkNhHDhJHk4",
  authDomain: "sama-quete.firebaseapp.com",
  projectId: "sama-quete",
  storageBucket: "sama-quete.firebasestorage.app",
  messagingSenderId: "1045326893063",
  appId: "1:1045326893063:web:4a16f19f10e43e2b6d8f71",
  measurementId: "G-Z4VEB6XTJM"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createDonationTypes() {
  try {
    // L'ID de la paroisse "Paroisse Saint Jean BOSCO"
    const parishId = 'BRVgyxJZA6OjBt5VZszs';
    
    console.log('📦 Création des types de dons pour la paroisse...');
    
    const donationTypes = [
      {
        parishId,
        name: 'Quête dominicale',
        description: 'Contribution hebdomadaire pour soutenir les activités de la paroisse',
        icon: 'heart',
        defaultAmounts: [1000, 5000, 10000, 25000],
        active: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        parishId,
        name: 'Denier du culte',
        description: 'Participation annuelle au fonctionnement du diocèse',
        icon: 'church',
        defaultAmounts: [5000, 15000, 30000, 50000],
        active: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        parishId,
        name: 'Offrande pour les pauvres',
        description: 'Solidarité avec les personnes en difficulté',
        icon: 'gift',
        defaultAmounts: [2000, 5000, 10000, 20000],
        active: true,
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        parishId,
        name: 'Travaux de rénovation',
        description: 'Contribution pour l\'entretien et la rénovation de l\'église',
        icon: 'users',
        defaultAmounts: [10000, 25000, 50000, 100000],
        active: true,
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    for (const type of donationTypes) {
      const docRef = await addDoc(collection(db, 'parish_donation_types'), type);
      console.log(`✅ Type de don "${type.name}" créé avec l'ID: ${docRef.id}`);
    }
    
    console.log('\n🎉 Tous les types de dons ont été créés avec succès!');
    console.log(`\n📋 Résumé:`);
    console.log(`- Parish ID: ${parishId}`);
    console.log(`- Nombre de types créés: ${donationTypes.length}`);
    console.log(`\n💡 Vous pouvez maintenant:`);
    console.log(`1. Aller sur http://localhost:3000/adminparoisse/donation-types`);
    console.log(`2. Modifier/ajouter des types de dons`);
    console.log(`3. Les voir apparaître dans l'app mobile!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création des types de dons:', error);
    process.exit(1);
  }
}

createDonationTypes();

