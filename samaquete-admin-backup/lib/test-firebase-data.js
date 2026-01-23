// Script pour tester la récupération des données Firebase
import { initializeApp } from 'firebase/app'
import { collection, getDocs, getFirestore } from 'firebase/firestore'

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

async function testFirebaseData() {
  console.log('🔍 Test de récupération des données Firebase...')
  
  try {
    // Test des événements
    console.log('\n📅 Test des événements de dons:')
    const eventsRef = collection(db, 'donationEvents')
    const eventsSnapshot = await getDocs(eventsRef)
    console.log(`Nombre d'événements trouvés: ${eventsSnapshot.size}`)
    
    eventsSnapshot.forEach(doc => {
      const data = doc.data()
      console.log(`- ${data.title} (${data.type}) - Actif: ${data.isActive}`)
    })
    
    // Test des dons
    console.log('\n💰 Test des dons:')
    const donationsRef = collection(db, 'donations')
    const donationsSnapshot = await getDocs(donationsRef)
    console.log(`Nombre de dons trouvés: ${donationsSnapshot.size}`)
    
    donationsSnapshot.forEach(doc => {
      const data = doc.data()
      console.log(`- ${data.donorName}: ${data.amount} FCFA (${data.type})`)
    })
    
    // Test des paroisses
    console.log('\n⛪ Test des paroisses:')
    const parishesRef = collection(db, 'parishes')
    const parishesSnapshot = await getDocs(parishesRef)
    console.log(`Nombre de paroisses trouvées: ${parishesSnapshot.size}`)
    
    parishesSnapshot.forEach(doc => {
      const data = doc.data()
      console.log(`- ${data.name}`)
    })
    
    console.log('\n✅ Test terminé avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

// Exécuter le test
testFirebaseData().catch(console.error)