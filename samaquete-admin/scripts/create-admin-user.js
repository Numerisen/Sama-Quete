/**
 * Script pour créer un utilisateur admin de test
 * 
 * Usage: node scripts/create-admin-user.js [role] [email] [password]
 * 
 * Exemples:
 *   node scripts/create-admin-user.js super_admin admin@test.com password123
 *   node scripts/create-admin-user.js parish_admin parish@test.com password123
 * 
 * Rôles disponibles:
 *   - super_admin
 *   - archdiocese_admin
 *   - diocese_admin
 *   - parish_admin
 *   - church_admin
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

  // Utiliser FIREBASE_PROJECT_ID ou NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const projectId = process.env.FIREBASE_PROJECT_ID || 
                    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.replace(/"/g, '') ||
                    'numerisen-14a03';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  // Si pas de service account, utiliser Application Default Credentials
  if (!clientEmail || !privateKey) {
    console.log('⚠️  Pas de service account trouvé, utilisation des credentials par défaut');
    try {
      return initializeApp({
        projectId: projectId,
      });
    } catch (error) {
      console.error('❌ Erreur d\'initialisation:', error.message);
      console.log('\n💡 SOLUTION:');
      console.log('1. Téléchargez votre service account depuis Firebase Console');
      console.log('2. Ajoutez les variables dans .env.local:');
      console.log('   FIREBASE_PROJECT_ID=votre_project_id');
      console.log('   FIREBASE_CLIENT_EMAIL=votre_client_email');
      console.log('   FIREBASE_PRIVATE_KEY="votre_private_key"');
      process.exit(1);
    }
  }

  return initializeApp({
    credential: cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    }),
  });
}

// Créer un utilisateur avec claims personnalisés
async function createAdminUser(role, email, password, dioceseId, parishId, churchId) {
  try {
    const app = initializeFirebaseAdmin();
    const auth = getAuth(app);

    // Vérifier si l'utilisateur existe déjà
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`⚠️  L'utilisateur ${email} existe déjà (UID: ${user.uid})`);
      console.log('   Mise à jour des claims...');
    } catch (error) {
      // Créer l'utilisateur
      user = await auth.createUser({
        email: email,
        password: password,
        emailVerified: true,
      });
      console.log(`✅ Utilisateur créé: ${email} (UID: ${user.uid})`);
    }

    // Définir les claims personnalisés
    const customClaims = {
      role: role,
    };

    if (dioceseId) {
      customClaims.dioceseId = dioceseId;
    }
    if (parishId) {
      customClaims.parishId = parishId;
    }
    if (churchId) {
      customClaims.churchId = churchId;
    }

    await auth.setCustomUserClaims(user.uid, customClaims);
    console.log(`✅ Claims définis:`, customClaims);

    // Récupérer le token pour vérification
    const token = await auth.createCustomToken(user.uid);
    console.log(`\n📋 Informations de connexion:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    if (dioceseId) console.log(`   DioceseId: ${dioceseId}`);
    if (parishId) console.log(`   ParishId: ${parishId}`);
    if (churchId) console.log(`   ChurchId: ${churchId}`);
    console.log(`\n✅ Utilisateur admin créé avec succès!`);
    console.log(`\n💡 Vous pouvez maintenant vous connecter à l'interface admin avec ces identifiants.`);

    return { uid: user.uid, email, customClaims };
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('📖 Usage: node scripts/create-admin-user.js [role] [email] [password] [dioceseId] [parishId] [churchId]');
    console.log('\n📋 Exemples:');
    console.log('   # Super Admin (accès total)');
    console.log('   node scripts/create-admin-user.js super_admin admin@test.com password123');
    console.log('\n   # Admin Diocèse');
    console.log('   node scripts/create-admin-user.js diocese_admin diocese@test.com password123 THIES');
    console.log('\n   # Admin Paroisse');
    console.log('   node scripts/create-admin-user.js parish_admin parish@test.com password123 THIES PAR_001');
    console.log('\n   # Admin Église');
    console.log('   node scripts/create-admin-user.js church_admin church@test.com password123 THIES PAR_001 CH_001');
    console.log('\n📋 Rôles disponibles:');
    console.log('   - super_admin');
    console.log('   - archdiocese_admin');
    console.log('   - diocese_admin');
    console.log('   - parish_admin');
    console.log('   - church_admin');
    process.exit(1);
  }

  const [role, email, password, dioceseId, parishId, churchId] = args;

  const validRoles = ['super_admin', 'archdiocese_admin', 'diocese_admin', 'parish_admin', 'church_admin'];
  if (!validRoles.includes(role)) {
    console.error(`❌ Rôle invalide: ${role}`);
    console.log(`   Rôles valides: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  // Validation des paramètres selon le rôle
  if (role === 'diocese_admin' && !dioceseId) {
    console.error('❌ dioceseId requis pour diocese_admin');
    process.exit(1);
  }
  if (role === 'parish_admin' && (!dioceseId || !parishId)) {
    console.error('❌ dioceseId et parishId requis pour parish_admin');
    process.exit(1);
  }
  if (role === 'church_admin' && (!dioceseId || !parishId || !churchId)) {
    console.error('❌ dioceseId, parishId et churchId requis pour church_admin');
    process.exit(1);
  }

  try {
    await createAdminUser(role, email, password, dioceseId, parishId, churchId);
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    process.exit(1);
  }
}

main();
