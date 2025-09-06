# Règles de Sécurité Firestore pour SamaQuete Mobile

## 🔐 Règles Recommandées

Copiez et collez ces règles dans la console Firebase (Firestore > Règles) :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Paroisses - Lecture publique, écriture authentifiée
    match /parishes/{parishId} {
      allow read: if true; // Lecture publique pour le mobile
      allow write: if request.auth != null; // Écriture pour les admins
    }
    
    // Actualités - Lecture publique pour les publiées, écriture authentifiée
    match /news/{newsId} {
      allow read: if resource.data.published == true; // Seulement les actualités publiées
      allow write: if request.auth != null; // Écriture pour les admins
    }
    
    // Liturgie - Lecture publique, écriture authentifiée
    match /liturgy/{liturgyId} {
      allow read: if true; // Lecture publique pour le mobile
      allow write: if request.auth != null; // Écriture pour les admins
    }
    
    // Notifications - Lecture publique pour les publiées, écriture authentifiée
    match /notifications/{notificationId} {
      allow read: if resource.data.published == true; // Seulement les notifications publiées
      allow write: if request.auth != null; // Écriture pour les admins
    }
    
    // Dons - Lecture/écriture authentifiée uniquement
    match /donations/{donationId} {
      allow read, write: if request.auth != null; // Authentification requise
    }
    
    // Utilisateurs - Accès à ses propres données uniquement
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Diocèses - Lecture publique, écriture authentifiée
    match /dioceses/{dioceseId} {
      allow read: if true; // Lecture publique pour le mobile
      allow write: if request.auth != null; // Écriture pour les admins
    }
  }
}
```

## 🚀 Comment Appliquer les Règles

1. **Connectez-vous à la [Console Firebase](https://console.firebase.google.com/)**
2. **Sélectionnez votre projet "numerisen"**
3. **Allez dans "Firestore Database"**
4. **Cliquez sur l'onglet "Règles"**
5. **Remplacez le contenu par les règles ci-dessus**
6. **Cliquez sur "Publier"**

## 🔍 Explication des Règles

### Lecture Publique (Mobile)
- **Paroisses** : Accessibles à tous (pour la sélection d'église)
- **Liturgie** : Accessible à tous (textes du jour)
- **Actualités publiées** : Seulement celles marquées `published: true`
- **Notifications publiées** : Seulement celles marquées `published: true`

### Écriture Authentifiée (Admin)
- **Toutes les collections** : Seuls les utilisateurs connectés peuvent écrire
- **Utilisateurs** : Chaque utilisateur ne peut modifier que ses propres données

### Sécurité
- **Dons** : Authentification requise (données sensibles)
- **Données non publiées** : Inaccessibles au mobile
- **Protection contre l'accès non autorisé**

## ⚠️ Mode Test Temporaire

Si vous voulez tester rapidement, vous pouvez temporairement utiliser ces règles (ATTENTION : moins sécurisées) :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Accès total - UNIQUEMENT POUR LES TESTS
    }
  }
}
```

**⚠️ IMPORTANT : Ne gardez pas ces règles en production !**

## 🛠️ Dépannage

### Erreur "Missing or insufficient permissions"
1. Vérifiez que les règles sont correctement appliquées
2. Vérifiez que les documents ont les champs requis (`published: true` pour news/notifications)
3. Redémarrez l'application mobile

### Erreur "Firebase not initialized"
1. Vérifiez que les clés Firebase sont correctes
2. Vérifiez que Firestore est activé dans la console Firebase
3. Vérifiez que le projet Firebase est le bon

## 📱 Test de Connexion

Après avoir appliqué les règles, l'application mobile devrait :
- ✅ Charger les paroisses sans erreur
- ✅ Afficher les actualités publiées
- ✅ Montrer les textes liturgiques
- ✅ Recevoir les notifications publiées
