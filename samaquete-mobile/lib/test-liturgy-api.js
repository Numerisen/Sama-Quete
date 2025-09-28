/**
 * Script de test pour l'API des textes liturgiques
 * Utilisez ce script pour tester la connexion à votre API Python
 */

const https = require('https');
const http = require('http');

// Configuration
const API_URLS = {
  local: 'http://localhost:5000',
  ngrok: '', // À remplir avec votre URL ngrok
  production: 'https://votre-api-deployee.com'
};

// Fonction pour tester une URL
async function testApiUrl(url, name) {
  console.log(`\n🔍 Test de ${name}: ${url}`);
  
  try {
    const response = await fetch(url + '/health', {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      console.log(`✅ ${name} - API accessible`);
      
      // Tester l'endpoint des textes liturgiques
      try {
        const liturgyResponse = await fetch(url + '/api/text-of-the-day', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          timeout: 10000
        });
        
        if (liturgyResponse.ok) {
          const data = await liturgyResponse.json();
          console.log(`✅ ${name} - Texte du jour récupéré:`, {
            date: data.date,
            title: data.title,
            lecturesCount: data.lectures?.length || 0,
            hasLectures: !!(data.lectures && data.lectures.length > 0)
          });
        } else {
          console.log(`❌ ${name} - Erreur endpoint liturgie: ${liturgyResponse.status}`);
        }
      } catch (liturgyError) {
        console.log(`❌ ${name} - Erreur endpoint liturgie:`, liturgyError.message);
      }
      
    } else {
      console.log(`❌ ${name} - API non accessible: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ${name} - Erreur de connexion:`, error.message);
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 Test de l\'API des textes liturgiques');
  console.log('=====================================');
  
  // Tester toutes les URLs configurées
  for (const [name, url] of Object.entries(API_URLS)) {
    if (url) {
      await testApiUrl(url, name);
    } else {
      console.log(`\n⏭️  ${name} - URL non configurée`);
    }
  }
  
  console.log('\n📋 Instructions:');
  console.log('1. Lancez votre API Python: python app.py');
  console.log('2. Dans un autre terminal: ngrok http 5000');
  console.log('3. Copiez l\'URL ngrok dans ce script');
  console.log('4. Relancez ce test');
}

// Exécuter les tests
runTests().catch(console.error);
