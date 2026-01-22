/**
 * Script pour tester l'API de dons
 * Usage: node scripts/test-donations-api.js
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Normaliser la clé privée
function normalizePrivateKey(key) {
  if (!key) return '';
  let normalized = key.replace(/^["']|["']$/g, '');
  normalized = normalized.replace(/\\n/g, '\n');
  return normalized;
}

// Initialiser Firebase Admin
function initializeFirebase() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/"/g, '') || 'samaquete-admin-new';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.replace(/"/g, '');
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!clientEmail || !privateKey) {
    console.error('❌ Firebase Admin SDK non configuré');
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

async function testDonationsAPI() {
  console.log('🧪 Test de l\'API de dons...\n');

  try {
    // Initialiser Firebase
    const app = initializeFirebase();
    const auth = getAuth(app);

    // Créer un token pour un utilisateur admin de test
    // Remplacez par l'email d'un admin réel
    const testEmail = 'admin@admin.com';
    let user;
    try {
      user = await auth.getUserByEmail(testEmail);
    } catch (error) {
      console.error(`❌ Utilisateur ${testEmail} non trouvé`);
      console.log('💡 Créez un utilisateur admin avec: npm run create-admin');
      process.exit(1);
    }

    // Créer un token personnalisé
    const token = await auth.createCustomToken(user.uid, {
      role: 'super_admin',
    });

    console.log('✅ Token créé pour:', testEmail);
    console.log('📡 Test de l\'API...\n');

    const API_URL = process.env.NEXT_PUBLIC_DONATIONS_API_URL || 'https://payment-api-pink.vercel.app/api';
    const url = `${API_URL}/admin/payments`;

    console.log('URL:', url);

    // Échanger le custom token contre un ID token
    // Note: Ceci nécessite Firebase Client SDK, donc on va utiliser directement le custom token
    // ou mieux, utiliser l'API Firebase pour obtenir un ID token
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📊 Statut:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n📦 Données reçues:');
    console.log('   Total payments:', data.payments?.length || 0);
    console.log('   Total:', data.total);
    
    if (data.payments && data.payments.length > 0) {
      const donations = data.payments.filter(p => p.planId?.startsWith('DONATION_'));
      console.log('   Dons (DONATION_):', donations.length);
      
      if (donations.length > 0) {
        console.log('\n📋 Exemples de dons:');
        donations.slice(0, 3).forEach((donation, i) => {
          console.log(`   ${i + 1}. ID: ${donation.id}, PlanId: ${donation.planId}, Montant: ${donation.amount} FCFA, Statut: ${donation.status}`);
        });
      } else {
        console.log('\n⚠️  Aucun don trouvé (planId commence par DONATION_)');
        console.log('   Exemples de planId trouvés:');
        data.payments.slice(0, 5).forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.planId || 'N/A'}`);
        });
      }
    } else {
      console.log('\n⚠️  Aucun paiement trouvé dans la base de données');
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error.stack);
  }
}

testDonationsAPI();
