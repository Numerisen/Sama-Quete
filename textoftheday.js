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

    // Nettoyer le contenu en supprimant les références et les répétitions
    let cleanContent = content;
    
    // Supprimer la référence du contenu si elle y est incluse
    if (reference && content.includes(reference)) {
      cleanContent = content.replace(reference, '').trim();
    }
    
    // Supprimer les guillemets et espaces supplémentaires
    cleanContent = cleanContent.replace(/^["«»]+|["«»]+$/g, '').trim();
    
    // Supprimer les répétitions de titres dans le contenu
    cleanContent = cleanContent.replace(/^(PREMIÈRE LECTURE|PSAUME|DEUXIÈME LECTURE|ÉVANGILE)\s*/gmi, '');
    cleanContent = cleanContent.replace(/^(R\/\s*Chante, ô mon âme, la louange du Seigneur!\s*ou:\s*Alléluia!\s*\(Ps 145, 1b\))\s*/gmi, '');
    
    // Supprimer les répétitions de sources dans le contenu
    cleanContent = cleanContent.replace(/^(Lecture du livre du prophète Amos|Lecture de la première lettre de saint Paul apôtre à Timothée|Évangile de Jésus Christ selon saint Luc)\s*/gmi, '');
    
    // Supprimer les répétitions d'Alléluia
    cleanContent = cleanContent.replace(/^(Alléluia\.\s*Alléluia\.\s*Alléluia\.\s*Alléluia\.)\s*/gmi, 'Alléluia. Alléluia. ');
    cleanContent = cleanContent.replace(/^(Alléluia\.\s*Alléluia\.\s*Alléluia\.)\s*/gmi, 'Alléluia. Alléluia. ');
    
    // Supprimer les répétitions de "Évangile de Jésus Christ selon saint Luc"
    cleanContent = cleanContent.replace(/^(Évangile de Jésus Christ selon saint Luc)\s*/gmi, '');
    
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
    console.log(`« ${data.firstReadingRef} »`);
    console.log('Lecture du livre du prophète Amos');
    console.log(`\n${data.firstReading}`);
    console.log('- Parole du Seigneur.');
  }

  // Psaume
  if (data.psalm) {
    console.log(colorize('\nPSAUME', 'red'));
    console.log(`(${data.psalmRef})`);
    console.log(colorize('R/ Chante, ô mon âme,', 'bright'));
    console.log(colorize('la louange du Seigneur !', 'bright'));
    console.log(colorize('ou : Alléluia ! (Ps 145, 1b)', 'bright'));
    console.log(`\n${data.psalm}`);
  }

  // Deuxième lecture
  if (data.secondReading) {
    console.log(colorize('\nDEUXIÈME LECTURE', 'red'));
    console.log(`« ${data.secondReadingRef} »`);
    console.log('Lecture de la première lettre de saint Paul apôtre à Timothée');
    console.log(`\n${data.secondReading}`);
    console.log('- Parole du Seigneur.');
  }

  // Évangile
  if (data.gospel) {
    console.log(colorize('\nÉVANGILE', 'red'));
    console.log(`« ${data.gospelRef} »`);
    console.log('Évangile de Jésus Christ selon saint Luc');
    console.log(`\n${data.gospel}`);
    console.log('Acclamons la Parole de Dieu.');
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
    
    // Afficher des données de fallback basées sur les vraies lectures
    console.log(colorize('\nUtilisation des données de fallback...', 'yellow'));
    
    const fallbackData = {
      date: new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      title: "3ème Dimanche du Temps Ordinaire",
      firstReading: "Ainsi parle le Seigneur de l'univers :\n\nMalheur à ceux qui vivent bien tranquilles dans Sion,\nCouchés sur des lits d'ivoire,\nils mangent les agneaux du troupeau,\nils improvisent au son de la harpe,\nils boivent le vin à même les amphores,\nmais ils ne se tourmentent guère du désastre d'Israël !\nC'est pourquoi maintenant ils vont être déportés,\net la bande des vautrés n'existera plus.",
      firstReadingRef: "Am 6, 1a.4-7",
      psalm: "Le Seigneur garde à jamais sa fidélité,\nil fait justice aux opprimés ;\naux affamés, il donne le pain ;\nle Seigneur délie les enchaînés.\nLe Seigneur ouvre les yeux des aveugles,\nle Seigneur redresse les accablés,\nle Seigneur aime les justes,\nle Seigneur protège l'étranger.\nIl soutient la veuve et l'orphelin,\nil égare les pas du méchant.\nD'âge en âge, le Seigneur régnera :\nton Dieu, ô Sion, pour toujours !",
      psalmRef: "Ps 145 (146), 6c.7, 8.9a, 9bc-10",
      secondReading: "Toi, homme de Dieu,\nrecherche la justice, la piété, la foi, la charité, la persévérance et la douceur.\n\nMène le bon combat, celui de la foi, empare-toi de la vie éternelle !\nC'est à elle que tu as été appelé, c'est pour elle que tu as prononcé ta belle profession de foi devant de nombreux témoins.\n\nEt maintenant, en présence de Dieu qui donne vie à tous les êtres, et en présence du Christ Jésus qui a témoigné devant Ponce Pilate par une belle affirmation, voici ce que je t'ordonne :\n\ngarde le commandement du Seigneur, en demeurant sans tache, irréprochable jusqu'à la Manifestation de notre Seigneur Jésus Christ.\n\nCelui qui le fera paraître aux temps fixés, c'est Dieu, Souverain unique et bienheureux, Roi des rois et Seigneur des seigneurs, lui seul possède l'immortalité, habite une lumière inaccessible ; aucun homme ne l'a jamais vu, et nul ne peut le voir.\nÀ lui, honneur et puissance éternelle. Amen.",
      secondReadingRef: "1 Tm 6, 11-16",
      gospel: "Alléluia. Alléluia.\nJésus Christ s'est fait pauvre, lui qui était riche, pour que vous deveniez riches par sa pauvreté. Alléluia. (cf. 2 Co 8, 9)\n\nÉvangile de Jésus Christ selon saint Luc\n\nEn ce temps-là, Jésus disait aux pharisiens : « Il y avait un homme riche, vêtu de pourpre et de lin fin, qui faisait chaque jour des festins somptueux. Devant son portail gisait un pauvre nommé Lazare, qui était couvert d'ulcères. Il aurait bien voulu se rassasier de ce qui tombait de la table du riche ; mais les chiens, eux, venaient lécher ses ulcères.\n\nOr le pauvre mourut, et les anges l'emportèrent auprès d'Abraham. Le riche mourut aussi, et on l'enterra. Dans le séjour des morts, il était en proie à la torture ; il leva les yeux et vit de loin Abraham avec Lazare tout près de lui.\n\nAlors il cria : 'Père Abraham, prends pitié de moi et envoie Lazare. Qu'il trempe le bout de son doigt dans l'eau pour me rafraîchir la langue, car je souffre terriblement dans cette fournaise.'\n\nAbraham lui dit : 'Mon enfant, souviens-toi : tu as reçu le bonheur pendant ta vie, et Lazare, le malheur. Maintenant, lui, il trouve ici la consolation, et toi, la souffrance. Et en plus, il y a un grand abîme entre vous et nous, pour que ceux qui voudraient passer vers vous ne le puissent pas, et que, de là-bas non plus, on ne traverse pas vers nous.'",
      gospelRef: "Lc 16, 19-31"
    };
    
    displayLiturgy(fallbackData);
  }
}

// Exécuter le script
main();
