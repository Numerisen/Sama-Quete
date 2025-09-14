// Script pour tester la connexion Firebase côté mobile
import { initializeApp } from 'firebase/app'
import { collection, getDocs, getFirestore } from 'firebase/firestore'

// Configuration Firebase - même que dans firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyAR8kwZE9ats8NmUVbIfTzxOZDzmiyToQQ",
  authDomain: "numerisen-14a03.firebaseapp.com",
  projectId: "numerisen-14a03",
  storageBucket: "numerisen-14a03.firebasestorage.app",
  messagingSenderId: "764890122669",
  appId: "1:764890122669:android:a906113ac4b4b37e3b3924"
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function testFirebaseConnection() {
  console.log('🧪 Test de connexion Firebase côté mobile...')
  console.log('📱 Configuration:')
  console.log(`   - Project ID: ${firebaseConfig.projectId}`)
  console.log(`   - App ID: ${firebaseConfig.appId}`)
  console.log(`   - Auth Domain: ${firebaseConfig.authDomain}`)
  
  try {
    // Test de connexion aux diocèses
    console.log('\n🔍 Test de lecture des diocèses...')
    const diocesesRef = collection(db, 'dioceses')
    const diocesesSnapshot = await getDocs(diocesesRef)
    
    console.log(`✅ Connexion réussie ! ${diocesesSnapshot.size} diocèses trouvés:`)
    diocesesSnapshot.forEach((doc) => {
      const data = doc.data()
      console.log(`   - ${data.name} (${data.city})`)
    })
    
    // Test de connexion aux paroisses
    console.log('\n🔍 Test de lecture des paroisses...')
    const parishesRef = collection(db, 'parishes')
    const parishesSnapshot = await getDocs(parishesRef)
    
    console.log(`✅ ${parishesSnapshot.size} paroisses trouvées:`)
    parishesSnapshot.forEach((doc) => {
      const data = doc.data()
      console.log(`   - ${data.name} (${data.city})`)
    })
    
    // Test de connexion aux événements de dons
    console.log('\n🔍 Test de lecture des événements de dons...')
    const eventsRef = collection(db, 'donationEvents')
    const eventsSnapshot = await getDocs(eventsRef)
    
    console.log(`✅ ${eventsSnapshot.size} événements de dons trouvés:`)
    eventsSnapshot.forEach((doc) => {
      const data = doc.data()
      console.log(`   - ${data.title} (${data.type})`)
    })
    
    console.log('\n🎉 Tous les tests de connexion Firebase ont réussi !')
    console.log('📱 L\'application mobile peut maintenant accéder aux données Firebase')
    
  } catch (error) {
    console.error('❌ Erreur de connexion Firebase:', error)
    console.error('🔧 Vérifiez:')
    console.error('   1. La configuration Firebase')
    console.error('   2. Les règles Firestore')
    console.error('   3. La connexion internet')
  }
}

// Exécuter le test
testFirebaseConnection().catch(console.error)