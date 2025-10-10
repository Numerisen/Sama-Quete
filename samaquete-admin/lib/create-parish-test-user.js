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

// Configuration Firebase (remplacez par votre configuration)
const firebaseConfig = {
  // Votre configuration Firebase ici
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
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
  diocese: "Archidiocèse de Dakar",
  status: "Actif"
};

// Fonction pour créer l'utilisateur de test
async function createParishTestUser() {
  try {
    console.log('🚀 Création de l\'utilisateur de test paroisse...');

    // Créer l'utilisateur avec Firebase Auth
    console.log('👤 Création du compte utilisateur...');
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      testUser.email, 
      testUser.password
    );
    
    const user = userCredential.user;
    console.log('✅ Compte utilisateur créé:', user.uid);

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
      parishId: "paroisse-saint-jean-bosco",
      diocese: testUser.diocese,
      status: testUser.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Document utilisateur créé dans Firestore');

    // Créer également un document dans la collection parish_users
    console.log('🏛️ Création du document dans parish_users...');
    await addDoc(collection(db, 'parish_users'), {
      name: testUser.name,
      email: testUser.email,
      phone: "+221 77 123 45 67",
      role: "admin",
      status: "active",
      parishId: "paroisse-saint-jean-bosco",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Document parish_users créé');

    console.log('🎉 Utilisateur de test créé avec succès!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Mot de passe:', testUser.password);
    console.log('🏛️ Paroisse:', testUser.parish);
    console.log('👤 Rôle:', testUser.role);
    console.log('🆔 UID:', user.uid);

    console.log('\n📋 Informations de connexion:');
    console.log('URL: http://localhost:3000/adminparoisse?paroisse=' + encodeURIComponent(testUser.parish));
    console.log('Email:', testUser.email);
    console.log('Mot de passe:', testUser.password);

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
      } catch (signInError) {
        console.error('❌ Erreur de connexion:', signInError);
      }
    }
  }
}

// Fonction pour créer plusieurs utilisateurs de test
async function createMultipleParishTestUsers() {
  const testUsers = [
    {
      email: "admin.paroisse@test.com",
      password: "Paroisse123!",
      name: "Admin Paroisse",
      role: "parish_admin",
      parish: "Paroisse Saint Jean Bosco",
      diocese: "Archidiocèse de Dakar",
      status: "Actif"
    },
    {
      email: "cure.paroisse@test.com",
      password: "Cure123!",
      name: "Père Jean - Curé",
      role: "parish_admin",
      parish: "Paroisse Saint Jean Bosco",
      diocese: "Archidiocèse de Dakar",
      status: "Actif"
    },
    {
      email: "secretaire.paroisse@test.com",
      password: "Secretaire123!",
      name: "Sœur Marie - Secrétaire",
      role: "parish_admin",
      parish: "Paroisse Saint Jean Bosco",
      diocese: "Archidiocèse de Dakar",
      status: "Actif"
    }
  ];

  for (const user of testUsers) {
    try {
      console.log(`\n🚀 Création de l'utilisateur: ${user.name}...`);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        user.email, 
        user.password
      );
      
      const firebaseUser = userCredential.user;
      console.log('✅ Compte créé:', firebaseUser.uid);

      await updateProfile(firebaseUser, {
        displayName: user.name
      });

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        uid: firebaseUser.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        parish: user.parish,
        parishId: "paroisse-saint-jean-bosco",
        diocese: user.diocese,
        status: user.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Utilisateur créé avec succès:', user.name);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('⚠️ Email déjà utilisé:', user.email);
      } else {
        console.error('❌ Erreur pour', user.name, ':', error.message);
      }
    }
  }
}

// Exécuter la création
console.log('🏛️ Création des utilisateurs de test pour l\'interface paroisse');
console.log('Choisissez une option:');
console.log('1. Créer un seul utilisateur admin');
console.log('2. Créer plusieurs utilisateurs de test');

// Pour cet exemple, on crée un seul utilisateur
createParishTestUser();
