const fs = require('fs');
const path = require('path');

// Fonction pour rechercher et remplacer localStorage dans un fichier
function removeLocalStorageFromFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Patterns à rechercher et remplacer
    const patterns = [
      // localStorage.getItem
      {
        search: /localStorage\.getItem\(["']([^"']+)["']\)/g,
        replace: '// localStorage.getItem("$1") - Migré vers Firestore'
      },
      // localStorage.setItem
      {
        search: /localStorage\.setItem\(["']([^"']+)["'],\s*([^)]+)\)/g,
        replace: '// localStorage.setItem("$1", $2) - Migré vers Firestore'
      },
      // localStorage.removeItem
      {
        search: /localStorage\.removeItem\(["']([^"']+)["']\)/g,
        replace: '// localStorage.removeItem("$1") - Migré vers Firestore'
      },
      // localStorage.clear
      {
        search: /localStorage\.clear\(\)/g,
        replace: '// localStorage.clear() - Migré vers Firestore'
      }
    ];

    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.search, pattern.replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Modifié: ${filePath}`);
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
      if (removeLocalStorageFromFile(filePath)) {
        modifiedCount++;
      }
    }
  });

  return modifiedCount;
}

// Fonction principale
function removeAllLocalStorage() {
  console.log('🚀 Suppression des références localStorage...');
  
  const appDir = path.join(__dirname, '..', 'app');
  const modifiedCount = processDirectory(appDir);
  
  console.log(`\n📊 Résumé:`);
  console.log(`   - Fichiers modifiés: ${modifiedCount}`);
  console.log(`   - Références localStorage commentées`);
  console.log(`\n⚠️  Important:`);
  console.log(`   - Vérifiez les fichiers modifiés`);
  console.log(`   - Testez l'application après migration`);
  console.log(`   - Supprimez les commentaires si tout fonctionne`);
}

// Exécuter le script
removeAllLocalStorage();
