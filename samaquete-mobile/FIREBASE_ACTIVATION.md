# Activation de Firebase - Guide de Réactivation

## 🔧 Pour Activer Firebase Plus Tard

Quand vous aurez les clés Firebase et les règles configurées, suivez ces étapes :

### 1. Mettre à jour les clés Firebase

Dans `lib/firebase.ts`, remplacez les clés par vos vraies clés :

```typescript
const firebaseConfig = {
  apiKey: "VOTRE_VRAIE_CLE_API",
  authDomain: "numerisen-14a03.firebaseapp.com",
  projectId: "numerisen-14a03",
  storageBucket: "numerisen-14a03.appspot.com",
  messagingSenderId: "VOTRE_VRAIE_CLE_SENDER",
  appId: "VOTRE_VRAIE_CLE_APP"
};
```

### 2. Configurer les règles Firestore

Dans la console Firebase, appliquez les règles du fichier `FIRESTORE_RULES.md`.

### 3. Réactiver les imports Firebase

#### DashboardScreen.tsx
```typescript
// Décommenter cette ligne :
import { useAppData } from '../../../hooks/useFirebaseData';

// Et remplacer les données statiques par :
const { parishes, news, notifications, loading, error, selectedParish } = useAppData(selectedParishId);
```

#### DonationsScreen.tsx
```typescript
// Décommenter cette ligne :
import { useParishes } from '../../../../hooks/useFirebaseData';

// Et remplacer les données statiques par :
const { parishes, loading } = useParishes();
```

#### NotificationsScreen.tsx
```typescript
// Décommenter cette ligne :
import { useNotifications } from '../../../../hooks/useFirebaseData';

// Et remplacer les données statiques par :
const { notifications: firebaseNotifications, loading } = useNotifications();
```

### 4. Tester la connexion

1. Redémarrez l'application
2. Vérifiez qu'il n'y a plus d'erreurs de permissions
3. Testez la synchronisation des données

## 📋 État Actuel

✅ **Firebase configuré** mais désactivé
✅ **Services de données** prêts
✅ **Hooks** créés et fonctionnels
✅ **Application** fonctionne avec données statiques
✅ **Pas d'erreurs** de compilation

## 🚀 Avantages de cette Approche

- ✅ Application fonctionnelle immédiatement
- ✅ Pas d'erreurs Firebase
- ✅ Facile à réactiver plus tard
- ✅ Code Firebase prêt à l'emploi
- ✅ Transition transparente

## 🔄 Réactivation Rapide

Quand vous serez prêt, il suffira de :
1. Décommenter les imports Firebase
2. Remplacer les données statiques par les hooks
3. Configurer les clés et règles
4. Redémarrer l'application

Tout est prêt pour une activation en quelques minutes ! 🎯
