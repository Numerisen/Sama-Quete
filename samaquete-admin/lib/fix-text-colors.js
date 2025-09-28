const fs = require('fs');
const path = require('path');

// Fonction pour corriger les couleurs de texte dans un fichier
function fixTextColors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Patterns de couleurs de texte à corriger
    const textColorMappings = [
      // Textes bleus -> noirs
      { search: /text-blue-900/g, replace: 'text-black' },
      { search: /text-blue-800/g, replace: 'text-black' },
      { search: /text-blue-700/g, replace: 'text-black' },
      { search: /text-blue-600/g, replace: 'text-black' },
      { search: /text-blue-500/g, replace: 'text-black' },
      { search: /text-blue-400/g, replace: 'text-black' },
      { search: /text-blue-300/g, replace: 'text-gray-500' },
      { search: /text-blue-200/g, replace: 'text-gray-400' },
      { search: /text-blue-100/g, replace: 'text-gray-300' },
      
      // Textes verts -> noirs
      { search: /text-green-900/g, replace: 'text-black' },
      { search: /text-green-800/g, replace: 'text-black' },
      { search: /text-green-700/g, replace: 'text-black' },
      { search: /text-green-600/g, replace: 'text-black' },
      { search: /text-green-500/g, replace: 'text-black' },
      { search: /text-green-400/g, replace: 'text-gray-500' },
      { search: /text-green-300/g, replace: 'text-gray-400' },
      
      // Textes rouges -> noirs (sauf pour les erreurs)
      { search: /text-red-900/g, replace: 'text-black' },
      { search: /text-red-800/g, replace: 'text-black' },
      { search: /text-red-700/g, replace: 'text-black' },
      { search: /text-red-600/g, replace: 'text-black' },
      { search: /text-red-500/g, replace: 'text-black' },
      { search: /text-red-400/g, replace: 'text-gray-500' },
      { search: /text-red-300/g, replace: 'text-gray-400' },
      
      // Textes violets -> noirs
      { search: /text-purple-900/g, replace: 'text-black' },
      { search: /text-purple-800/g, replace: 'text-black' },
      { search: /text-purple-700/g, replace: 'text-black' },
      { search: /text-purple-600/g, replace: 'text-black' },
      { search: /text-purple-500/g, replace: 'text-black' },
      { search: /text-purple-400/g, replace: 'text-gray-500' },
      { search: /text-purple-300/g, replace: 'text-gray-400' },
      
      // Textes jaunes -> noirs
      { search: /text-yellow-900/g, replace: 'text-black' },
      { search: /text-yellow-800/g, replace: 'text-black' },
      { search: /text-yellow-700/g, replace: 'text-black' },
      { search: /text-yellow-600/g, replace: 'text-black' },
      { search: /text-yellow-500/g, replace: 'text-black' },
      { search: /text-yellow-400/g, replace: 'text-gray-500' },
      { search: /text-yellow-300/g, replace: 'text-gray-400' },
      
      // Textes gris -> noirs (sauf les très clairs)
      { search: /text-gray-900/g, replace: 'text-black' },
      { search: /text-gray-800/g, replace: 'text-black' },
      { search: /text-gray-700/g, replace: 'text-black' },
      { search: /text-gray-600/g, replace: 'text-black' },
      { search: /text-gray-500/g, replace: 'text-gray-600' },
      { search: /text-gray-400/g, replace: 'text-gray-500' },
      { search: /text-gray-300/g, replace: 'text-gray-400' },
      
      // Textes orange -> noirs
      { search: /text-orange-900/g, replace: 'text-black' },
      { search: /text-orange-800/g, replace: 'text-black' },
      { search: /text-orange-700/g, replace: 'text-black' },
      { search: /text-orange-600/g, replace: 'text-black' },
      { search: /text-orange-500/g, replace: 'text-black' },
      { search: /text-orange-400/g, replace: 'text-gray-500' },
      { search: /text-orange-300/g, replace: 'text-gray-400' },
      
      // Textes indigo -> noirs
      { search: /text-indigo-900/g, replace: 'text-black' },
      { search: /text-indigo-800/g, replace: 'text-black' },
      { search: /text-indigo-700/g, replace: 'text-black' },
      { search: /text-indigo-600/g, replace: 'text-black' },
      { search: /text-indigo-500/g, replace: 'text-black' },
      { search: /text-indigo-400/g, replace: 'text-gray-500' },
      { search: /text-indigo-300/g, replace: 'text-gray-400' },
      
      // Textes cyan -> noirs
      { search: /text-cyan-900/g, replace: 'text-black' },
      { search: /text-cyan-800/g, replace: 'text-black' },
      { search: /text-cyan-700/g, replace: 'text-black' },
      { search: /text-cyan-600/g, replace: 'text-black' },
      { search: /text-cyan-500/g, replace: 'text-black' },
      { search: /text-cyan-400/g, replace: 'text-gray-500' },
      { search: /text-cyan-300/g, replace: 'text-gray-400' },
      
      // Textes teal -> noirs
      { search: /text-teal-900/g, replace: 'text-black' },
      { search: /text-teal-800/g, replace: 'text-black' },
      { search: /text-teal-700/g, replace: 'text-black' },
      { search: /text-teal-600/g, replace: 'text-black' },
      { search: /text-teal-500/g, replace: 'text-black' },
      { search: /text-teal-400/g, replace: 'text-gray-500' },
      { search: /text-teal-300/g, replace: 'text-gray-400' },
      
      // Textes emerald -> noirs
      { search: /text-emerald-900/g, replace: 'text-black' },
      { search: /text-emerald-800/g, replace: 'text-black' },
      { search: /text-emerald-700/g, replace: 'text-black' },
      { search: /text-emerald-600/g, replace: 'text-black' },
      { search: /text-emerald-500/g, replace: 'text-black' },
      { search: /text-emerald-400/g, replace: 'text-gray-500' },
      { search: /text-emerald-300/g, replace: 'text-gray-400' },
      
      // Textes lime -> noirs
      { search: /text-lime-900/g, replace: 'text-black' },
      { search: /text-lime-800/g, replace: 'text-black' },
      { search: /text-lime-700/g, replace: 'text-black' },
      { search: /text-lime-600/g, replace: 'text-black' },
      { search: /text-lime-500/g, replace: 'text-black' },
      { search: /text-lime-400/g, replace: 'text-gray-500' },
      { search: /text-lime-300/g, replace: 'text-gray-400' },
      
      // Textes rose -> noirs
      { search: /text-rose-900/g, replace: 'text-black' },
      { search: /text-rose-800/g, replace: 'text-black' },
      { search: /text-rose-700/g, replace: 'text-black' },
      { search: /text-rose-600/g, replace: 'text-black' },
      { search: /text-rose-500/g, replace: 'text-black' },
      { search: /text-rose-400/g, replace: 'text-gray-500' },
      { search: /text-rose-300/g, replace: 'text-gray-400' },
      
      // Textes pink -> noirs
      { search: /text-pink-900/g, replace: 'text-black' },
      { search: /text-pink-800/g, replace: 'text-black' },
      { search: /text-pink-700/g, replace: 'text-black' },
      { search: /text-pink-600/g, replace: 'text-black' },
      { search: /text-pink-500/g, replace: 'text-black' },
      { search: /text-pink-400/g, replace: 'text-gray-500' },
      { search: /text-pink-300/g, replace: 'text-gray-400' },
      
      // Textes fuchsia -> noirs
      { search: /text-fuchsia-900/g, replace: 'text-black' },
      { search: /text-fuchsia-800/g, replace: 'text-black' },
      { search: /text-fuchsia-700/g, replace: 'text-black' },
      { search: /text-fuchsia-600/g, replace: 'text-black' },
      { search: /text-fuchsia-500/g, replace: 'text-black' },
      { search: /text-fuchsia-400/g, replace: 'text-gray-500' },
      { search: /text-fuchsia-300/g, replace: 'text-gray-400' },
      
      // Textes violet -> noirs
      { search: /text-violet-900/g, replace: 'text-black' },
      { search: /text-violet-800/g, replace: 'text-black' },
      { search: /text-violet-700/g, replace: 'text-black' },
      { search: /text-violet-600/g, replace: 'text-black' },
      { search: /text-violet-500/g, replace: 'text-black' },
      { search: /text-violet-400/g, replace: 'text-gray-500' },
      { search: /text-violet-300/g, replace: 'text-gray-400' },
      
      // Textes slate -> noirs
      { search: /text-slate-900/g, replace: 'text-black' },
      { search: /text-slate-800/g, replace: 'text-black' },
      { search: /text-slate-700/g, replace: 'text-black' },
      { search: /text-slate-600/g, replace: 'text-black' },
      { search: /text-slate-500/g, replace: 'text-gray-600' },
      { search: /text-slate-400/g, replace: 'text-gray-500' },
      { search: /text-slate-300/g, replace: 'text-gray-400' },
      
      // Textes zinc -> noirs
      { search: /text-zinc-900/g, replace: 'text-black' },
      { search: /text-zinc-800/g, replace: 'text-black' },
      { search: /text-zinc-700/g, replace: 'text-black' },
      { search: /text-zinc-600/g, replace: 'text-black' },
      { search: /text-zinc-500/g, replace: 'text-gray-600' },
      { search: /text-zinc-400/g, replace: 'text-gray-500' },
      { search: /text-zinc-300/g, replace: 'text-gray-400' },
      
      // Textes neutral -> noirs
      { search: /text-neutral-900/g, replace: 'text-black' },
      { search: /text-neutral-800/g, replace: 'text-black' },
      { search: /text-neutral-700/g, replace: 'text-black' },
      { search: /text-neutral-600/g, replace: 'text-black' },
      { search: /text-neutral-500/g, replace: 'text-gray-600' },
      { search: /text-neutral-400/g, replace: 'text-gray-500' },
      { search: /text-neutral-300/g, replace: 'text-gray-400' },
      
      // Textes stone -> noirs
      { search: /text-stone-900/g, replace: 'text-black' },
      { search: /text-stone-800/g, replace: 'text-black' },
      { search: /text-stone-700/g, replace: 'text-black' },
      { search: /text-stone-600/g, replace: 'text-black' },
      { search: /text-stone-500/g, replace: 'text-gray-600' },
      { search: /text-stone-400/g, replace: 'text-gray-500' },
      { search: /text-stone-300/g, replace: 'text-gray-400' }
    ];

    textColorMappings.forEach(mapping => {
      const newContent = content.replace(mapping.search, mapping.replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Textes en noir: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les dossiers
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let modifiedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Ignorer node_modules et .next
      if (file !== 'node_modules' && file !== '.next' && !file.startsWith('.')) {
        modifiedCount += processDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      if (fixTextColors(filePath)) {
        modifiedCount++;
      }
    }
  });

  return modifiedCount;
}

// Fonction principale
function fixAllTextColors() {
  console.log('📝 Conversion des textes en noir...');
  console.log('🔄 Amélioration de la lisibilité...');
  
  const appDir = path.join(__dirname, '..', 'app');
  const modifiedCount = processDirectory(appDir);
  
  console.log(`\n📊 Résumé:`);
  console.log(`   - Fichiers modifiés: ${modifiedCount}`);
  console.log(`   - Textes convertis en noir`);
  console.log(`\n✅ Conversion terminée !`);
  console.log(`\n🎯 Amélioration de la lisibilité:`);
  console.log(`   - Textes principaux: text-black`);
  console.log(`   - Textes secondaires: text-gray-600`);
  console.log(`   - Textes tertiaires: text-gray-500`);
  console.log(`   - Textes très clairs: text-gray-400`);
}

// Exécuter le script
fixAllTextColors();
