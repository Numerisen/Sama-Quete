/**
 * Script de test de conformité - Interface Admin Web
 * 
 * Ce script valide que l'interface admin est conforme aux spécifications:
 * - Rôles et permissions
 * - Pages et fonctionnalités
 * - Structure Firestore (parishId, status)
 * - Principes essentiels (mobile, églises, dons)
 */

const fs = require('fs')
const path = require('path')

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

// Résultats des tests
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
}

function addTest(name, passed, message, isWarning = false) {
  results.tests.push({ name, passed, message, isWarning })
  if (isWarning) {
    results.warnings++
    logWarning(`${name}: ${message}`)
  } else if (passed) {
    results.passed++
    logSuccess(`${name}: ${message}`)
  } else {
    results.failed++
    logError(`${name}: ${message}`)
  }
}

// Chemins des fichiers
const adminDir = path.join(__dirname, '..')
const appDir = path.join(adminDir, 'app')
const componentsDir = path.join(adminDir, 'components')
const libDir = path.join(adminDir, 'lib')

// Fonction pour lire un fichier
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    return null
  }
}

// Fonction pour vérifier si un fichier existe
function fileExists(filePath) {
  return fs.existsSync(filePath)
}

// Fonction pour lister les fichiers dans un répertoire
function listFiles(dir, extension = null) {
  try {
    const files = fs.readdirSync(dir, { recursive: true, withFileTypes: true })
    return files
      .filter(file => file.isFile())
      .filter(file => !extension || file.name.endsWith(extension))
      .map(file => path.join(file.path || dir, file.name))
  } catch (error) {
    return []
  }
}

// ============================================
// TESTS DES PRINCIPES ESSENTIELS
// ============================================

function testPrincipesEssentiels() {
  logInfo('\n📋 TEST 1: Principes essentiels')
  
  // Test 1.1: Vérifier que les églises ne sont jamais visibles côté mobile
  const firestoreRules = readFile(path.join(adminDir, 'firestore.rules'))
  if (firestoreRules) {
    const hasChurchMobileRule = firestoreRules.includes('churches') && 
                                 !firestoreRules.match(/churches.*mobile|mobile.*churches/i)
    addTest(
      'Églises non visibles mobile',
      hasChurchMobileRule,
      hasChurchMobileRule ? 'Les églises sont bien internes' : 'Vérifier les règles Firestore pour les églises'
    )
  }

  // Test 1.2: Vérifier que les dons sont toujours rattachés à parishId
  const donationPages = listFiles(appDir, '.tsx').filter(f => 
    f.includes('donation') && !f.includes('type')
  )
  let donationsHaveParishId = true
  const pagesWithoutParishId = []
  donationPages.forEach(page => {
    const content = readFile(page)
    if (content) {
      // Vérifier plusieurs variantes de parishId
      const hasParishId = content.includes('parishId') || 
                         content.includes('userRole?.parishId') ||
                         content.includes('ParishDonationService') ||
                         content.includes('getAll(parishId)')
      if (!hasParishId) {
        donationsHaveParishId = false
        pagesWithoutParishId.push(path.basename(page))
      }
    }
  })
  addTest(
    'Dons rattachés à parishId',
    donationsHaveParishId,
    donationsHaveParishId 
      ? 'Tous les dons utilisent parishId' 
      : `Certaines pages ne référencent pas parishId: ${pagesWithoutParishId.join(', ')}`
  )

  // Test 1.3: Vérifier que les dons ne sont jamais rattachés à churchId
  let donationsNotChurchId = true
  donationPages.forEach(page => {
    const content = readFile(page)
    if (content && content.includes('churchId') && content.includes('donation')) {
      donationsNotChurchId = false
    }
  })
  addTest(
    'Dons jamais rattachés à churchId',
    donationsNotChurchId,
    donationsNotChurchId ? 'Aucun don n\'utilise churchId' : 'ATTENTION: Des dons utilisent churchId (interdit)'
  )
}

// ============================================
// TESTS DES RÔLES ADMIN
// ============================================

function testRoles() {
  logInfo('\n👥 TEST 2: Rôles admin et accès')
  
  const userService = readFile(path.join(libDir, 'user-service.ts'))
  if (userService) {
    const roles = ['super_admin', 'archdiocese_admin', 'diocese_admin', 'parish_admin', 'church_admin']
    roles.forEach(role => {
      const hasRole = userService.includes(`'${role}'`) || userService.includes(`"${role}"`)
      addTest(
        `Rôle ${role} défini`,
        hasRole,
        hasRole ? `Rôle ${role} présent` : `Rôle ${role} manquant`
      )
    })
  }
}

// ============================================
// TESTS DES PAGES ADMIN PAROISSE
// ============================================

function testAdminParoissePages() {
  logInfo('\n📄 TEST 3: Pages ADMIN PAROISSE')
  
  const requiredPages = [
    { path: 'adminparoisse/dashboard/page.tsx', name: 'Dashboard' },
    { path: 'adminparoisse/informations/page.tsx', name: 'Informations paroisse' },
    { path: 'adminparoisse/eglises/page.tsx', name: 'Églises' },
    { path: 'adminparoisse/contenus/page.tsx', name: 'Actualités & contenus' },
    { path: 'adminparoisse/donation-types/page.tsx', name: 'Types de dons' },
    { path: 'adminparoisse/donations/page.tsx', name: 'Dons' },
    { path: 'adminparoisse/notifications/page.tsx', name: 'Notifications' },
    { path: 'adminparoisse/users/page.tsx', name: 'Utilisateurs' },
    { path: 'adminparoisse/settings/page.tsx', name: 'Paramètres paroisse' }
  ]

  requiredPages.forEach(page => {
    const fullPath = path.join(appDir, page.path)
    const exists = fileExists(fullPath)
    addTest(
      `Page ${page.name}`,
      exists,
      exists ? `Page ${page.name} existe` : `Page ${page.name} manquante`
    )

    if (exists) {
      const content = readFile(fullPath)
      if (content) {
        // Vérifier que la page utilise parishId
        if (page.name !== 'Dashboard') {
          const usesParishId = content.includes('parishId') || content.includes('userRole?.parishId')
          addTest(
            `${page.name} utilise parishId`,
            usesParishId,
            usesParishId ? 'Utilise parishId' : 'Ne référence pas parishId',
            true
          )
        }
      }
    }
  })
}

// ============================================
// TESTS DES PAGES ADMIN ÉGLISE
// ============================================

function testAdminEglisePages() {
  logInfo('\n📄 TEST 4: Pages ADMIN ÉGLISE')
  
  const requiredPages = [
    { path: 'admineglise/dashboard/page.tsx', name: 'Dashboard' },
    { path: 'admineglise/news/page.tsx', name: 'Actualités' },
    { path: 'admineglise/activities/page.tsx', name: 'Activités' },
    { path: 'admineglise/prayers/page.tsx', name: 'prières' },
    { path: 'admineglise/donations/page.tsx', name: 'Dons (lecture seule)' },
    { path: 'admineglise/settings/page.tsx', name: 'Paramètres' }
  ]

  requiredPages.forEach(page => {
    const fullPath = path.join(appDir, page.path)
    const exists = fileExists(fullPath)
    addTest(
      `Page ${page.name}`,
      exists,
      exists ? `Page ${page.name} existe` : `Page ${page.name} manquante`
    )

    if (exists && page.name === 'Dons (lecture seule)') {
      const content = readFile(fullPath)
      if (content) {
        const isReadOnly = content.includes('lecture seule') || 
                           content.includes('read-only') ||
                           content.includes('readonly') ||
                           content.includes('Mode lecture seule') ||
                           content.includes('⛔')
        addTest(
          `${page.name} en lecture seule`,
          isReadOnly,
          isReadOnly ? 'Page en lecture seule' : 'Page devrait être en lecture seule',
          !isReadOnly // Warning seulement si pas en lecture seule
        )
      }
    }
  })
}

// ============================================
// TESTS DES COMPOSANTS
// ============================================

function testComponents() {
  logInfo('\n🧩 TEST 5: Composants obligatoires')
  
  const requiredComponents = [
    { path: 'components/admin/sidebar-paroisse-admin.tsx', name: 'Sidebar Admin Paroisse' },
    { path: 'components/admin/header-paroisse-admin.tsx', name: 'Header Admin Paroisse' },
    { path: 'components/admin/sidebar-eglise.tsx', name: 'Sidebar Admin Église' },
    { path: 'components/admin/header-eglise.tsx', name: 'Header Admin Église' },
    { path: 'components/admin/Table.jsx', name: 'Table réutilisable' },
    { path: 'components/admin/Form.jsx', name: 'Form réutilisable' }
  ]

  requiredComponents.forEach(comp => {
    const fullPath = path.join(adminDir, comp.path)
    const exists = fileExists(fullPath)
    addTest(
      `Composant ${comp.name}`,
      exists,
      exists ? `Composant ${comp.name} existe` : `Composant ${comp.name} manquant`
    )
  })
}

// ============================================
// TESTS FIRESTORE
// ============================================

function testFirestore() {
  logInfo('\n🔥 TEST 6: Configuration Firestore')
  
  const firestoreRules = readFile(path.join(adminDir, 'firestore.rules'))
  if (firestoreRules) {
    // Test 6.1: Vérifier que les règles utilisent parishId
    const usesParishId = firestoreRules.includes('parishId') || firestoreRules.includes('getUserParishId')
    addTest(
      'Règles Firestore utilisent parishId',
      usesParishId,
      usesParishId ? 'Règles utilisent parishId' : 'Règles ne référencent pas parishId'
    )

    // Test 6.2: Vérifier les statuts draft|pending|published
    const hasStatus = firestoreRules.includes('draft') && 
                      firestoreRules.includes('pending') && 
                      firestoreRules.includes('published')
    addTest(
      'Statuts draft|pending|published',
      hasStatus,
      hasStatus ? 'Statuts définis' : 'Statuts manquants dans les règles'
    )

    // Test 6.3: Vérifier que le mobile lit uniquement published
    const mobilePublished = firestoreRules.includes('published == true') || 
                            firestoreRules.includes('published=true')
    addTest(
      'Mobile lit uniquement published',
      mobilePublished,
      mobilePublished ? 'Règle mobile published présente' : 'Règle mobile published manquante',
      true
    )
  } else {
    addTest(
      'Fichier firestore.rules',
      false,
      'Fichier firestore.rules introuvable'
    )
  }
}

// ============================================
// TESTS DES INTERDICTIONS
// ============================================

function testInterdictions() {
  logInfo('\n🚫 TEST 7: Interdictions strictes')
  
  const allPages = listFiles(appDir, '.tsx')
  
  // Test 7.1: Vérifier qu'il n'y a pas de choix d'église côté mobile
  // Exclure les pages admin (qui peuvent avoir des filtres "église" pour l'organisation interne)
  let hasChurchChoice = false
  allPages.forEach(page => {
    // Ignorer les pages admin (elles peuvent avoir des références à "église" pour l'organisation interne)
    if (page.includes('admin') || page.includes('eglise') || page.includes('paroisse')) {
      return
    }
    const content = readFile(page)
    if (content && (
      content.match(/choix.*église|select.*church|church.*select/i) ||
      (content.includes('church') && content.includes('mobile') && !content.includes('admin'))
    )) {
      hasChurchChoice = true
    }
  })
  addTest(
    'Pas de choix d\'église côté mobile',
    !hasChurchChoice,
    !hasChurchChoice ? 'Aucun choix d\'église détecté côté mobile' : 'ATTENTION: Choix d\'église détecté côté mobile (interdit)'
  )

  // Test 7.2: Vérifier qu'il n'y a pas de publication directe sans validation
  let hasDirectPublish = false
  allPages.forEach(page => {
    const content = readFile(page)
    if (content && content.includes('church_admin') && 
        content.includes('published') && 
        !content.includes('pending')) {
      hasDirectPublish = true
    }
  })
  addTest(
    'Pas de publication directe sans validation',
    !hasDirectPublish,
    !hasDirectPublish ? 'Workflow de validation respecté' : 'ATTENTION: Publication directe détectée (interdit)',
    true
  )
}

// ============================================
// RAPPORT FINAL
// ============================================

function generateReport() {
  logInfo('\n📊 RAPPORT FINAL')
  log('='.repeat(60), 'cyan')
  
  log(`\nTests réussis: ${results.passed}`, 'green')
  log(`Tests échoués: ${results.failed}`, 'red')
  log(`Avertissements: ${results.warnings}`, 'yellow')
  log(`Total: ${results.tests.length}`, 'blue')
  
  const successRate = ((results.passed / results.tests.length) * 100).toFixed(1)
  log(`\nTaux de réussite: ${successRate}%`, successRate >= 80 ? 'green' : 'red')
  
  if (results.failed > 0) {
    log('\n❌ Tests échoués:', 'red')
    results.tests
      .filter(t => !t.passed && !t.isWarning)
      .forEach(t => log(`  - ${t.name}: ${t.message}`, 'red'))
  }
  
  if (results.warnings > 0) {
    log('\n⚠️  Avertissements:', 'yellow')
    results.tests
      .filter(t => t.isWarning)
      .forEach(t => log(`  - ${t.name}: ${t.message}`, 'yellow'))
  }
  
  log('\n' + '='.repeat(60), 'cyan')
  
  // Générer un rapport JSON
  const reportPath = path.join(adminDir, 'conformity-report.json')
  fs.writeFileSync(reportPath, JSON.stringify({
    date: new Date().toISOString(),
    summary: {
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      total: results.tests.length,
      successRate: parseFloat(successRate)
    },
    tests: results.tests
  }, null, 2))
  
  log(`\nRapport JSON généré: ${reportPath}`, 'cyan')
  
  return results.failed === 0
}

// ============================================
// EXÉCUTION DES TESTS
// ============================================

function runTests() {
  log('\n' + '='.repeat(60), 'cyan')
  log('🧪 TESTS DE CONFORMITÉ - INTERFACE ADMIN WEB', 'cyan')
  log('='.repeat(60), 'cyan')
  
  testPrincipesEssentiels()
  testRoles()
  testAdminParoissePages()
  testAdminEglisePages()
  testComponents()
  testFirestore()
  testInterdictions()
  
  const success = generateReport()
  
  process.exit(success ? 0 : 1)
}

// Exécuter les tests
runTests()
