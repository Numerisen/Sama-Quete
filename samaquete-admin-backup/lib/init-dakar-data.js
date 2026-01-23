// Script pour initialiser les données de l'Archidiocèse de Dakar
import { initializeApp } from 'firebase/app'
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore'

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAR8kwZE9ats8NmUVbIfTzxOZDzmiyToQQ",
  authDomain: "numerisen-14a03.firebaseapp.com",
  projectId: "numerisen-14a03",
  storageBucket: "numerisen-14a03.firebasestorage.app",
  messagingSenderId: "764890122669",
  appId: "1:764890122669:web:e07cde20ce346bb3b3924",
  measurementId: "G-7KNWL23FBB"
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Données pour l'Archidiocèse de Dakar
const dakarUsers = [
  {
    name: "Mgr Benjamin Ndiaye",
    email: "benjamin.ndiaye@archidiocesedakar.sn",
    role: "admin_diocesan",
    status: "Actif",
    diocese: "Archidiocèse de Dakar",
    phone: "+221 33 821 14 14",
    address: "Avenue Léopold Sédar Senghor, Dakar"
  },
  {
    name: "Père Antoine Diop",
    email: "antoine.diop@archidiocesedakar.sn",
    role: "admin_parishial",
    status: "Actif",
    diocese: "Archidiocèse de Dakar",
    parish: "Paroisse Saint-Pierre",
    phone: "+221 33 123 45 67"
  },
  {
    name: "Sœur Marie Fall",
    email: "marie.fall@archidiocesedakar.sn",
    role: "admin_parishial",
    status: "Actif",
    diocese: "Archidiocèse de Dakar",
    parish: "Paroisse Notre-Dame de la Paix",
    phone: "+221 33 987 65 43"
  },
  {
    name: "Père Jean Sarr",
    email: "jean.sarr@archidiocesedakar.sn",
    role: "admin_parishial",
    status: "Actif",
    diocese: "Archidiocèse de Dakar",
    parish: "Paroisse Sacré-Cœur",
    phone: "+221 33 456 78 90"
  }
]

const dakarParishes = [
  {
    name: "Paroisse Saint-Pierre",
    diocese: "Archidiocèse de Dakar",
    city: "Dakar",
    cure: "Père Antoine Diop",
    vicaire: "Père Michel Ba",
    catechists: "Marie Ndiaye, Paul Fall",
    members: 250,
    phone: "+221 33 123 45 67",
    email: "saint-pierre@archidiocesedakar.sn",
    address: "Rue de la République, Dakar",
    description: "Paroisse historique du centre-ville de Dakar"
  },
  {
    name: "Paroisse Notre-Dame de la Paix",
    diocese: "Archidiocèse de Dakar",
    city: "Dakar",
    cure: "Père Joseph Ndiaye",
    vicaire: "Père Amadou Fall",
    catechists: "Fatou Diop, Saliou Ba",
    members: 180,
    phone: "+221 33 987 65 43",
    email: "notre-dame@archidiocesedakar.sn",
    address: "Avenue Léopold Sédar Senghor, Dakar",
    description: "Paroisse moderne dans le quartier des Almadies"
  },
  {
    name: "Paroisse Sacré-Cœur",
    diocese: "Archidiocèse de Dakar",
    city: "Dakar",
    cure: "Père Jean Sarr",
    vicaire: "Père Modou Diagne",
    catechists: "Aïcha Fall, Mamadou Ndiaye",
    members: 320,
    phone: "+221 33 456 78 90",
    email: "sacre-coeur@archidiocesedakar.sn",
    address: "Rue de la Liberté, Dakar",
    description: "Grande paroisse du quartier de la Médina"
  }
]

const dakarDonations = [
  {
    donorName: "Famille Diop",
    amount: 50000,
    type: "Offrande",
    parish: "Paroisse Saint-Pierre",
    diocese: "Archidiocèse de Dakar",
    status: "Reçu",
    date: "2024-01-15",
    description: "Offrande pour la construction de la nouvelle chapelle",
    phone: "+221 77 123 45 67",
    email: "diop.famille@email.com"
  },
  {
    donorName: "Entreprise Sénégal Telecom",
    amount: 200000,
    type: "Don",
    parish: "Paroisse Notre-Dame de la Paix",
    diocese: "Archidiocèse de Dakar",
    status: "Reçu",
    date: "2024-01-14",
    description: "Don pour l'équipement informatique de la paroisse",
    phone: "+221 33 821 00 00",
    email: "contact@orange.sn"
  },
  {
    donorName: "Association des Jeunes",
    amount: 25000,
    type: "Collecte",
    parish: "Paroisse Sacré-Cœur",
    diocese: "Archidiocèse de Dakar",
    status: "Reçu",
    date: "2024-01-13",
    description: "Collecte pour les activités de jeunesse",
    phone: "+221 77 987 65 43",
    email: "jeunes@sacrecoeur.sn"
  },
  {
    donorName: "Mme Fatou Sall",
    amount: 15000,
    type: "Dîme",
    parish: "Paroisse Saint-Pierre",
    diocese: "Archidiocèse de Dakar",
    status: "Reçu",
    date: "2024-01-12",
    description: "Dîme mensuelle",
    phone: "+221 77 456 78 90",
    email: "fatou.sall@email.com"
  }
]

const dakarNews = [
  {
    title: "prière de Pâques 2024 - Archidiocèse de Dakar",
    excerpt: "Célébration solennelle de la Résurrection du Christ",
    content: "Rejoignez-nous pour la célébration de la prière de Pâques dans toutes les paroisses de l'Archidiocèse de Dakar...",
    date: "2024-03-31",
    time: "10:00",
    location: "Cathédrale de Dakar",
    category: "Événement",
    priority: "high",
    diocese: "Archidiocèse de Dakar",
    published: true
  },
  {
    title: "Collecte pour les nécessiteux - Carême 2024",
    excerpt: "Soutenez notre action caritative pendant le Carême",
    content: "Votre générosité permet d'aider les plus démunis de notre diocèse...",
    date: "2024-04-15",
    time: "14:00",
    location: "Centre paroissial",
    category: "Solidarité",
    priority: "medium",
    diocese: "Archidiocèse de Dakar",
    published: true
  },
  {
    title: "Formation des catéchistes 2024",
    excerpt: "Session de formation pour les catéchistes du diocèse",
    content: "Une session de formation intensive est organisée pour tous les catéchistes...",
    date: "2024-02-20",
    time: "09:00",
    location: "Séminaire Saint-Joseph",
    category: "Formation",
    priority: "medium",
    diocese: "Archidiocèse de Dakar",
    published: false
  }
]

async function initDakarData() {
  try {
    console.log('🚀 Initialisation des données pour l\'Archidiocèse de Dakar...')

    // Ajouter les utilisateurs
    console.log('👥 Ajout des utilisateurs...')
    for (const user of dakarUsers) {
      await addDoc(collection(db, 'admin_users'), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
    console.log('✅ Utilisateurs ajoutés')

    // Ajouter les paroisses
    console.log('⛪ Ajout des paroisses...')
    for (const parish of dakarParishes) {
      await addDoc(collection(db, 'admin_parishes'), {
        ...parish,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
    console.log('✅ Paroisses ajoutées')

    // Ajouter les dons
    console.log('💰 Ajout des dons...')
    for (const donation of dakarDonations) {
      await addDoc(collection(db, 'admin_donations'), {
        ...donation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
    console.log('✅ Dons ajoutés')

    // Ajouter les actualités
    console.log('📰 Ajout des actualités...')
    for (const news of dakarNews) {
      await addDoc(collection(db, 'admin_news'), {
        ...news,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
    console.log('✅ Actualités ajoutées')

    console.log('🎉 Données de l\'Archidiocèse de Dakar initialisées avec succès !')
    console.log(`📊 Résumé:`)
    console.log(`  - ${dakarUsers.length} utilisateurs`)
    console.log(`  - ${dakarParishes.length} paroisses`)
    console.log(`  - ${dakarDonations.length} dons`)
    console.log(`  - ${dakarNews.length} actualités`)

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
  }
}

// Exécuter le script
initDakarData()
