/**
 * Script pour afficher les textes liturgiques dans le terminal
 * Simule le formatage du composant FormattedLiturgyText
 */

// Couleurs ANSI pour le terminal
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  // Couleurs de texte
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  // Couleurs de fond
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

/**
 * Parse le texte et identifie les segments à formater
 * Même logique que FormattedLiturgyText.tsx
 */
function parseText(input) {
  const segments = [];
  let remaining = input;

  // Pattern pour les citations avec guillemets français
  const citationPattern = /«([^»]+)»/g;
  // Pattern pour les responsories (R/ ... jusqu'à la fin de la ligne ou jusqu'à "ou :")
  const responsoryPattern = /(R\/\s*[^\n]+?(?:\n|ou\s*:|$))/gi;
  // Pattern pour les acclamations (Alléluia, Alléluia.)
  const acclamationPattern = /(Alléluia[.,!]?)/gi;
  // Pattern pour les références bibliques entre parenthèses
  const referencePattern = /(\([A-Za-z0-9\s,.:;–-]+\))/g;
  // Pattern pour les introductions
  const introductionPattern = /(Lecture du [^\.]+\.|Évangile de Jésus Christ[^\.]+\.)/g;
  // Pattern pour "En ce temps-là,"
  const timePattern = /(En ce temps-là,)/g;
  // Pattern pour "– Parole du Seigneur." et "– Acclamons la Parole de Dieu."
  const endingPattern = /(–\s*(?:Parole du Seigneur|Acclamons la Parole de Dieu)\.)/g;
  // Pattern pour les adresses directes en italique
  const directAddressPattern = /([A-Z][a-zéèêà]+(?:\s+de\s+[A-Z][a-z]+)?,|toi\s+qui\s+habites\s+[^,]+,)/g;
  // Pattern pour "Ainsi parle le Seigneur"
  const lordSpeaksPattern = /(Ainsi parle le Seigneur[^:]*:)/g;

  // Créer une liste de tous les matches avec leurs positions
  const matches = [];

  // Citations
  let match;
  while ((match = citationPattern.exec(remaining)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'citation',
      text: match[0]
    });
  }

  // Responsories
  while ((match = responsoryPattern.exec(remaining)) !== null) {
    const overlaps = matches.some(m => 
      (match.index >= m.start && match.index < m.end) ||
      (match.index + match[0].length > m.start && match.index + match[0].length <= m.end)
    );
    if (!overlaps) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'responsory',
        text: match[0]
      });
    }
  }

  // Acclamations
  while ((match = acclamationPattern.exec(remaining)) !== null) {
    const overlaps = matches.some(m => 
      (match.index >= m.start && match.index < m.end) ||
      (match.index + match[0].length > m.start && match.index + match[0].length <= m.end)
    );
    if (!overlaps) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'acclamation',
        text: match[0]
      });
    }
  }

  // Références bibliques
  while ((match = referencePattern.exec(remaining)) !== null) {
    const overlaps = matches.some(m => 
      (match.index >= m.start && match.index < m.end) ||
      (match.index + match[0].length > m.start && match.index + match[0].length <= m.end)
    );
    if (!overlaps) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'reference',
        text: match[0]
      });
    }
  }

  // Introductions
  while ((match = introductionPattern.exec(remaining)) !== null) {
    const overlaps = matches.some(m => 
      (match.index >= m.start && match.index < m.end) ||
      (match.index + match[0].length > m.start && match.index + match[0].length <= m.end)
    );
    if (!overlaps) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'italic',
        text: match[0]
      });
    }
  }

  // "En ce temps-là,"
  while ((match = timePattern.exec(remaining)) !== null) {
    const overlaps = matches.some(m => 
      (match.index >= m.start && match.index < m.end) ||
      (match.index + match[0].length > m.start && match.index + match[0].length <= m.end)
    );
    if (!overlaps) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'italic',
        text: match[0]
      });
    }
  }

  // Fin de lecture
  while ((match = endingPattern.exec(remaining)) !== null) {
    const overlaps = matches.some(m => 
      (match.index >= m.start && match.index < m.end) ||
      (match.index + match[0].length > m.start && match.index + match[0].length <= m.end)
    );
    if (!overlaps) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'italic',
        text: match[0]
      });
    }
  }

  // Adresses directes
  while ((match = directAddressPattern.exec(remaining)) !== null) {
    const overlaps = matches.some(m => 
      (match.index >= m.start && match.index < m.end) ||
      (match.index + match[0].length > m.start && match.index + match[0].length <= m.end)
    );
    if (!overlaps) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'italic',
        text: match[0]
      });
    }
  }

  // "Ainsi parle le Seigneur"
  while ((match = lordSpeaksPattern.exec(remaining)) !== null) {
    const overlaps = matches.some(m => 
      (match.index >= m.start && match.index < m.end) ||
      (match.index + match[0].length > m.start && match.index + match[0].length <= m.end)
    );
    if (!overlaps) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'italic',
        text: match[0]
      });
    }
  }

  // Trier les matches par position
  matches.sort((a, b) => a.start - b.start);

  // Construire les segments
  let lastIndex = 0;
  for (const match of matches) {
    if (match.start > lastIndex) {
      const normalText = remaining.substring(lastIndex, match.start);
      if (normalText) {
        segments.push({ text: normalText, style: 'normal' });
      }
    }
    segments.push({ text: match.text, style: match.type });
    lastIndex = match.end;
  }

  if (lastIndex < remaining.length) {
    const normalText = remaining.substring(lastIndex);
    if (normalText) {
      segments.push({ text: normalText, style: 'normal' });
    }
  }

  if (segments.length === 0) {
    segments.push({ text: remaining, style: 'normal' });
  }

  return segments;
}

/**
 * Affiche un segment avec le formatage approprié
 */
function formatSegment(segment) {
  let formatted = '';
  
  switch (segment.style) {
    case 'citation':
      formatted = colors.bold + segment.text + colors.reset;
      break;
    case 'responsory':
      formatted = colors.bold + colors.cyan + segment.text + colors.reset;
      break;
    case 'acclamation':
      formatted = colors.bold + colors.yellow + segment.text + colors.reset;
      break;
    case 'reference':
      formatted = colors.italic + colors.dim + segment.text + colors.reset;
      break;
    case 'italic':
      formatted = colors.italic + segment.text + colors.reset;
      break;
    case 'bold':
      formatted = colors.bold + segment.text + colors.reset;
      break;
    default:
      formatted = segment.text;
  }
  
  return formatted;
}

/**
 * Affiche un texte liturgique complet avec formatage
 */
function displayFormattedText(text, title = '') {
  console.log('\n' + '='.repeat(80));
  if (title) {
    console.log(colors.bold + colors.blue + title + colors.reset);
    console.log('='.repeat(80) + '\n');
  }
  
  const segments = parseText(text);
  
  segments.forEach(segment => {
    // Préserver les sauts de ligne
    const lines = segment.text.split('\n');
    lines.forEach((line, index) => {
      if (line.trim() || index === 0) {
        const formatted = formatSegment({ ...segment, text: line });
        process.stdout.write(formatted);
        if (index < lines.length - 1) {
          process.stdout.write('\n');
        }
      } else {
        process.stdout.write('\n');
      }
    });
  });
  
  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Affiche les données liturgiques complètes
 */
function displayLiturgyData(data) {
  console.clear();
  console.log(colors.bold + colors.magenta + '\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    TEXTES LITURGIQUES DU JOUR                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝' + colors.reset);
  
  console.log(colors.bold + '\n📅 Date: ' + colors.reset + data.date);
  console.log(colors.bold + '📖 Titre: ' + colors.reset + colors.blue + (data.title || 'Textes du jour') + colors.reset);
  if (data.liturgicalSeason) {
    console.log(colors.bold + '🎨 Saison: ' + colors.reset + data.liturgicalSeason);
  }
  if (data.color) {
    console.log(colors.bold + '🎨 Couleur: ' + colors.reset + data.color);
  }
  
  // Première lecture
  if (data.firstReading) {
    console.log(colors.bold + colors.green + '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  PREMIÈRE LECTURE' + (data.firstReadingRef ? ` - ${data.firstReadingRef}` : ''));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    displayFormattedText(data.firstReading);
  }
  
  // Psaume
  if (data.psalm) {
    console.log(colors.bold + colors.green + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  PSAUME' + (data.psalmRef ? ` - ${data.psalmRef}` : ''));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    displayFormattedText(data.psalm);
  }
  
  // Deuxième lecture (si présente)
  if (data.secondReading) {
    console.log(colors.bold + colors.green + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  DEUXIÈME LECTURE' + (data.secondReadingRef ? ` - ${data.secondReadingRef}` : ''));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    displayFormattedText(data.secondReading);
  }
  
  // Évangile
  if (data.gospel) {
    console.log(colors.bold + colors.green + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ÉVANGILE' + (data.gospelRef ? ` - ${data.gospelRef}` : ''));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    displayFormattedText(data.gospel);
  }
  
  // Réflexion
  if (data.reflection) {
    console.log(colors.bold + colors.yellow + '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  RÉFLEXION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    console.log(data.reflection);
  }
  
  console.log('\n');
}

// Fonction principale pour tester
async function main() {
  const args = process.argv.slice(2);
  const date = args[0] || new Date().toISOString().split('T')[0];
  
  try {
    console.log(colors.bold + colors.cyan + '\n🔄 Récupération des textes liturgiques pour le ' + date + '...\n' + colors.reset);
    
    // Essayer d'utiliser le scraper direct
    // Note: Ce script doit être adapté pour fonctionner avec Node.js (sans React Native)
    // Pour l'instant, on va créer une version simplifiée qui utilise fetch directement
    
    const BASE_URL = `https://www.aelf.org/${date}/romain/prière`;
    
    console.log('📡 Connexion à: ' + BASE_URL);
    
    const response = await fetch(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SamaQuete/1.0)',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parser le HTML (version simplifiée)
    const result = {
      date,
      title: null,
      firstReading: '',
      firstReadingRef: '',
      psalm: '',
      psalmRef: '',
      gospel: '',
      gospelRef: '',
      reflection: '',
    };
    
    // Extraire le titre - plusieurs patterns possibles
    let titleMatch = html.match(/#middle-col[^>]*>[\s\S]*?<div[^>]*>[\s\S]*?<p[^>]*>[\s\S]*?<strong[^>]*>([^<]+)<\/strong>/i);
    
    // Pattern alternatif pour le titre
    if (!titleMatch) {
      titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    }
    if (!titleMatch) {
      titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    }
    if (!titleMatch) {
      // Chercher dans les balises strong ou h2
      titleMatch = html.match(/<strong[^>]*class=["'][^"']*title[^"']*["'][^>]*>([^<]+)<\/strong>/i);
    }
    if (!titleMatch) {
      // Dernier recours: chercher un texte en gras au début
      titleMatch = html.match(/<strong[^>]*>([^<]{10,100})<\/strong>/i);
    }
    
    if (titleMatch) {
      result.title = titleMatch[1]
        .replace(/\u00a0/g, ' ')
        .replace(/\n/g, ' ')
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/^.*?aelf\.org[^>]*>\s*/, '') // Nettoyer les préfixes
        .replace(/\s*-\s*prière.*$/i, ''); // Nettoyer les suffixes
    }
    
    // Si toujours pas de titre, utiliser une valeur par défaut basée sur la date
    if (!result.title) {
      const dateObj = new Date(date);
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
      result.title = `Textes du ${days[dateObj.getDay()]} ${dateObj.getDate()} ${months[dateObj.getMonth()]}`;
    }
    
    // Extraire les lectures
    const lecturePattern = /<div[^>]*class=["'][^"']*lecture[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
    let lectureMatch;
    
    while ((lectureMatch = lecturePattern.exec(html)) !== null) {
      const lectureBlock = lectureMatch[1];
      
      const titreMatch = lectureBlock.match(/<h4[^>]*>([^<]+)<\/h4>/i);
      const titreText = titreMatch ? titreMatch[1].trim() : null;
      
      const referenceMatch = lectureBlock.match(/<h5[^>]*>([^<]+)<\/h5>/i);
      const referenceText = referenceMatch ? referenceMatch[1].trim() : null;
      
      // Extraire le contenu
      const paragraphPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
      let paragraphMatch;
      let contenu = '';
      
      while ((paragraphMatch = paragraphPattern.exec(lectureBlock)) !== null) {
        const paragraphHtml = paragraphMatch[1];
        // Nettoyer le HTML
        let texte = paragraphHtml
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'")
          .replace(/&[a-z]+;/gi, '')
          .replace(/\u00a0/g, ' ')
          .replace(/\n\s*\n\s*\n/g, '\n\n')
          .trim();
        
        if (texte) {
          contenu += texte + '\n\n';
        }
      }
      
      if (titreText && contenu.trim()) {
        const type = titreText.toLowerCase();
        const content = contenu.trim();
        
        if (type.includes('première lecture') || (type.includes('lecture') && !type.includes('deuxième') && !type.includes('seconde'))) {
          result.firstReading = content;
          result.firstReadingRef = referenceText || '';
        } else if (type.includes('psaume') || type.includes('psalm')) {
          result.psalm = content;
          result.psalmRef = referenceText || '';
        } else if (type.includes('deuxième lecture') || type.includes('seconde lecture')) {
          result.secondReading = content;
          result.secondReadingRef = referenceText || '';
        } else if (type.includes('évangile') || type.includes('gospel')) {
          result.gospel = content;
          result.gospelRef = referenceText || '';
        }
      }
    }
    
    if (!result.title && !result.firstReading && !result.psalm && !result.gospel) {
      throw new Error('Aucun texte liturgique trouvé pour cette date');
    }
    
    // Afficher les résultats
    displayLiturgyData(result);
    
  } catch (error) {
    console.error(colors.red + '\n❌ Erreur: ' + error.message + colors.reset);
    console.error('\nDétails:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { displayFormattedText, displayLiturgyData, parseText, formatSegment };

