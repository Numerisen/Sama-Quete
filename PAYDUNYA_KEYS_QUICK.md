# 🔑 Configuration Rapide PayDunya

## ❌ Erreur actuelle
`Invalid Masterkey Specified` = Clés PayDunya manquantes dans Vercel

## ✅ Solution en 3 étapes

### 1. Obtenir les clés
- Allez sur https://dashboard.paydunya.com
- Paramètres > Intégration API
- Copiez vos 3 clés : Master Key, Private Key, Token

### 2. Ajouter dans Vercel
- https://vercel.com/dashboard > Votre projet > Settings > Environment Variables
- Ajoutez ces 5 variables :

```
PAYDUNYA_MODE=sandbox
PAYDUNYA_MASTER_KEY=votre-master-key
PAYDUNYA_PRIVATE_KEY=votre-private-key
PAYDUNYA_TOKEN=votre-token
PAYDUNYA_MERCHANT_NAME=SAMA-QUETE
```

**Important** : Cochez Production, Preview, Development pour chaque variable

### 3. Redéployer
- Deployments > 3 points > Redeploy
- OU : `cd payment-api && vercel --prod`

## ✅ Vérification
```bash
curl -X POST https://payment-api-pink.vercel.app/api/paydunya/donation/checkout \
  -H "Content-Type: application/json" \
  -d '{"donationType": "quete", "amount": 1000, "description": "Test"}'
```

Si ça fonctionne, vous recevrez `checkout_url` et `token` ✅
