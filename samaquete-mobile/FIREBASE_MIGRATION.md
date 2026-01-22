# 🔥 Migration Firebase - Application Mobile

## ✅ Configuration effectuée

Le fichier `.env` de l'application mobile a été mis à jour pour utiliser le **nouveau Firebase** (`samaquete-admin-new`).

## 📱 Étapes suivantes requises

### 1. Créer les apps Android/iOS dans Firebase Console

Pour que l'application mobile fonctionne correctement, vous devez créer des apps Android et iOS dans votre nouveau projet Firebase :

1. **Aller dans Firebase Console** : https://console.firebase.google.com/
2. **Sélectionner le projet** : `samaquete-admin-new`
3. **Cliquer sur l'icône d'engrenage** ⚙️ > **Project settings**
4. **Aller dans l'onglet "Your apps"**

#### Pour Android :
1. Cliquer sur **"Add app"** > **Android**
2. **Package name** : `numerisen.quete` (déjà défini dans `app.config.js`)
3. **App nickname** (optionnel) : "Jàngu Bi Android"
4. Cliquer sur **"Register app"**
5. **Télécharger le fichier `google-services.json`** et le placer dans `samaquete-mobile/android/app/`
6. **Copier l'App ID** (format: `1:934058311855:android:xxxxx`)
7. **Mettre à jour** `EXPO_PUBLIC_FIREBASE_APP_ID` dans `.env` avec cet App ID

#### Pour iOS :
1. Cliquer sur **"Add app"** > **iOS**
2. **Bundle ID** : `numerisen.quete` (déjà défini dans `app.config.js`)
3. **App nickname** (optionnel) : "Jàngu Bi iOS"
4. Cliquer sur **"Register app"**
5. **Télécharger le fichier `GoogleService-Info.plist`** et le placer dans `samaquete-mobile/ios/`
6. **Copier l'App ID** (format: `1:934058311855:ios:xxxxx`)
7. **Mettre à jour** `EXPO_PUBLIC_FIREBASE_APP_ID` dans `.env` avec cet App ID (ou créer une variable séparée)

### 2. Mettre à jour le fichier .env

Après avoir créé les apps dans Firebase Console, mettez à jour le fichier `.env` :

```env
# Pour Android
EXPO_PUBLIC_FIREBASE_APP_ID=1:934058311855:android:VOTRE_APP_ID_ANDROID

# OU pour iOS
EXPO_PUBLIC_FIREBASE_APP_ID=1:934058311855:ios:VOTRE_APP_ID_IOS
```

### 3. Redémarrer l'application

Après avoir mis à jour `.env` :

```bash
cd samaquete-mobile
# Arrêter le serveur Expo si en cours
# Puis redémarrer
npx expo start --clear
```

## ⚠️ Notes importantes

1. **L'App ID actuel** dans `.env` est celui de l'app web. Il fonctionnera pour les tests, mais pour la production, vous devez créer les apps Android/iOS dans Firebase Console.

2. **Les données existantes** de l'ancien Firebase (`numerisen-14a03`) ne seront **pas automatiquement transférées**. Si vous avez besoin de ces données :
   - Utilisez le script de migration dans `samaquete-admin/scripts/migrate-from-old-firebase.js`
   - Ou migrez manuellement via Firebase Console

3. **Les utilisateurs existants** devront se réinscrire dans le nouveau Firebase, sauf si vous migrez aussi Firebase Authentication.

## ✅ Vérification

Pour vérifier que la connexion fonctionne :

1. Démarrer l'app mobile : `npx expo start`
2. Se connecter avec un compte de test
3. Vérifier que les données s'affichent correctement

## 🔗 Liens utiles

- Firebase Console : https://console.firebase.google.com/
- Documentation Expo + Firebase : https://docs.expo.dev/guides/using-firebase/
