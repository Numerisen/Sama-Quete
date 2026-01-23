// Script pour tester la création d'un événement depuis l'admin
import { initializeApp } from 'firebase/app'
import { addDoc, collection, getDocs, getFirestore, serverTimestamp } from 'firebase/firestore'

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

async function testCreateEvent() {
  console.log('🧪 Test de création d\'événement depuis l\'admin...')
  
  try {
    // Créer un événement de test
    const eventData = {
      title: "Test - prière de Pâques 2025",
      description: "Collecte pour les célébrations de Pâques dans notre paroisse",
      type: "prière",
      parishId: "parish1",
      dioceseId: "diocese1",
      targetAmount: 750000,
      currentAmount: 0,
      startDate: new Date("2025-04-01"),
      endDate: new Date("2025-04-30"),
      isActive: true,
      createdBy: "IhVf2ekzGNPX5LWzaaTGHQHzMTk1",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    console.log('📝 Création de l\'événement...')
    const eventsRef = collection(db, 'donationEvents')
    const docRef = await addDoc(eventsRef, eventData)
    
    console.log(`✅ Événement créé avec l'ID: ${docRef.id}`)
    
    // Vérifier que l'événement a été créé
    console.log('\n🔍 Vérification de la création...')
    const snapshot = await getDocs(eventsRef)
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    const createdEvent = events.find(e => e.id === docRef.id)
    if (createdEvent) {
      console.log('✅ Événement trouvé dans Firebase:')
      console.log(`   - Titre: ${createdEvent.title}`)
      console.log(`   - Type: ${createdEvent.type}`)
      console.log(`   - Paroisse: ${createdEvent.parishId}`)
      console.log(`   - Montant cible: ${createdEvent.targetAmount} FCFA`)
      console.log(`   - Actif: ${createdEvent.isActive}`)
      console.log(`   - Créé par: ${createdEvent.createdBy}`)
    } else {
      console.log('❌ Événement non trouvé après création')
    }
    
    console.log(`\n📊 Total d'événements dans Firebase: ${events.length}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error)
  }
}

// Exécuter le test
testCreateEvent().catch(console.error)