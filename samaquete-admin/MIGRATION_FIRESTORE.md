# 🔄 Migration vers Firestore - Guide Complet

## 📋 Vue d'ensemble

Ce guide vous accompagne dans la migration de toutes les données de localStorage vers Firebase/Firestore pour centraliser le stockage des données admin et admin diocèse.

## 🎯 Objectifs

- ✅ Remplacer localStorage par Firestore
- ✅ Centraliser toutes les données admin
- ✅ Synchronisation en temps réel
- ✅ Sécurité renforcée
- ✅ Sauvegarde automatique

## 📊 Collections Firestore

### Collections créées :
- `admin_users` - Utilisateurs administrateurs
- `admin_news` - Actualités
- `admin_parishes` - Paroisses
- `admin_donations` - Dons
- `admin_liturgy` - Liturgie

## 🚀 Étapes de Migration

### 1. Configuration Firebase

Assurez-vous que votre configuration Firebase est correcte dans `lib/firebase.ts` :

```typescript
const firebaseConfig = {
  apiKey: "VOTRE_CLE_API",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "votre-app-id"
};
```

### 2. Déployer les Règles Firestore

```bash
# Déployer les nouvelles règles
firebase deploy --only firestore:rules
```

### 3. Exécuter la Migration

```bash
# Aller dans le dossier admin
cd samaquete-admin

# Installer les dépendances si nécessaire
npm install

# Exécuter le script de migration
node lib/migrate-to-firestore.js
```

### 4. Supprimer localStorage

```bash
# Commenter toutes les références localStorage
node lib/remove-localstorage.js
```

## 🔧 Services Firestore

### Services disponibles :

#### NewsService
```typescript
// Récupérer toutes les actualités
const news = await NewsService.getAll()

// Récupérer par diocèse
const dioceseNews = await NewsService.getByDiocese('Archidiocèse de Dakar')

// Créer une actualité
await NewsService.create({
  title: "Titre",
  excerpt: "Résumé",
  // ... autres champs
})

// Mettre à jour
await NewsService.update(id, { title: "Nouveau titre" })

// Supprimer
await NewsService.delete(id)

// S'abonner aux changements
const unsubscribe = NewsService.subscribeToNews((news) => {
  console.log('Actualités mises à jour:', news)
})
```

#### UserService
```typescript
// Récupérer tous les utilisateurs
const users = await UserService.getAll()

// Récupérer par diocèse
const dioceseUsers = await UserService.getByDiocese('Archidiocèse de Dakar')

// Créer un utilisateur
await UserService.create({
  name: "Nom",
  email: "email@example.com",
  role: "admin_diocesan",
  status: "Actif",
  diocese: "Archidiocèse de Dakar"
})

// Mettre à jour
await UserService.update(id, { name: "Nouveau nom" })

// Supprimer
await UserService.delete(id)

// S'abonner aux changements
const unsubscribe = UserService.subscribeToUsers((users) => {
  console.log('Utilisateurs mis à jour:', users)
})
```

#### ParishService
```typescript
// Récupérer toutes les paroisses
const parishes = await ParishService.getAll()

// Récupérer par diocèse
const dioceseParishes = await ParishService.getByDiocese('Archidiocèse de Dakar')

// Créer une paroisse
await ParishService.create({
  name: "Paroisse Saint-Pierre",
  diocese: "Archidiocèse de Dakar",
  city: "Dakar",
  cure: "Père Antoine Diop",
  vicaire: "Père Jean Sarr",
  catechists: "Marie Ndiaye, Paul Fall"
})

// Mettre à jour
await ParishService.update(id, { name: "Nouveau nom" })

// Supprimer
await ParishService.delete(id)

// S'abonner aux changements
const unsubscribe = ParishService.subscribeToParishes((parishes) => {
  console.log('Paroisses mises à jour:', parishes)
})
```

#### DonationService
```typescript
// Récupérer tous les dons
const donations = await DonationService.getAll()

// Récupérer par diocèse
const dioceseDonations = await DonationService.getByDiocese('Archidiocèse de Dakar')

// Créer un don
await DonationService.create({
  donorName: "Famille Diop",
  amount: 50000,
  type: "quete",
  date: "2024-03-15",
  diocese: "Archidiocèse de Dakar",
  status: "confirmed"
})

// Mettre à jour
await DonationService.update(id, { status: "confirmed" })

// Supprimer
await DonationService.delete(id)

// S'abonner aux changements
const unsubscribe = DonationService.subscribeToDonations((donations) => {
  console.log('Dons mis à jour:', donations)
})
```

#### LiturgyService
```typescript
// Récupérer toute la liturgie
const liturgy = await LiturgyService.getAll()

// Récupérer par diocèse
const dioceseLiturgy = await LiturgyService.getByDiocese('Archidiocèse de Dakar')

// Créer un événement liturgique
await LiturgyService.create({
  title: "Messe dominicale",
  date: "2024-04-07",
  time: "10:00",
  type: "messe",
  diocese: "Archidiocèse de Dakar"
})

// Mettre à jour
await LiturgyService.update(id, { title: "Nouveau titre" })

// Supprimer
await LiturgyService.delete(id)

// S'abonner aux changements
const unsubscribe = LiturgyService.subscribeToLiturgy((liturgy) => {
  console.log('Liturgie mise à jour:', liturgy)
})
```

## 🔒 Sécurité

### Règles Firestore configurées :

- **admin_users** : Lecture pour tous les admins, écriture pour super admins
- **admin_news** : Lecture pour tous les admins, écriture pour super admins et admins diocèse
- **admin_parishes** : Lecture pour tous les admins, écriture pour super admins et admins diocèse
- **admin_donations** : Lecture pour tous les admins, écriture pour super admins et admins diocèse
- **admin_liturgy** : Lecture pour tous les admins, écriture pour super admins et admins diocèse

## 📱 Synchronisation Temps Réel

Tous les services incluent des fonctions d'abonnement pour la synchronisation en temps réel :

```typescript
// Exemple d'utilisation
useEffect(() => {
  const unsubscribe = NewsService.subscribeToNews((news) => {
    setNews(news)
  })
  
  return () => unsubscribe()
}, [])
```

## 🧪 Test de la Migration

### 1. Vérifier les données
```bash
# Aller dans la console Firebase
# Vérifier que les collections sont créées
# Vérifier que les données sont présentes
```

### 2. Tester l'application
```bash
# Démarrer l'application
npm run dev

# Tester les fonctionnalités :
# - Création d'utilisateurs
# - Modification d'actualités
# - Gestion des paroisses
# - Ajout de dons
# - Création d'événements liturgiques
```

### 3. Vérifier la synchronisation
- Ouvrir l'application dans deux onglets
- Modifier des données dans un onglet
- Vérifier que les changements apparaissent dans l'autre onglet

## 🚨 Dépannage

### Erreurs courantes :

1. **Erreur de permissions** : Vérifier les règles Firestore
2. **Données non chargées** : Vérifier la configuration Firebase
3. **Erreurs de connexion** : Vérifier les clés API

### Logs utiles :

```typescript
// Activer les logs Firebase
import { enableLogging } from 'firebase/firestore'
enableLogging(true)
```

## 📈 Avantages de la Migration

- ✅ **Centralisation** : Toutes les données au même endroit
- ✅ **Sécurité** : Règles de sécurité granulaires
- ✅ **Temps réel** : Synchronisation automatique
- ✅ **Sauvegarde** : Sauvegarde automatique par Firebase
- ✅ **Scalabilité** : Gestion de grandes quantités de données
- ✅ **Collaboration** : Plusieurs utilisateurs simultanés

## 🔄 Rollback (si nécessaire)

Si vous devez revenir à localStorage :

1. Restaurer les fichiers depuis Git
2. Supprimer les collections Firestore
3. Redémarrer l'application

## 📞 Support

En cas de problème :
1. Vérifier les logs de la console
2. Consulter la documentation Firebase
3. Vérifier les règles de sécurité Firestore

---

**🎉 Félicitations !** Votre application utilise maintenant Firestore comme seul système de stockage.
