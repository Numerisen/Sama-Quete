#!/usr/bin/env node

/**
 * Script pour afficher les textes liturgiques du jour dans le terminal
 * Usage: node textoftheday.js
 */

const https = require('https');
const http = require('http');

// Configuration de l'API
const API_URL = 'https://81b5b72e4de7.ngrok-free.app/api/text-of-the-day';

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Erreur de parsing JSON: ' + error.message));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Timeout de la requête'));
    });
  });
}

function processLiturgyData(apiData) {
  const { date, title, lectures } = apiData;
  
  let firstReading = '';
  let firstReadingRef = '';
  let psalm = '';
  let psalmRef = '';
  let secondReading = '';
  let secondReadingRef = '';
  let gospel = '';
  let gospelRef = '';

  // Traitement plus précis des lectures
  lectures.forEach(lecture => {
    const type = lecture.type?.toLowerCase() || '';
    const content = lecture.contenu || '';
    const reference = lecture.reference || '';

    // Utiliser le contenu tel qu'il est fourni par l'API
    let cleanContent = content;
    
    // Classification plus précise
    if (type.includes('première lecture') || (type.includes('lecture') && !type.includes('deuxième') && !type.includes('seconde'))) {
      firstReading = cleanContent;
      firstReadingRef = reference;
    } else if (type.includes('psaume') || type.includes('psalm')) {
      // Pour le psaume, nettoyer encore plus pour éviter les répétitions
      cleanContent = cleanContent.replace(/^R\/\s*Chante, ô mon âme, la louange du Seigneur!\s*ou:\s*Alléluia!\s*\(Ps 145, 1b\)\s*/gmi, '');
      // Supprimer les répétitions du refrain dans le texte
      cleanContent = cleanContent.replace(/^R\/\s*Chante, ô mon âme, la louange du Seigneur!\s*ou:\s*Alléluia!\s*\(Ps 145, 1b\)\s*/gmi, '');
      psalm = cleanContent;
      psalmRef = reference;
    } else if (type.includes('deuxième lecture') || type.includes('seconde lecture')) {
      secondReading = cleanContent;
      secondReadingRef = reference;
    } else if (type.includes('évangile') || type.includes('gospel')) {
      gospel = cleanContent;
      gospelRef = reference;
    }
  });

  return {
    date,
    title,
    firstReading,
    firstReadingRef,
    psalm,
    psalmRef,
    secondReading,
    secondReadingRef,
    gospel,
    gospelRef
  };
}

function displayLiturgy(data) {
  console.log('\n' + '='.repeat(80));
  console.log(colorize('LECTURES DE LA MESSE', 'bright'));
  console.log('='.repeat(80));
  
  console.log(colorize(`\nDate: ${data.date}`, 'cyan'));
  console.log(colorize(`Titre: ${data.title}`, 'yellow'));
  console.log('\n' + '-'.repeat(80));

  // Première lecture
  if (data.firstReading) {
    console.log(colorize('\nPREMIÈRE LECTURE', 'red'));
    console.log(`${data.firstReadingRef}`);
    console.log(`${data.firstReading}`);
  }

  // Psaume
  if (data.psalm) {
    console.log(colorize('\nPSAUME', 'red'));
    console.log(`${data.psalmRef}`);
    console.log(`${data.psalm}`);
  }

  // Deuxième lecture
  if (data.secondReading) {
    console.log(colorize('\nDEUXIÈME LECTURE', 'red'));
    console.log(`${data.secondReadingRef}`);
    console.log(`${data.secondReading}`);
  }

  // Évangile
  if (data.gospel) {
    console.log(colorize('\nÉVANGILE', 'red'));
    console.log(`${data.gospelRef}`);
    console.log(`${data.gospel}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log(colorize('Fin des lectures', 'gray'));
  console.log('='.repeat(80) + '\n');
}

async function main() {
  try {
    console.log(colorize('Récupération des textes liturgiques du jour...', 'blue'));
    console.log(colorize(`API: ${API_URL}`, 'gray'));
    
    const apiData = await makeRequest(API_URL);
    const processedData = processLiturgyData(apiData);
    
    displayLiturgy(processedData);
    
  } catch (error) {
    console.error(colorize('Erreur:', 'red'), error.message);
    
    // Aucune donnée de fallback - afficher un message d'erreur
    console.log(colorize('\n❌ Erreur: Impossible de récupérer les données de l\'API', 'red'));
    console.log(colorize('Vérifiez que l\'API est accessible et que l\'URL est correcte', 'yellow'));
  }
}

// Exécuter le script
main();
