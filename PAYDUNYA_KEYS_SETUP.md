# 🔑 Configuration des Clés PayDunya dans Vercel

## ❌ Problème actuel

L'erreur `Invalid Masterkey Specified` indique que les clés PayDunya ne sont pas configurées ou sont incorrectes dans Vercel.

## ✅ Solution : Ajouter les clés PayDunya dans Vercel

### Étape 1 : Obtenir vos clés PayDunya

1. **Allez sur** : https://dashboard.paydunya.com
2. **Connectez-vous** à votre compte PayDunya
3. **Allez dans** : **Paramètres** > **Intégration API**
4. **Sélectionnez** votre application (ou créez-en une)

Vous verrez 3 clés :
- **Master Key** (clé principale)
- **Private Key** (clé privée)
- **Token** (token d'authentification)

**Important** : 
- Pour les **tests** : Utilisez les clés **Sandbox** (mode test)
- Pour la **production** : Utilisez les clés **Live** (mode production)

### Étape 2 : Ajouter les clés dans Vercel

1. **Allez sur** : https://vercel.com/dashboard
2. **Sélectionnez** votre projet : `payment-api`
3. **Allez dans** : **Settings** > **Environment Variables**
4. **Cliquez sur** : **Add New**

#### Ajoutez ces 5 variables (une par une) :

#### 1. `PAYDUNYA_MODE`
- **Key** : `PAYDUNYA_MODE`
- **Value** : `sandbox` (pour les tests) ou `live` (pour la production)
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

#### 2. `PAYDUNYA_MASTER_KEY`
- **Key** : `PAYDUNYA_MASTER_KEY`
- **Value** : Votre Master Key depuis PayDunya Dashboard
  - Exemple Sandbox : `test_3T9S0zED-0LOy-6WWg-98Ra-c4JbSf1BduVk`
  - Exemple Live : `live_3T9S0zED-0LOy-6WWg-98Ra-c4JbSf1BduVk`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

#### 3. `PAYDUNYA_PRIVATE_KEY`
- **Key** : `PAYDUNYA_PRIVATE_KEY`
- **Value** : Votre Private Key depuis PayDunya Dashboard
  - Exemple Sandbox : `test_private_0K10Tk8yZn25WE406q3G5D2QgcM`
  - Exemple Live : `live_private_0K10Tk8yZn25WE406q3G5D2QgcM`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

#### 4. `PAYDUNYA_TOKEN`
- **Key** : `PAYDUNYA_TOKEN`
- **Value** : Votre Token depuis PayDunya Dashboard
  - Exemple Sandbox : `test_EkVFX4BZQsfVwYy3IQ03`
  - Exemple Live : `live_EkVFX4BZQsfVwYy3IQ03`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

#### 5. `PAYDUNYA_MERCHANT_NAME`
- **Key** : `PAYDUNYA_MERCHANT_NAME`
- **Value** : `SAMA-QUETE` (ou le nom de votre marchand)
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

### Étape 3 : Redéployer

Après avoir ajouté toutes les variables :

1. **Allez dans** : **Deployments**
2. **Cliquez sur** les **3 points** du dernier déploiement
3. **Cliquez sur** : **Redeploy**

OU via CLI :

```bash
cd payment-api
vercel --prod
```

## 🔍 Vérification

### Test rapide après redéploiement

```bash
curl -X POST https://payment-api-pink.vercel.app/api/paydunya/donation/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "donationType": "quete",
    "amount": 1000,
    "description": "Test"
  }'
```

**Si les clés sont correctes**, vous devriez recevoir :
```json
{
  "paymentId": 123,
  "token": "abc123...",
  "checkout_url": "https://app.paydunya.com/sandbox/checkout/...",
  "amount": 1000,
  "donationType": "quete"
}
```

**Si les clés sont incorrectes**, vous recevrez toujours :
```json
{
  "error": "Server Error",
  "message": "PayDunya error: Invalid Masterkey Specified"
}
```

## 📝 Format des clés PayDunya

### Clés Sandbox (test)
- **Master Key** : Commence par `test_`
- **Private Key** : Commence par `test_private_`
- **Token** : Commence par `test_`

### Clés Live (production)
- **Master Key** : Commence par `live_`
- **Private Key** : Commence par `live_private_`
- **Token** : Commence par `live_`

## ⚠️ Erreurs courantes

### 1. "Invalid Masterkey Specified"
- **Cause** : La clé MASTER_KEY est incorrecte ou manquante
- **Solution** : Vérifiez que vous avez copié la clé complète depuis PayDunya Dashboard

### 2. "PayDunya keys missing"
- **Cause** : Une ou plusieurs clés ne sont pas configurées
- **Solution** : Vérifiez que les 3 clés (MASTER_KEY, PRIVATE_KEY, TOKEN) sont toutes présentes dans Vercel

### 3. Clés Sandbox vs Live
- **Cause** : Utilisation de clés Sandbox en production ou vice versa
- **Solution** : Assurez-vous que `PAYDUNYA_MODE` correspond au type de clés utilisées

## ✅ Checklist

- [ ] Clés PayDunya obtenues depuis le dashboard
- [ ] `PAYDUNYA_MODE` configuré (`sandbox` ou `live`)
- [ ] `PAYDUNYA_MASTER_KEY` ajouté dans Vercel
- [ ] `PAYDUNYA_PRIVATE_KEY` ajouté dans Vercel
- [ ] `PAYDUNYA_TOKEN` ajouté dans Vercel
- [ ] `PAYDUNYA_MERCHANT_NAME` ajouté dans Vercel
- [ ] Toutes les variables cochées pour Production, Preview, Development
- [ ] Redéploiement effectué
- [ ] Test de l'API réussi (pas d'erreur "Invalid Masterkey")

## 🎯 Après configuration

Une fois les clés configurées et le redéploiement effectué :

1. ✅ L'API devrait fonctionner
2. ✅ Les paiements PayDunya devraient se créer correctement
3. ✅ L'app mobile pourra initier des paiements

---

**Important** : Ne partagez jamais vos clés PayDunya en public. Elles sont sensibles et permettent d'effectuer des transactions.

