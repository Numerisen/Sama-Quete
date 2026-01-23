// Script pour créer le compte admin eglise dans Firebase
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

// Configuration Firebase
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

// Informations de l'utilisateur admin eglise
const adminEglise = {
  email: "admin.eglise@test.com",
  password: "Eglise123!",
  name: "Admin Église",
  role: "parish_admin",
  parish: "Église Saint Jean Bosco",
  parishId: "eglise-saint-jean-bosco",
  diocese: "Archidiocèse de Dakar",
  dioceseId: "archidiocese-dakar",
  status: "Actif"
};

// Fonction pour créer l'utilisateur admin eglise
async function createAdminEgliseUser() {
  try {
    console.log('🚀 Création de l\'utilisateur admin eglise...');

    // Créer l'utilisateur avec Firebase Auth
    console.log('👤 Création du compte utilisateur...');
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      adminEglise.email, 
      adminEglise.password
    );
    
    const user = userCredential.user;
    console.log('✅ Compte utilisateur créé:', user.uid);

    // Mettre à jour le profil utilisateur
    await updateProfile(user, {
      displayName: adminEglise.name
    });
    console.log('✅ Profil utilisateur mis à jour');

    // Créer le document utilisateur dans Firestore
    console.log('📝 Création du document utilisateur dans Firestore...');
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: adminEglise.name,
      email: adminEglise.email,
      displayName: adminEglise.name,
      role: adminEglise.role,
      parish: adminEglise.parish,
      parishId: adminEglise.parishId,
      diocese: adminEglise.diocese,
      dioceseId: adminEglise.dioceseId,
      status: adminEglise.status,
      isActive: true,
      permissions: {
        canManageUsers: false,
        canManageDioceses: false,
        canManageParishes: false,
        canManageContent: true,
        canViewReports: true,
        canManageDonations: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Document utilisateur créé dans Firestore');

    // Créer également un document dans la collection parish_users
    console.log('🏛️ Création du document dans parish_users...');
    await addDoc(collection(db, 'parish_users'), {
      name: adminEglise.name,
      email: adminEglise.email,
      phone: "+221 77 123 45 67",
      role: "admin",
      status: "active",
      parishId: adminEglise.parishId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Document parish_users créé');

    console.log('\n🎉 Utilisateur admin eglise créé avec succès!');
    console.log('📧 Email:', adminEglise.email);
    console.log('🔑 Mot de passe:', adminEglise.password);
    console.log('🏛️ Église:', adminEglise.parish);
    console.log('👤 Rôle:', adminEglise.role);
    console.log('🆔 UID:', user.uid);

    console.log('\n📋 Informations de connexion:');
    console.log('URL: http://localhost:3000/login');
    console.log('Email:', adminEglise.email);
    console.log('Mot de passe:', adminEglise.password);
    console.log('\n✅ Après connexion, vous serez redirigé vers:');
    console.log(`   /admineglise/dashboard?eglise=${encodeURIComponent(adminEglise.parish)}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️ L\'email est déjà utilisé. Tentative de connexion...');
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          adminEglise.email, 
          adminEglise.password
        );
        console.log('✅ Connexion réussie avec l\'utilisateur existant');
        console.log('🆔 UID:', userCredential.user.uid);
        console.log('\n💡 Le compte existe déjà. Vous pouvez vous connecter avec:');
        console.log('   Email:', adminEglise.email);
        console.log('   Mot de passe:', adminEglise.password);
      } catch (signInError) {
        console.error('❌ Erreur de connexion:', signInError);
        console.log('\n💡 Le compte existe mais le mot de passe est différent.');
        console.log('   Utilisez la console Firebase pour réinitialiser le mot de passe.');
      }
    } else {
      console.log('\n💡 Solutions possibles :');
      console.log('1. Vérifiez la configuration Firebase');
      console.log('2. Vérifiez que les règles Firestore permettent l\'écriture');
      console.log('3. Vérifiez votre connexion internet');
    }
  }
}

// Exécuter la création
console.log('🏛️ Création de l\'utilisateur admin eglise');
console.log('==========================================\n');
createAdminEgliseUser();

