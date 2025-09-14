// Script pour initialiser les données de dons dans Firebase
import { initializeApp } from 'firebase/app'
import { addDoc, collection, doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAR8kwZE9ats8NmUVbIfTzxOZDzmiyToQQ",
  authDomain: "numerisen-14a03.firebaseapp.com",
  projectId: "numerisen-14a03",
  storageBucket: "numerisen-14a03.firebasestorage.app",
  messagingSenderId: "764890122669",
  appId: "1:764890122669:web:6e07cde20ce346bb3b3924",
  measurementId: "G-7KNWL23FBB"
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Données de test pour les paroisses
const parishes = [
  { id: "parish1", name: "Paroisse Saint-Joseph de Medina", dioceseId: "diocese1" },
  { id: "parish2", name: "Paroisse Sainte-Anne de Thiès", dioceseId: "diocese1" },
  { id: "parish3", name: "Paroisse Sacré-Cœur de Kaolack", dioceseId: "diocese1" },
  { id: "parish4", name: "Paroisse Notre-Dame de Dakar", dioceseId: "diocese1" },
  { id: "parish5", name: "Paroisse Saint-Pierre de Ziguinchor", dioceseId: "diocese1" }
]

// Données de test pour les diocèses
const dioceses = [
  { id: "diocese1", name: "Diocèse de Dakar", location: "Dakar, Sénégal", bishop: "Mgr Benjamin Ndiaye" }
]

// Fonction pour créer un diocèse
async function createDiocese(diocese) {
  const dioceseRef = doc(db, 'dioceses', diocese.id)
  
  const dioceseData = {
    name: diocese.name,
    location: diocese.location,
    bishop: diocese.bishop,
    contactInfo: {
      email: "contact@diocesedakar.org",
      phone: "+221 33 821 20 00",
      address: "Place de l'Indépendance, Dakar"
    },
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  try {
    await setDoc(dioceseRef, dioceseData)
    console.log(`✅ Diocèse créé: ${diocese.name}`)
    return true
  } catch (error) {
    console.error(`❌ Erreur diocèse ${diocese.name}:`, error)
    return false
  }
}

// Fonction pour créer une paroisse
async function createParish(parish) {
  const parishRef = doc(db, 'parishes', parish.id)
  
  const parishData = {
    name: parish.name,
    dioceseId: parish.dioceseId,
    location: parish.name.split(' de ')[1] || "Sénégal",
    priest: `Père ${parish.name.split(' ')[1]}`,
    contactInfo: {
      email: `contact@${parish.name.toLowerCase().replace(/\s+/g, '')}.org`,
      phone: "+221 33 123 45 67",
      address: parish.name
    },
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  try {
    await setDoc(parishRef, parishData)
    console.log(`✅ Paroisse créée: ${parish.name}`)
    return true
  } catch (error) {
    console.error(`❌ Erreur paroisse ${parish.name}:`, error)
    return false
  }
}

// Fonction pour créer un événement de don
async function createDonationEvent(event) {
  try {
    const eventsRef = collection(db, 'donationEvents')
    const docRef = await addDoc(eventsRef, {
      ...event,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log(`✅ Événement créé: ${event.title}`)
    return docRef.id
  } catch (error) {
    console.error(`❌ Erreur événement ${event.title}:`, error)
    return null
  }
}

// Fonction pour créer un don
async function createDonation(donation) {
  try {
    const donationsRef = collection(db, 'donations')
    const docRef = await addDoc(donationsRef, {
      ...donation,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log(`✅ Don créé: ${donation.donorName} - ${donation.amount} FCFA`)
    return docRef.id
  } catch (error) {
    console.error(`❌ Erreur don ${donation.donorName}:`, error)
    return null
  }
}

// Initialiser toutes les données
async function initializeData() {
  console.log('🚀 Initialisation des données de dons...')
  
  // Créer les diocèses
  for (const diocese of dioceses) {
    await createDiocese(diocese)
  }
  
  // Créer les paroisses
  for (const parish of parishes) {
    await createParish(parish)
  }
  
  // Créer des événements de dons
  const events = [
    {
      title: "Messe d'intention pour les défunts",
      description: "Collecte pour les messes d'intention du mois de novembre",
      type: "messe",
      parishId: "parish1",
      dioceseId: "diocese1",
      targetAmount: 500000,
      currentAmount: 0,
      startDate: new Date("2024-11-01"),
      endDate: new Date("2024-11-30"),
      isActive: true,
      createdBy: "IhVf2ekzGNPX5LWzaaTGHQHzMTk1"
    },
    {
      title: "Quête dominicale - Construction école",
      description: "Collecte pour la construction d'une nouvelle école paroissiale",
      type: "quete",
      parishId: "parish2",
      dioceseId: "diocese1",
      targetAmount: 2000000,
      currentAmount: 0,
      startDate: new Date("2024-10-01"),
      endDate: new Date("2024-12-31"),
      isActive: true,
      createdBy: "IhVf2ekzGNPX5LWzaaTGHQHzMTk1"
    },
    {
      title: "Événement spécial - Noël 2024",
      description: "Collecte pour l'organisation des célébrations de Noël",
      type: "evenement",
      parishId: "parish3",
      dioceseId: "diocese1",
      targetAmount: 1000000,
      currentAmount: 0,
      startDate: new Date("2024-12-01"),
      endDate: new Date("2024-12-25"),
      isActive: true,
      createdBy: "IhVf2ekzGNPX5LWzaaTGHQHzMTk1"
    }
  ]
  
  const eventIds = []
  for (const event of events) {
    const eventId = await createDonationEvent(event)
    if (eventId) eventIds.push(eventId)
  }
  
  // Créer des dons de test
  const donations = [
    {
      eventId: eventIds[0],
      donorName: "Fatou Ndiaye",
      donorPhone: "+221 77 123 45 67",
      donorEmail: "fatou.ndiaye@email.com",
      amount: 10000,
      type: "messe",
      paymentMethod: "cb",
      parishId: "parish1",
      dioceseId: "diocese1",
      message: "Pour le repos de l'âme de mon père",
      status: "completed"
    },
    {
      eventId: eventIds[1],
      donorName: "Mamadou Diop",
      donorPhone: "+221 76 987 65 43",
      donorEmail: "mamadou.diop@email.com",
      amount: 25000,
      type: "quete",
      paymentMethod: "wave",
      parishId: "parish2",
      dioceseId: "diocese1",
      message: "Pour l'éducation des enfants",
      status: "completed"
    },
    {
      eventId: eventIds[2],
      donorName: "Awa Sarr",
      donorPhone: "+221 70 555 12 34",
      donorEmail: "awa.sarr@email.com",
      amount: 5000,
      type: "evenement",
      paymentMethod: "orange",
      parishId: "parish3",
      dioceseId: "diocese1",
      message: "Pour les célébrations de Noël",
      status: "completed"
    },
    {
      eventId: eventIds[0],
      donorName: "Ibrahima Ba",
      donorPhone: "+221 78 456 78 90",
      donorEmail: "ibrahima.ba@email.com",
      amount: 15000,
      type: "messe",
      paymentMethod: "especes",
      parishId: "parish1",
      dioceseId: "diocese1",
      message: "Pour ma famille",
      status: "completed"
    },
    {
      eventId: eventIds[1],
      donorName: "Mariama Diallo",
      donorPhone: "+221 77 234 56 78",
      donorEmail: "mariama.diallo@email.com",
      amount: 30000,
      type: "quete",
      paymentMethod: "cb",
      parishId: "parish2",
      dioceseId: "diocese1",
      message: "Pour l'avenir de nos enfants",
      status: "completed"
    }
  ]
  
  for (const donation of donations) {
    await createDonation(donation)
  }
  
  console.log('🎉 Initialisation terminée !')
  console.log('📋 Vous pouvez maintenant :')
  console.log('   - Voir les événements sur http://localhost:3000/admin/donations/events')
  console.log('   - Voir les dons sur http://localhost:3000/admin/donations')
  console.log('   - Tester l\'app mobile avec ces données')
}

// Exécuter le script
initializeData().catch(console.error)