// Script pour initialiser les diocèses dans Firebase
import { initializeApp } from 'firebase/app'
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore'

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

const diocesesData = [
  {
    name: "Archidiocèse de Dakar",
    location: "Dakar, Sénégal",
    city: "Dakar",
    type: "Archevêché métropolitain",
    bishop: "Mgr Benjamin Ndiaye",
    contactInfo: {
      email: "contact@archidiocesedakar.sn",
      phone: "+221 33 821 14 14",
      address: "Avenue Léopold Sédar Senghor, Dakar"
    },
    isActive: true
  },
  {
    name: "Diocèse de Thiès",
    location: "Thiès, Sénégal",
    city: "Thiès",
    type: "Diocèse",
    bishop: "Mgr André Gueye",
    contactInfo: {
      email: "contact@diocesethies.sn",
      phone: "+221 33 951 12 34",
      address: "Rue de la République, Thiès"
    },
    isActive: true
  },
  {
    name: "Diocèse de Kaolack",
    location: "Kaolack, Sénégal",
    city: "Kaolack",
    type: "Diocèse",
    bishop: "Mgr Martin Boucar Tine",
    contactInfo: {
      email: "contact@diocesekaolack.sn",
      phone: "+221 33 941 23 45",
      address: "Avenue Blaise Diagne, Kaolack"
    },
    isActive: true
  },
  {
    name: "Diocèse de Ziguinchor",
    location: "Ziguinchor, Sénégal",
    city: "Ziguinchor",
    type: "Diocèse",
    bishop: "Mgr Paul Abel Mamba",
    contactInfo: {
      email: "contact@dioceseziguinchor.sn",
      phone: "+221 33 991 34 56",
      address: "Rue de la Paix, Ziguinchor"
    },
    isActive: true
  },
  {
    name: "Diocèse de Kolda",
    location: "Kolda, Sénégal",
    city: "Kolda",
    type: "Diocèse",
    bishop: "Mgr Jean-Pierre Bassène",
    contactInfo: {
      email: "contact@diocesekolda.sn",
      phone: "+221 33 991 45 67",
      address: "Avenue de l'Indépendance, Kolda"
    },
    isActive: true
  },
  {
    name: "Diocèse de Tambacounda",
    location: "Tambacounda, Sénégal",
    city: "Tambacounda",
    type: "Diocèse",
    bishop: "Mgr Paul Abel Mamba",
    contactInfo: {
      email: "contact@diocesetambacounda.sn",
      phone: "+221 33 991 56 78",
      address: "Rue de la Liberté, Tambacounda"
    },
    isActive: true
  },
  {
    name: "Diocèse de Saint-Louis du Sénégal",
    location: "Saint-Louis, Sénégal",
    city: "Saint-Louis",
    type: "Diocèse",
    bishop: "Mgr Ernest Sambou",
    contactInfo: {
      email: "contact@diocesestlouis.sn",
      phone: "+221 33 991 67 89",
      address: "Avenue Jean Mermoz, Saint-Louis"
    },
    isActive: true
  }
]

async function initDioceses() {
  console.log('🚀 Initialisation des diocèses dans Firebase...')
  
  try {
    const diocesesRef = collection(db, 'dioceses')
    
    for (const diocese of diocesesData) {
      const docRef = await addDoc(diocesesRef, {
        ...diocese,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      console.log(`✅ Diocèse créé: ${diocese.name} (ID: ${docRef.id})`)
    }
    
    console.log('🎉 Tous les diocèses ont été initialisés avec succès !')
    console.log('📋 Vous pouvez maintenant créer des paroisses dans l\'interface admin')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
  }
}

// Exécuter le script
initDioceses().catch(console.error)