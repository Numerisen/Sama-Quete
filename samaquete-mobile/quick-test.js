// Test rapide pour vérifier l'API avant de tester sur mobile
const https = require('https');
const http = require('http');

console.log('🧪 Test rapide de l\'API pour mobile');
console.log('=====================================');

// Remplacez par votre URL ngrok
const NGROK_URL = 'https://votre-url-ngrok.ngrok.io';

if (NGROK_URL.includes('votre-url-ngrok')) {
  console.log('❌ Veuillez remplacer NGROK_URL par votre vraie URL ngrok');
  console.log('📝 Exemple: https://abc123.ngrok.io');
  process.exit(1);
}

console.log(`🔍 Test de l'API: ${NGROK_URL}`);

const options = {
  hostname: NGROK_URL.replace('https://', '').replace('http://', ''),
  port: 443,
  path: '/api/text-of-the-day',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('✅ API fonctionne !');
      console.log('📅 Date:', jsonData.date);
      console.log('📖 Titre:', jsonData.title);
      console.log('📚 Lectures:', jsonData.lectures?.length || 0);
      
      if (jsonData.lectures && jsonData.lectures.length > 0) {
        console.log('\n📖 Première lecture:');
        console.log('Type:', jsonData.lectures[0].type);
        console.log('Contenu:', jsonData.lectures[0].contenu?.substring(0, 100) + '...');
      }
      
      console.log('\n🎉 Prêt pour le test mobile !');
      console.log('📱 Lancez votre app mobile maintenant');
      
    } catch (error) {
      console.log('❌ Erreur de parsing JSON:', error.message);
      console.log('📄 Données brutes:', data.substring(0, 200) + '...');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Erreur de connexion:', error.message);
  console.log('🔧 Vérifiez que:');
  console.log('   1. L\'API Python est lancée (python3 app.py)');
  console.log('   2. ngrok est lancé (ngrok http 5000)');
  console.log('   3. L\'URL ngrok est correcte');
});

req.setTimeout(10000, () => {
  console.log('⏰ Timeout de la requête');
  req.destroy();
});

req.end();
