// Script de test pour vérifier la configuration Firebase
console.log('=== Configuration Firebase ===');
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Définie' : '❌ Manquante');
console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ Manquant');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ Manquant');
console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '❌ Manquant');
console.log('Messaging Sender ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '❌ Manquant');
console.log('App ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Définie' : '❌ Manquante');
console.log('===============================');
