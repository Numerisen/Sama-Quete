const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  setDoc
} = require('firebase/firestore');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} = require('firebase/auth');

// Configuration Firebase (même que dans firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyAR8kwZE9ats8NmUVbIfTzxOZDzmiyToQQ",
  authDomain: "numerisen-14a03.firebaseapp.com",
  projectId: "numerisen-14a03",
  storageBucket: "numerisen-14a03.firebasestorage.app",
  messagingSenderId: "764890122669",
  appId: "1:764890122669:web:6e07cde20ce346bb3b3924",
  measurementId: "G-7KNWL23FBB"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Informations de l'utilisateur de test
const testUser = {
  email: "admin.paroisse@test.com",
  password: "Paroisse123!",
  name: "Admin Paroisse",
  role: "parish_admin",
  parish: "Paroisse Saint Jean Bosco",
  parishId: "paroisse-saint-jean-bosco",
  diocese: "Archidiocèse de Dakar",
  status: "Actif"
};

// Fonction pour créer l'utilisateur de test
async function createParishTestUser() {
  try {
    console.log('🚀 Création de l\'utilisateur de test paroisse...');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Mot de passe:', testUser.password);

    // Créer l'utilisateur avec Firebase Auth
    console.log('👤 Création du compte utilisateur...');
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      testUser.email, 
      testUser.password
    );
    
    const user = userCredential.user;
    console.log('✅ Compte utilisateur créé avec succès!');
    console.log('🆔 UID:', user.uid);

    // Mettre à jour le profil utilisateur
    await updateProfile(user, {
      displayName: testUser.name
    });
    console.log('✅ Profil utilisateur mis à jour');

    // Créer le document utilisateur dans Firestore
    console.log('📝 Création du document utilisateur dans Firestore...');
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: testUser.name,
      email: testUser.email,
      role: testUser.role,
      parish: testUser.parish,
      parishId: testUser.parishId,
      diocese: testUser.diocese,
      status: testUser.status,
      permissions: {
        canManageUsers: true,
        canManageDioceses: false,
        canManageParishes: false,
        canManageContent: true,
        canViewReports: true,
        canManageDonations: true
      },
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Document utilisateur créé dans Firestore');

    console.log('\n🎉 Utilisateur de test créé avec succès!');
    console.log('📋 Informations de connexion:');
    console.log('============================');
    console.log('🌐 URL: http://localhost:3000/login');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Mot de passe:', testUser.password);
    console.log('🏛️ Paroisse:', testUser.parish);
    console.log('👤 Rôle:', testUser.role);
    console.log('🆔 UID:', user.uid);

    console.log('\n📝 Instructions:');
    console.log('1. Allez sur http://localhost:3000/login');
    console.log('2. Sélectionnez "Admin Paroisse"');
    console.log('3. Connectez-vous avec les identifiants ci-dessus');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️ L\'email est déjà utilisé. Tentative de connexion...');
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          testUser.email, 
          testUser.password
        );
        console.log('✅ Connexion réussie avec l\'utilisateur existant');
        console.log('🆔 UID:', userCredential.user.uid);
        console.log('📧 Email:', testUser.email);
        console.log('🔑 Mot de passe:', testUser.password);
      } catch (signInError) {
        console.error('❌ Erreur de connexion:', signInError.message);
        console.log('💡 Essayez de réinitialiser le mot de passe dans la console Firebase');
      }
    } else {
      console.log('💡 Vérifiez que Firebase est correctement configuré');
      console.log('💡 Vérifiez que l\'authentification par email/mot de passe est activée');
    }
  }
}

// Exécuter la création
console.log('🏛️ Création de l\'utilisateur de test pour l\'interface paroisse');
createParishTestUser();
