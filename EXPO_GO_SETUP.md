# 🚀 Configuration pour Expo Go + Docker

Ce guide explique comment utiliser **Expo Go** pour l'app mobile avec **Docker** pour payment-api et admin.

## ⚠️ Points importants

### 1. Deep Links avec Expo Go

**Problème** : Les deep links personnalisés (`samaquete://`) ne fonctionnent pas directement avec Expo Go.

**Solution** : Utiliser `expo-linking` qui gère automatiquement les deep links dans Expo Go.

### 2. Accès à payment-api depuis le téléphone

**Problème** : `localhost:3001` n'est pas accessible depuis votre téléphone.

**Solutions** :

#### Option A : Réseau local (recommandé pour développement)
1. Trouvez l'IP locale de votre machine :
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```
   Exemple : `192.168.1.100`

2. Configurez la variable d'environnement dans `samaquete-mobile/.env` :
   ```
   EXPO_PUBLIC_PAYMENT_API_URL=http://192.168.1.100:3001
   ```

3. Assurez-vous que Docker expose les ports correctement :
   ```yaml
   ports:
     - "3000:3000"  # Admin
     - "3001:3001"  # Payment API
   ```

#### Option B : Tunneling (ngrok, localtunnel)
```bash
# Avec ngrok
ngrok http 3001

# Utiliser l'URL fournie (ex: https://abc123.ngrok.io)
EXPO_PUBLIC_PAYMENT_API_URL=https://abc123.ngrok.io
```

## 📋 Configuration étape par étape

### 1. Démarrer Docker (payment-api + admin)

```bash
# Dans le répertoire racine du projet
docker compose up -d

# Vérifier que les services sont actifs
docker compose ps

# Voir les logs
docker compose logs -f
```

### 2. Configurer l'URL de payment-api pour Expo Go

Créez un fichier `.env` dans `samaquete-mobile/` :

```bash
# Pour développement local (remplacez par votre IP)
EXPO_PUBLIC_PAYMENT_API_URL=http://192.168.1.100:3001

# OU pour production/staging
# EXPO_PUBLIC_PAYMENT_API_URL=https://payment-api.votre-domaine.com
```

### 3. Installer expo-linking (si nécessaire)

```bash
cd samaquete-mobile
npx expo install expo-linking
```

### 4. Démarrer Expo Go

```bash
cd samaquete-mobile
npm start

# Scannez le QR code avec Expo Go
```

## 🔧 Ajustements nécessaires pour Expo Go

### Deep Links

Avec Expo Go, les deep links fonctionnent différemment. Deux options :

#### Option 1 : Utiliser expo-linking (recommandé)
```typescript
import * as Linking from 'expo-linking';

// Au lieu de Linking.openURL()
await Linking.openURL(checkoutUrl);

// Pour écouter les deep links
Linking.addEventListener('url', handleDeepLink);
```

#### Option 2 : Utiliser le scheme Expo (temporaire)
Pour tester avec Expo Go, vous pouvez utiliser le scheme Expo :
- `exp://192.168.1.100:8081/--/payment/return?token=...`

## 🧪 Tester le flux de paiement

1. **Démarrer les services** :
   ```bash
   # Terminal 1 : Docker
   docker compose up
   
   # Terminal 2 : Expo
   cd samaquete-mobile && npm start
   ```

2. **Tester depuis Expo Go** :
   - Scannez le QR code
   - Naviguez vers un don
   - Sélectionnez un montant (≥ 10 000 FCFA)
   - Cliquez sur "Payer"
   - Le paiement PayDunya s'ouvrira dans le navigateur
   - Après paiement, vous serez redirigé vers l'app

## ⚠️ Limitations avec Expo Go

1. **Deep links personnalisés** : Peuvent nécessiter une build standalone
2. **Performance** : Expo Go est plus lent qu'une build native
3. **Modules natifs** : Certains modules peuvent ne pas fonctionner

## 🚀 Pour la production

Pour la production, créez une **build standalone** :

```bash
# Build iOS
eas build --platform ios

# Build Android
eas build --platform android
```

Les deep links personnalisés fonctionneront parfaitement dans une build standalone.

## 📝 Checklist

- [ ] Docker compose démarré (payment-api sur port 3001)
- [ ] IP locale identifiée
- [ ] `.env` configuré avec `EXPO_PUBLIC_PAYMENT_API_URL`
- [ ] `expo-linking` installé (si nécessaire)
- [ ] Expo Go lancé et connecté
- [ ] Test de paiement effectué

## 🐛 Dépannage

### Payment API non accessible
- Vérifiez que Docker expose le port 3001
- Vérifiez votre firewall
- Testez avec `curl http://VOTRE_IP:3001/api/entitlements` depuis le téléphone

### Deep links ne fonctionnent pas
- Utilisez `expo-linking` au lieu de `Linking` natif
- Vérifiez que le scheme est configuré dans `app.json`
- Pour Expo Go, utilisez le scheme Expo temporairement

### Erreur CORS
- Vérifiez la configuration CORS dans `payment-api`
- Ajoutez votre IP/domaine dans `CORS_ORIGINS`

