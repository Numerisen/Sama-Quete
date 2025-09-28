// Test simple de l'API Python
const http = require('http');

console.log('🔍 Test de l\'API Python...');

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/text-of-the-day',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('✅ Données reçues:');
      console.log('Date:', jsonData.date);
      console.log('Titre:', jsonData.title);
      console.log('Nombre de lectures:', jsonData.lectures?.length || 0);
      
      if (jsonData.lectures && jsonData.lectures.length > 0) {
        console.log('\n📖 Première lecture:');
        console.log('Type:', jsonData.lectures[0].type);
        console.log('Référence:', jsonData.lectures[0].reference);
        console.log('Contenu:', jsonData.lectures[0].contenu?.substring(0, 100) + '...');
      }
    } catch (error) {
      console.log('❌ Erreur de parsing JSON:', error.message);
      console.log('Données brutes:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Erreur de connexion:', error.message);
  console.log('Vérifiez que l\'API Python est lancée avec: python3 app.py');
});

req.setTimeout(10000, () => {
  console.log('❌ Timeout de la requête');
  req.destroy();
});

req.end();
