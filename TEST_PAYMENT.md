# 🧪 Guide de Test du Paiement Complet

## ✅ Prérequis

1. ✅ `payment-api` déployé sur Vercel : `https://payment-api-pink.vercel.app`
2. ✅ IPN configuré dans PayDunya Dashboard
3. ✅ Deep linking configuré dans `app.json` (scheme: `samaquete`)

## 📱 Configuration de l'App Mobile

### 1. Créer le fichier `.env` dans `samaquete-mobile/`

Créez manuellement le fichier `samaquete-mobile/.env` avec ce contenu :

```bash
# URL de l'API de paiement (Production Vercel)
EXPO_PUBLIC_PAYMENT_API_URL=https://payment-api-pink.vercel.app
```

**Important** : Après avoir créé le fichier `.env`, redémarrez Expo :
```bash
cd samaquete-mobile
# Arrêtez Expo (Ctrl+C)
npm start
```

### 2. Vérifier la configuration

L'app mobile utilise automatiquement `EXPO_PUBLIC_PAYMENT_API_URL` si disponible, sinon `http://localhost:3001`.

## 🧪 Test du Flux de Paiement

### Étape 1 : Lancer l'app mobile

```bash
cd samaquete-mobile
npm start
```

Scannez le QR code avec Expo Go.

### Étape 2 : Naviguer vers un don

1. Dans l'app, allez dans **Dons**
2. Sélectionnez un type de don (Quête, Denier, Cierge, Messe)
3. Entrez un montant (minimum 100 FCFA, testez avec 1000 FCFA)
4. Cliquez sur **Continuer**

### Étape 3 : Initier le paiement

1. Sur l'écran de paiement, sélectionnez une méthode (Carte, Wave, Orange Money)
2. Cliquez sur **Payer maintenant**
3. L'app devrait :
   - Créer un checkout via `payment-api`
   - Ouvrir le navigateur avec l'URL PayDunya
   - Afficher un message "Paiement en cours"

### Étape 4 : Effectuer le paiement PayDunya

1. Dans le navigateur PayDunya :
   - **Mode Sandbox** : Utilisez les credentials de test PayDunya
   - Entrez les informations de paiement de test
   - Confirmez le paiement

2. Après le paiement :
   - PayDunya redirige vers `https://payment-api-pink.vercel.app/payment/return?token=...`
   - Cette page vérifie le statut et redirige vers `samaquete://payment/return?token=...`
   - L'app mobile devrait s'ouvrir automatiquement

### Étape 5 : Vérifier le retour dans l'app

1. L'app mobile devrait :
   - Détecter le deep link `samaquete://payment/return?token=...`
   - Vérifier le statut du paiement via l'API
   - Afficher une alerte de succès/échec
   - Rediriger vers l'historique des dons

## 🔍 Vérifications et Debug

### Vérifier que l'API est accessible

```bash
# Tester l'endpoint de donation checkout
curl -X POST https://payment-api-pink.vercel.app/api/paydunya/donation/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "donationType": "quete",
    "amount": 1000,
    "description": "Test donation"
  }'
```

Vous devriez recevoir une réponse avec `checkout_url` et `token`.

### Vérifier les logs

**Dans l'app mobile (console Expo)** :
- Recherchez les logs `✅ Checkout créé:`
- Recherchez les erreurs `❌ Erreur lors du paiement:`

**Dans Vercel Dashboard** :
- Allez dans votre projet > **Deployments** > Cliquez sur le déploiement
- Cliquez sur **Functions** > `/api/paydunya/donation/checkout`
- Vérifiez les logs d'exécution

### Vérifier l'IPN

Après un paiement PayDunya, vérifiez que l'IPN est reçu :

**Dans Vercel Dashboard** :
- Allez dans **Functions** > `/api/paydunya/ipn`
- Vérifiez les logs pour voir les notifications IPN

**Dans PayDunya Dashboard** :
- Allez dans **Transactions** > **Historique**
- Vérifiez que l'IPN a été envoyé (statut)

## 🐛 Problèmes Courants

### 1. "Erreur HTTP: 404" lors de la création du checkout

**Cause** : L'URL de l'API n'est pas correctement configurée.

**Solution** :
- Vérifiez que `samaquete-mobile/.env` contient `EXPO_PUBLIC_PAYMENT_API_URL=https://payment-api-pink.vercel.app`
- Redémarrez Expo après avoir créé/modifié `.env`

### 2. "CORS Error" dans le navigateur

**Cause** : CORS n'est pas configuré pour votre domaine.

**Solution** :
- Vérifiez que `CORS_ORIGINS` dans Vercel inclut votre domaine
- Ajoutez `exp://*` pour Expo Go

### 3. Deep link ne fonctionne pas

**Cause** : Le scheme n'est pas correctement configuré.

**Solution** :
- Vérifiez que `app.json` contient `"scheme": "samaquete"`
- Pour Expo Go, les deep links peuvent nécessiter une build standalone
- Testez avec `npx uri-scheme open samaquete://payment/return?token=test --ios` (ou `--android`)

### 4. Paiement réussi mais pas de notification dans l'app

**Cause** : Le deep link n'est pas détecté ou l'IPN n'a pas été reçu.

**Solution** :
- Vérifiez que l'app écoute les deep links (voir `App.tsx`)
- Vérifiez les logs Vercel pour l'IPN
- Vérifiez que l'IPN est configuré dans PayDunya Dashboard

## ✅ Checklist de Test

- [ ] Fichier `.env` créé dans `samaquete-mobile/` avec `EXPO_PUBLIC_PAYMENT_API_URL`
- [ ] Expo redémarré après création du `.env`
- [ ] App mobile lancée et connectée
- [ ] Navigation vers un don fonctionne
- [ ] Création du checkout réussie (pas d'erreur 404)
- [ ] Page PayDunya s'ouvre dans le navigateur
- [ ] Paiement test effectué dans PayDunya
- [ ] Redirection vers l'app mobile fonctionne
- [ ] Deep link détecté dans l'app
- [ ] Statut du paiement vérifié et affiché
- [ ] IPN reçu et traité (vérifier dans Vercel logs)

## 🎯 Test Complet Réussi

Si tous les points de la checklist sont validés, le flux de paiement est opérationnel ! 🎉

