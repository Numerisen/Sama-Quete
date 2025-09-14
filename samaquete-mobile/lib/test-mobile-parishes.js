// Script pour tester la récupération des paroisses côté mobile
import { initializeApp } from 'firebase/app'
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore'

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

async function testMobileParishes() {
  console.log('🧪 Test de récupération des paroisses côté mobile...')
  
  try {
    // Test de récupération des paroisses actives
    console.log('\n🔍 Récupération des paroisses actives...')
    const parishesRef = collection(db, 'parishes')
    const q = query(parishesRef, where('isActive', '==', true))
    
    const snapshot = await getDocs(q)
    const parishes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => a.name.localeCompare(b.name))
    
    console.log(`✅ ${parishes.length} paroisses actives trouvées:`)
    parishes.forEach((parish, index) => {
      console.log(`   ${index + 1}. ${parish.name}`)
      console.log(`      - Ville: ${parish.city}`)
      console.log(`      - Diocèse: ${parish.dioceseName}`)
      console.log(`      - Curé: ${parish.priest}`)
      console.log(`      - ID: ${parish.id}`)
      console.log('')
    })
    
    // Test de récupération des diocèses
    console.log('\n🔍 Récupération des diocèses...')
    const diocesesRef = collection(db, 'dioceses')
    const diocesesQuery = query(diocesesRef, where('isActive', '==', true))
    
    const diocesesSnapshot = await getDocs(diocesesQuery)
    const dioceses = diocesesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => a.name.localeCompare(b.name))
    
    console.log(`✅ ${dioceses.length} diocèses actifs trouvés:`)
    dioceses.forEach((diocese, index) => {
      console.log(`   ${index + 1}. ${diocese.name} (${diocese.city})`)
    })
    
    console.log('\n🎉 Test réussi ! L\'application mobile peut maintenant récupérer les paroisses depuis Firebase')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

// Exécuter le test
testMobileParishes().catch(console.error)