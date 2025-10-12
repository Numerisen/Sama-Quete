const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  // Configuration Firebase (à remplacer par la vraie config)
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestActivities() {
  console.log('🚀 Création des données de test pour les journaux d\'activités...\n');
  
  const testUserId = 'test-user-id'; // Remplacer par un vrai ID utilisateur
  const testParishId = 'test-parish-id'; // Remplacer par un vrai ID paroisse
  
  const activities = [
    {
      userId: testUserId,
      action: 'login',
      description: 'Connexion au système',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      userId: testUserId,
      action: 'prayer_time_create',
      description: 'Heure de prière créée',
      entityType: 'prayer_time',
      entityId: 'prayer-1',
      entityName: 'Prière du matin',
      timestamp: new Date(Date.now() - 90 * 60 * 1000), // Il y a 1h30
      changes: {
        before: null,
        after: {
          name: 'Prière du matin',
          time: '06:00',
          days: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
          active: true
        },
        fields: ['name', 'time', 'days', 'active']
      }
    },
    {
      userId: testUserId,
      action: 'news_create',
      description: 'Actualité créée',
      entityType: 'news',
      entityId: 'news-1',
      entityName: 'Messe de Noël 2024',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // Il y a 1h
      changes: {
        before: null,
        after: {
          title: 'Messe de Noël 2024',
          content: 'Nous vous invitons à la messe de Noël...',
          category: 'Événement',
          published: true
        },
        fields: ['title', 'content', 'category', 'published']
      }
    },
    {
      userId: testUserId,
      action: 'prayer_time_update',
      description: 'Heure de prière modifiée',
      entityType: 'prayer_time',
      entityId: 'prayer-1',
      entityName: 'Prière du matin',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // Il y a 45min
      changes: {
        before: {
          name: 'Prière du matin',
          time: '06:00',
          days: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
          active: true
        },
        after: {
          name: 'Prière du matin',
          time: '06:30',
          days: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
          active: true
        },
        fields: ['time']
      }
    },
    {
      userId: testUserId,
      action: 'donation_type_create',
      description: 'Type de don créé',
      entityType: 'donation_type',
      entityId: 'donation-type-1',
      entityName: 'Offrande de messe',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // Il y a 30min
      changes: {
        before: null,
        after: {
          name: 'Offrande de messe',
          description: 'Pour les intentions de messe',
          defaultAmounts: [5000, 10000, 15000, 20000],
          active: true
        },
        fields: ['name', 'description', 'defaultAmounts', 'active']
      }
    },
    {
      userId: testUserId,
      action: 'news_update',
      description: 'Actualité modifiée',
      entityType: 'news',
      entityId: 'news-1',
      entityName: 'Messe de Noël 2024',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // Il y a 15min
      changes: {
        before: {
          title: 'Messe de Noël 2024',
          content: 'Nous vous invitons à la messe de Noël...',
          category: 'Événement',
          published: true
        },
        after: {
          title: 'Messe de Noël 2024 - Mise à jour',
          content: 'Nous vous invitons à la messe de Noël... L\'horaire a été modifié.',
          category: 'Événement',
          published: true
        },
        fields: ['title', 'content']
      }
    },
    {
      userId: testUserId,
      action: 'password_change',
      description: 'Mot de passe modifié',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // Il y a 10min
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      userId: testUserId,
      action: 'profile_update',
      description: 'Profil mis à jour',
      entityType: 'user',
      entityId: testUserId,
      entityName: 'Admin Paroisse',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // Il y a 5min
      changes: {
        before: {
          name: 'Admin Paroisse',
          phone: '+221 77 123 45 67',
          bio: 'Administrateur de la paroisse'
        },
        after: {
          name: 'Admin Paroisse',
          phone: '+221 77 123 45 68',
          bio: 'Administrateur de la paroisse Saint Jean Bosco'
        },
        fields: ['phone', 'bio']
      }
    }
  ];

  try {
    for (const activity of activities) {
      await addDoc(collection(db, 'activity_logs'), {
        ...activity,
        timestamp: serverTimestamp()
      });
      console.log(`✅ Activité créée: ${activity.description}`);
    }
    
    console.log(`\n🎉 ${activities.length} activités de test créées avec succès !`);
    console.log('\n📊 Types d\'activités créées:');
    console.log('   • Connexion');
    console.log('   • Création d\'heure de prière');
    console.log('   • Création d\'actualité');
    console.log('   • Modification d\'heure de prière');
    console.log('   • Création de type de don');
    console.log('   • Modification d\'actualité');
    console.log('   • Changement de mot de passe');
    console.log('   • Mise à jour de profil');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des activités:', error);
  }
}

// Exécuter le script
createTestActivities();
