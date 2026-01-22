/**
 * Script pour vérifier les claims d'un utilisateur Firebase
 * 
 * Usage: node scripts/check-user-claims.js [email]
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Normalisation de la clé privée
function normalizePrivateKey(key) {
  if (!key) return '';
  return key.replace(/\\n/g, '\n');
}

// Configuration Firebase Admin
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 
                    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.replace(/"/g, '') ||
                    'samaquete-admin-new';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!clientEmail || !privateKey) {
    console.error('❌ Service account non configuré dans .env.local');
    console.log('   Vérifiez que FIREBASE_CLIENT_EMAIL et FIREBASE_PRIVATE_KEY sont définis');
    process.exit(1);
  }

  return initializeApp({
    credential: cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    }),
  });
}

// Vérifier les claims d'un utilisateur
async function checkUserClaims(email) {
  try {
    const app = initializeFirebaseAdmin();
    const auth = getAuth(app);

    // Récupérer l'utilisateur par email
    const user = await auth.getUserByEmail(email);
    
    console.log('\n📋 Informations utilisateur:');
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Email vérifié: ${user.emailVerified}`);
    console.log(`   Créé le: ${user.metadata.creationTime}`);
    
    // Récupérer les claims personnalisés
    const userRecord = await auth.getUser(user.uid);
    const customClaims = userRecord.customClaims || {};
    
    console.log('\n🔑 Custom Claims:');
    if (Object.keys(customClaims).length === 0) {
      console.log('   ⚠️  Aucun custom claim défini');
      console.log('   💡 Les claims doivent être définis avec setCustomUserClaims()');
    } else {
      console.log('   ✅ Claims trouvés:');
      Object.entries(customClaims).forEach(([key, value]) => {
        console.log(`      ${key}: ${JSON.stringify(value)}`);
      });
    }

    // Vérifier le token pour voir les claims complets
    const token = await auth.createCustomToken(user.uid);
    console.log('\n📝 Token généré (pour test)');
    console.log(`   Token: ${token.substring(0, 50)}...`);

    return { user, customClaims };
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.log(`   L'utilisateur ${email} n'existe pas`);
    }
    throw error;
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const email = args[0] || 'admin@test.com';

  console.log(`🔍 Vérification des claims pour: ${email}\n`);

  try {
    await checkUserClaims(email);
    console.log('\n✅ Vérification terminée');
  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification:', error);
    process.exit(1);
  }
}

main();
