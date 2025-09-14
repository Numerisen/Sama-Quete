// Script pour tester la création d'une paroisse
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

async function testParishCreation() {
  console.log('🧪 Test de création d\'une paroisse...')
  
  try {
    // Créer une paroisse de test
    const parishData = {
      name: "Paroisse Notre-Dame de la Paix",
      dioceseId: "diocese1", // ID du diocèse existant
      dioceseName: "Diocèse de Dakar",
      location: "Dakar, Sénégal",
      city: "Dakar",
      priest: "Père Michel Diop",
      vicaire: "Père Jean Baptiste",
      catechists: "Sœur Marie, M. Fall, Mme Sarr",
      contactInfo: {
        email: "contact@notredamedelapaix.org",
        phone: "+221 33 123 45 67",
        address: "Avenue Léopold Sédar Senghor, Dakar"
      },
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    console.log('📝 Création de la paroisse...')
    const parishesRef = collection(db, 'parishes')
    const docRef = await addDoc(parishesRef, parishData)
    
    console.log(`✅ Paroisse créée avec l'ID: ${docRef.id}`)
    
    // Vérifier que la paroisse a été créée
    console.log('\n🔍 Vérification de la création...')
    const snapshot = await getDocs(parishesRef)
    const parishes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    const createdParish = parishes.find(p => p.id === docRef.id)
    if (createdParish) {
      console.log('✅ Paroisse trouvée dans Firebase:')
      console.log(`   - Nom: ${createdParish.name}`)
      console.log(`   - Diocèse: ${createdParish.dioceseName}`)
      console.log(`   - Ville: ${createdParish.city}`)
      console.log(`   - Curé: ${createdParish.priest}`)
      console.log(`   - Vicaire: ${createdParish.vicaire}`)
      console.log(`   - Email: ${createdParish.contactInfo?.email}`)
      console.log(`   - Actif: ${createdParish.isActive}`)
    } else {
      console.log('❌ Paroisse non trouvée après création')
    }
    
    console.log(`\n📊 Total de paroisses dans Firebase: ${parishes.length}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error)
  }
}

// Exécuter le test
testParishCreation().catch(console.error)