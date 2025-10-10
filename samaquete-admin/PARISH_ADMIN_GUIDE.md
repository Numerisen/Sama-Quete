# Guide d'Administration Paroisse

## Vue d'ensemble

L'interface d'administration paroisse permet aux administrateurs de paroisse de gérer toutes les informations spécifiques à leur paroisse. Cette interface est conçue pour être simple et intuitive, permettant aux paroisses de maintenir leurs propres données.

## Fonctionnalités principales

### 🏠 Tableau de bord
- Vue d'ensemble des statistiques de la paroisse
- Graphiques des dons et activités
- Activité récente
- Accès rapide aux sections principales

### ⏰ Heures de prières
- Gestion des horaires de messes et prières
- Configuration des jours de la semaine
- Activation/désactivation des heures
- Descriptions personnalisées

### 💰 Dons de la paroisse
- Enregistrement des dons et offrandes
- Suivi des montants collectés
- Gestion des statuts (confirmé, en attente, annulé)
- Filtrage et recherche

### 🎯 Activités
- Programmation des activités paroissiales
- Gestion des participants
- Suivi des statuts (à venir, en cours, terminé)
- Informations détaillées (lieu, organisateur, contact)

### 📰 Actualités
- Publication d'actualités paroissiales
- Gestion des catégories
- Statut de publication
- Contenu riche

### 👥 Fidèles
- Gestion des membres de la paroisse
- Rôles (fidèle, catéchiste, animateur, admin)
- Statuts (actif, inactif)
- Informations de contact

### 🔔 Notifications
- Gestion des notifications paroissiales
- Alertes importantes
- Communications aux fidèles

### ⚙️ Paramètres
- Configuration de la paroisse
- Informations de contact
- Réseaux sociaux
- Paramètres généraux

## Installation et Configuration

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Compte Firebase avec Firestore activé

### Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd samaquete-admin
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Firebase**
   - Créer un projet Firebase
   - Activer Firestore
   - Configurer l'authentification
   - Mettre à jour `lib/firebase.ts` avec vos clés

4. **Initialiser les données de test**
   ```bash
   ./init-parish-admin.sh
   ```

### Configuration Firebase

1. **Créer les collections Firestore**
   ```javascript
   // Collections nécessaires:
   - parish_prayer_times
   - parish_donations
   - parish_activities
   - parish_news
   - parish_users
   - parish_settings
   - users (pour l'authentification)
   ```

2. **Règles de sécurité Firestore**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Règles pour les données paroissiales
       match /parish_{collection}/{document} {
         allow read, write: if request.auth != null 
           && request.auth.token.role == 'paroisse'
           && resource.data.parishId == request.auth.token.parishId;
       }
       
       // Règles pour les utilisateurs
       match /users/{userId} {
         allow read, write: if request.auth != null 
           && request.auth.uid == userId;
       }
     }
   }
   ```

## Utilisation

### Connexion
1. Accéder à l'URL: `http://localhost:3000/adminparoisse`
2. Se connecter avec les identifiants de test:
   - Email: `admin.paroisse@test.com`
   - Mot de passe: `Paroisse123!`

### Navigation
- Utiliser la barre latérale pour naviguer entre les sections
- Le nom de la paroisse actuelle est affiché en haut de la barre latérale
- Chaque section a ses propres fonctionnalités de gestion

### Gestion des données
- **Ajouter**: Utiliser le bouton "Ajouter" dans chaque section
- **Modifier**: Cliquer sur l'icône d'édition
- **Supprimer**: Cliquer sur l'icône de suppression
- **Filtrer**: Utiliser les filtres disponibles dans chaque section

## Structure des données

### Heures de prières
```javascript
{
  name: string,           // Nom de la prière
  time: string,           // Heure (format HH:MM)
  days: string[],         // Jours de la semaine
  active: boolean,        // Statut actif/inactif
  description?: string,   // Description optionnelle
  parishId: string        // ID de la paroisse
}
```

### Dons
```javascript
{
  fullname: string,       // Nom du donateur
  amount: number,         // Montant
  date: string,           // Date (format YYYY-MM-DD)
  type: string,           // Type de don
  description?: string,   // Description optionnelle
  phone?: string,         // Téléphone
  email?: string,         // Email
  status: string,         // Statut (confirmed, pending, cancelled)
  parishId: string        // ID de la paroisse
}
```

### Activités
```javascript
{
  title: string,          // Titre de l'activité
  description: string,    // Description
  date: string,           // Date (format YYYY-MM-DD)
  time: string,           // Heure (format HH:MM)
  location: string,       // Lieu
  type: string,           // Type d'activité
  status: string,         // Statut (upcoming, ongoing, completed, cancelled)
  participants: number,   // Nombre de participants
  maxParticipants?: number, // Nombre max de participants
  organizer: string,      // Organisateur
  contact?: string,       // Contact
  parishId: string        // ID de la paroisse
}
```

## Intégration avec l'application mobile

L'interface admin paroisse alimente automatiquement l'application mobile. Quand un utilisateur sélectionne une paroisse dans l'app mobile, il voit uniquement les informations spécifiques à cette paroisse :

- **Heures de prières** → Affichées dans la section liturgie
- **Dons** → Intégrés dans le système de dons
- **Activités** → Affichées dans le calendrier
- **Actualités** → Publiées dans le fil d'actualités
- **Informations paroissiales** → Affichées dans le profil de la paroisse

## Sécurité

### Authentification
- Utilisation de Firebase Auth
- Rôles basés sur les tokens
- Vérification des permissions par paroisse

### Autorisation
- Chaque paroisse ne peut accéder qu'à ses propres données
- Vérification de l'ID de paroisse dans chaque requête
- Isolation des données entre paroisses

### Validation
- Validation côté client et serveur
- Sanitisation des entrées utilisateur
- Protection contre les injections

## Déploiement

### Environnement de développement
```bash
npm run dev
```

### Environnement de production
```bash
npm run build
npm start
```

### Variables d'environnement
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... autres variables Firebase
```

## Support et maintenance

### Logs
- Les logs sont disponibles dans la console du navigateur
- Logs Firebase dans la console Firebase
- Logs d'erreur dans les outils de développement

### Sauvegarde
- Les données sont automatiquement sauvegardées dans Firestore
- Sauvegarde automatique par Firebase
- Possibilité d'exporter les données

### Mise à jour
- Mise à jour automatique des données en temps réel
- Synchronisation entre l'interface admin et l'app mobile
- Gestion des conflits de données

## Dépannage

### Problèmes courants

1. **Erreur de connexion Firebase**
   - Vérifier la configuration dans `lib/firebase.ts`
   - Vérifier les règles de sécurité Firestore
   - Vérifier l'authentification

2. **Données non affichées**
   - Vérifier que l'utilisateur a le bon rôle
   - Vérifier l'ID de paroisse
   - Vérifier les permissions Firestore

3. **Erreur de permissions**
   - Vérifier les règles de sécurité
   - Vérifier le token d'authentification
   - Vérifier les rôles utilisateur

### Contact support
- Email: support@samaquete.com
- Documentation: [Lien vers la documentation]
- Issues: [Lien vers le dépôt GitHub]

## Changelog

### Version 1.0.0
- Interface admin paroisse complète
- Gestion des heures de prières
- Gestion des dons
- Gestion des activités
- Gestion des actualités
- Gestion des utilisateurs
- Intégration Firebase
- Interface responsive

---

*Ce guide est mis à jour régulièrement. Dernière mise à jour: Janvier 2024*
