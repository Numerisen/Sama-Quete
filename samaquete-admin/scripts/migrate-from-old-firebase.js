/**
 * Script pour migrer les données de l'ancien Firebase vers le nouveau
 * 
 * Usage: node scripts/migrate-from-old-firebase.js
 * 
 * Ce script :
 * 1. Se connecte à l'ancien Firebase (numerisen-14a03)
 * 2. Lit toutes les données
 * 3. Les transfère vers le nouveau Firebase (samaquete-admin-new)
 */

// Charger les variables d'environnement depuis .env.local (nouveau Firebase)
require('dotenv').config({ path: '.env.local' });
// Charger aussi depuis .env à la racine (ancien Firebase)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// Normalisation de la clé privée
function normalizePrivateKey(key) {
  if (!key) return '';
  // Enlever les guillemets au début et à la fin
  let normalized = key.replace(/^["']|["']$/g, '');
  // Remplacer \n par de vrais retours à la ligne
  normalized = normalized.replace(/\\n/g, '\n');
  return normalized;
}

// Configuration ancien Firebase (source)
function initializeOldFirebase() {
  const oldProjectId = 'numerisen-14a03';
  const oldClientEmail = 'firebase-adminsdk-h7k2m@numerisen-14a03.iam.gserviceaccount.com';
  const oldPrivateKey = normalizePrivateKey(process.env.OLD_FIREBASE_PRIVATE_KEY || 
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDRL6wJXsryMW/a\nRF5yTemgDw0nPTPePSjh/AKbeGS87hQP1K82vf27pK1EVWYrjJ8zHwevwlSn9lTO\nG29N+0LKu2afHLh5p5BLNJ3Y0G1i2zdbh4xBu/KdOZSujcMHUcoqUNRO+WNVDymH\n89wEXlw6sTlkSr3alYYMGUnoI3rE/fuua7POWZ2XbF0RgfZhsOFrlKzJ55xS/LLt\nI19JysodWMFWyWCKBMuRCNX0NDXTiHrwGjayrzF59VftlmWRDOgSyANWTbyJq4ry\nHAvtNKnZLmcegGfxUDPXHjtTdIAZhRBfCCn2MmK3dERDzTJZ70lzdtDg0ozNzNRH\nFBrrc9XZAgMBAAECggEADFMKh+YhqdbszUdq6GwbtWuS7aVm9BMsC0hoNOsJGwfM\nfx7w5cDtfTaCDifD5GadYzXS+PFyQGURxlo1Grs7dQCegVr//rbhwvSKJOHUGAIX\nXFlQ6Pc0SjwVZ5qq4LhaY1eDcqsHGwCmL0AtoxpAxSUiNFJM+4mvWJt4Jb5Kt5FY\ndDK4dn0vua/hWhtX97GlP4qb7atvoGMjFlp+v099pnVm3uTXF+ZdwCXUasN2xUei\nVwrOFRTsWMGmyAd0MUJNVqzuJMvSpxJf+UKkHbXoDMi1T0gBgLzJkniwB1kgp3XT\nZoc5ABSAWNQOpPaVrkBfRRJMfTDlgG1gUKwi3yGqKQKBgQD+iPX9C4S/nXvYWICg\nYvSAG+Mt0GmbfZkMLdzrSS1KUZteLKD+OiVtsobt4YJFaZEsZDrAbyAjbZ0ZScWn\naKboDoEBucYHdyFxqXYPd+XbhwxN0PNaE9NRK4pUpErA97vP5C9kGxxudngNxojD\nGgfLEVNihEe1wRv2NT8la0beBQKBgQDSY+SXjW1S1Fyhit5j559VPj5VMogBkxe6\nJBHWIUkzJ69gP/qdbPs/VidYiSk+8U3du/b9mmyPlr+jj3p+Cp5WrIKI33xI6LOZ\nrZtA6bszwpXEIPFIYcigBTX2ncJ7ehFJS+thKEhIFLahrMdvq1pZGoz3sa5BE67G\nIbbYIjPMxQKBgFo2uNjjCD3R118qnww5hmcRe0d1oriVn3UNnEtYOFEq82JBdx4k\nBbgHmoMddkqby/Rr4dbqi/2CkDeySfe3w9Bjs52k9mcW9ieO5GU/HZzdFKNP97Bp\nbnBKelDdmhEivNJGEfXtFfqgypQ3VamwxCpZDbDRKYll1D9DSAo/J3LxAoGBAJw5\nQMyoX71Zo07w5yIYI+AQUAjDdOp2Zu/5SKVQIiKyHS/DUj0DZ60oNB8x+kaat88m\ne8jkmiglMDgrmjFtgRWrE2K/UHJzGKnMl7Qj2rYcj0kLjR7KPUdVlzSBAKDfi2Z5\n0VZbqxCbEOIMgisReg0gAf0LGvGHxAerkTH8c6phAoGAKbdBfu0dxhZPWrxShgBD\nvHDobJ7myHjibXA8h5+QmFpa0eIvBc3MxNB5xYt3rdYU5IhwCiYPAu8WW7ILvLwY\nFCRfic6nSb2wia01P6F2M4BM3IX0EOMb6nK5pXVzbwBl/6Ag1E8EAJJEOnqnhU5D\n9zolTBwsSUTV+nA1zoMgh1w=\n-----END PRIVATE KEY-----\n");

  return initializeApp({
    credential: cert({
      projectId: oldProjectId,
      clientEmail: oldClientEmail,
      privateKey: oldPrivateKey,
    }),
  }, 'old-firebase');
}

// Configuration nouveau Firebase (destination)
function initializeNewFirebase() {
  if (getApps().length > 0 && getApps().find(app => app.name === '[DEFAULT]')) {
    return getApps().find(app => app.name === '[DEFAULT]');
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 
                    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.replace(/"/g, '') ||
                    'samaquete-admin-new';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!clientEmail || !privateKey) {
    console.error('❌ Service account nouveau Firebase non configuré');
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

// Migrer une collection
async function migrateCollection(oldDb, newDb, oldCollectionName, newCollectionName, transformFn = null) {
  console.log(`\n📦 Migration: ${oldCollectionName} → ${newCollectionName}`);
  
  try {
    const snapshot = await oldDb.collection(oldCollectionName).get();
    console.log(`   📊 ${snapshot.size} documents trouvés`);

    if (snapshot.empty) {
      console.log(`   ⚠️  Collection vide, ignorée`);
      return { migrated: 0, skipped: 0, errors: 0 };
    }

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const docSnap of snapshot.docs) {
      try {
        const data = docSnap.data();
        const docId = docSnap.id;

        // Transformer les données si nécessaire
        let transformedData = transformFn ? transformFn(data, docId) : data;

        // Convertir les dates
        if (transformedData.createdAt && transformedData.createdAt.toDate) {
          transformedData.createdAt = Timestamp.fromDate(transformedData.createdAt.toDate());
        } else if (transformedData.createdAt && typeof transformedData.createdAt === 'string') {
          transformedData.createdAt = Timestamp.fromDate(new Date(transformedData.createdAt));
        } else if (!transformedData.createdAt) {
          transformedData.createdAt = Timestamp.now();
        }

        if (transformedData.updatedAt && transformedData.updatedAt.toDate) {
          transformedData.updatedAt = Timestamp.fromDate(transformedData.updatedAt.toDate());
        } else if (transformedData.updatedAt && typeof transformedData.updatedAt === 'string') {
          transformedData.updatedAt = Timestamp.fromDate(new Date(transformedData.updatedAt));
        } else {
          transformedData.updatedAt = Timestamp.now();
        }

        // Vérifier si le document existe déjà
        const existingDoc = await newDb.collection(newCollectionName).doc(docId).get();
        
        if (existingDoc.exists) {
          console.log(`   ⚠️  Document ${docId} existe déjà, mise à jour...`);
          await newDb.collection(newCollectionName).doc(docId).update(transformedData);
        } else {
          await newDb.collection(newCollectionName).doc(docId).set(transformedData);
        }

        migrated++;
      } catch (error) {
        console.error(`   ❌ Erreur pour document ${docSnap.id}:`, error.message);
        errors++;
      }
    }

    console.log(`   ✅ ${migrated} migrés, ${skipped} ignorés, ${errors} erreurs`);
    return { migrated, skipped, errors };
  } catch (error) {
    if (error.code === 5 || error.message.includes('not found')) {
      console.log(`   ⚠️  Collection ${oldCollectionName} n'existe pas dans l'ancien Firebase`);
      return { migrated: 0, skipped: 0, errors: 0 };
    }
    console.error(`   ❌ Erreur migration ${oldCollectionName}:`, error.message);
    return { migrated: 0, skipped: 0, errors: 1 };
  }
}

// Transformer les données selon le nouveau schéma
function transformParish(data, docId) {
  return {
    parishId: data.parishId || data.id || docId,
    name: data.name || data.displayName || data.parishName || '',
    dioceseId: data.dioceseId || data.diocese || 'DAKAR',
    isActive: data.isActive !== false,
    address: data.address || data.location || '',
    phone: data.phone || data.telephone || '',
    email: data.email || '',
  };
}

function transformChurch(data, docId) {
  return {
    churchId: data.churchId || data.id || docId,
    name: data.name || data.displayName || data.churchName || '',
    parishId: data.parishId || data.parish || '',
    dioceseId: data.dioceseId || data.diocese || 'DAKAR',
    isActive: data.isActive !== false,
    address: data.address || data.location || '',
  };
}

function transformNews(data, docId) {
  return {
    title: data.title || '',
    content: data.content || data.description || data.body || '',
    category: data.category || data.type || '',
    imageUrl: data.imageUrl || data.image || data.photoUrl || '',
    dioceseId: data.dioceseId || data.diocese || 'DAKAR',
    parishId: data.parishId || data.parish || '',
    status: data.status || (data.published ? 'published' : 'draft'),
    createdBy: data.createdBy || data.createdByUid || data.uid || '',
    createdByRole: data.createdByRole || 'parish_admin',
  };
}

// Main
async function main() {
  console.log('🚀 Migration des données de l\'ancien Firebase vers le nouveau...\n');

  try {
    // Initialiser les deux Firebase
    const oldApp = initializeOldFirebase();
    const newApp = initializeNewFirebase();
    
    const oldDb = getFirestore(oldApp);
    const newDb = getFirestore(newApp);

    console.log('✅ Connexions Firebase établies');
    console.log('   Source: numerisen-14a03');
    console.log('   Destination: samaquete-admin-new\n');

    // Collections à migrer (ancien nom -> nouveau nom)
    const collections = [
      { oldName: 'parishes', newName: 'parishes', transform: transformParish },
      { oldName: 'admin_parishes', newName: 'parishes', transform: transformParish },
      { oldName: 'churches', newName: 'churches', transform: transformChurch },
      { oldName: 'admin_news', newName: 'news', transform: transformNews },
      { oldName: 'news', newName: 'news', transform: transformNews },
      { oldName: 'donation_types', newName: 'donation_types', transform: null },
      { oldName: 'donationEvents', newName: 'donation_types', transform: null },
      { oldName: 'notifications', newName: 'notifications', transform: null },
      { oldName: 'activities', newName: 'activities', transform: null },
      { oldName: 'parish_activities', newName: 'activities', transform: null },
      { oldName: 'prayers', newName: 'prayers', transform: null },
      { oldName: 'parish_prayer_times', newName: 'prayers', transform: null },
    ];

    let totalMigrated = 0;
    let totalErrors = 0;

    for (const collection of collections) {
      const result = await migrateCollection(
        oldDb,
        newDb,
        collection.oldName,
        collection.newName,
        collection.transform
      );
      totalMigrated += result.migrated;
      totalErrors += result.errors;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE LA MIGRATION');
    console.log('='.repeat(60));
    console.log(`✅ Documents migrés: ${totalMigrated}`);
    console.log(`❌ Erreurs: ${totalErrors}`);
    console.log('\n✅ Migration terminée!');
    console.log('\n💡 Vérifiez les données dans Firebase Console > Firestore Database');

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

main();
