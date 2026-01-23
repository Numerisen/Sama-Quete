# SamaQuête - Application Mobile React Native 🕊️

**SamaQuête** - Votre compagnon spirituel numérique pour la communauté catholique du Sénégal.

## 📱 Description

SamaQuête est une application mobile moderne développée en React Native avec Expo, conçue pour faciliter la gestion des dons paroissiaux et offrir un accompagnement spirituel aux fidèles. L'application propose une interface intuitive et sécurisée pour effectuer des dons, consulter les informations liturgiques, et accéder à un assistant spirituel.

## ✨ Fonctionnalités principales

- **🎯 Tableau de bord personnalisé** - Vue d'ensemble de vos activités spirituelles
- **💝 Gestion des dons** - Donation sécurisée avec sélection de paroisse
- **📖 Informations liturgiques** - Horaires des prières et célébrations
- **📰 Actualités paroissiales** - Nouvelles et événements de la communauté
- **🤖 Assistant spirituel** - Accompagnement et conseils spirituels
- **📊 Historique des dons** - Suivi de vos contributions
- **🔔 Notifications** - Restez informé des événements importants
- **⚙️ Paramètres personnalisés** - Personnalisez votre expérience

## 🛠 Technologies utilisées

- **React Native** - Framework mobile cross-platform
- **Expo** - Plateforme de développement et déploiement
- **TypeScript** - Typage statique pour la robustesse du code
- **Expo Linear Gradient** - Effets visuels avec gradients
- **Expo Vector Icons** - Icônes vectorielles (Ionicons)
- **React Native Reanimated** - Animations fluides et performantes
- **React Native Gesture Handler** - Gestion des gestes tactiles
- **Expo Splash Screen** - Gestion de l'écran de démarrage
- **Expo Font** - Gestion des polices personnalisées

## 📁 Structure du projet

```
samaquete-rn/
├── src/
│   └── components/
│       └── screens/
│           ├── SplashScreen.tsx          # Écran de démarrage
│           ├── DashboardScreen.tsx       # Tableau de bord principal
│           ├── ParishSelectionScreen.tsx # Sélection de paroisse
│           ├── donations/                # Gestion des dons
│           │   ├── DonationsScreen.tsx
│           │   ├── DonationTypeScreen.tsx
│           │   └── PaymentScreen.tsx
│           ├── AuthScreen.tsx            # Authentification
│           ├── LiturgyScreen.tsx         # Informations liturgiques
│           ├── NewsScreen.tsx            # Actualités
│           ├── AssistantScreen.tsx       # Assistant spirituel
│           ├── HistoryScreen.tsx         # Historique
│           ├── NotificationsScreen.tsx   # Notifications
│           └── settings/                 # Paramètres
│               └── SettingsScreen.tsx
├── App.tsx                              # Point d'entrée principal
├── app.json                             # Configuration Expo
├── package.json                         # Dépendances du projet
└── README.md                            # Documentation
```

## 🚀 Installation et démarrage

### Prérequis

- **Node.js** (version 16 ou supérieure)
- **npm** ou **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Expo Go** (application mobile pour tester)

### Installation

1. **Cloner le projet**
   ```bash
   git clone [URL_DU_REPO]
   cd samaquete-rn
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer l'application**
   ```bash
   npm start
   ```

4. **Tester sur mobile**
   - Scannez le QR code avec l'app **Expo Go**
   - Ou lancez sur simulateur : `npm run ios` / `npm run android`

## 📱 Utilisation

### Navigation principale

L'application utilise un système de navigation par écrans avec un état centralisé :

- **Splash Screen** → **Dashboard** (automatique après 2 secondes)
- **Dashboard** → Tous les autres écrans via les boutons de menu
- **Navigation retour** disponible sur tous les écrans

### Fonctionnalités clés

1. **Tableau de bord** - Vue d'ensemble avec statistiques et menu principal
2. **Gestion des dons** - Parcours complet : paroisse → type → montant → paiement
3. **Interface responsive** - Adaptée à tous les formats d'écran
4. **Design moderne** - Gradients, ombres et animations fluides

## 🎨 Design et UX

### Palette de couleurs

- **Primaire** : `#f59e0b` (Orange chaleureux)
- **Secondaire** : `#3b82f6` (Bleu spirituel)
- **Accent** : `#ef4444` (Rouge pour les dons)
- **Neutre** : `#f8fafc` (Gris clair pour le fond)

### Composants UI

- **Gradients** pour les en-têtes et éléments importants
- **Ombres** pour la profondeur et la hiérarchie visuelle
- **Animations** fluides pour une expérience engageante
- **Icônes** Ionicons pour la cohérence visuelle

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
EXPO_PUBLIC_API_URL=https://api.samaquete.vercel.app
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Personnalisation

- **Couleurs** : Modifiez les valeurs dans les composants
- **Polices** : Ajoutez vos polices dans `useFonts`
- **Images** : Remplacez les assets dans le dossier `assets/`

## 📦 Déploiement

### Build de production

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios

# Web
expo export:web
```

### Publication sur les stores

```bash
# Soumettre à Google Play Store
eas submit --platform android

# Soumettre à Apple App Store
eas submit --platform ios
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests E2E
npm run test:e2e

# Vérification du code
npm run lint
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **Développement** : SamaQuête Team
- **Design** : SamaQuête Design Team
- **Support** : support@samaquete.vercel.app

## 🔗 Liens utiles

- **Site web** : https://samaquete.vercel.app
- **Documentation API** : https://docs.samaquete.vercel.app
- **Support** : https://support.samaquete.vercel.app

---

**SamaQuête** - Ensemble, construisons une communauté spirituelle plus forte 🙏✨
