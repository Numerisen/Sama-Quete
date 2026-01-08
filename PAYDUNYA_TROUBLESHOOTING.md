# 🔍 Dépannage PayDunya - Clés Configurées mais Erreur Persiste

## ❌ Problème
Vous avez ajouté les clés PayDunya dans Vercel, mais l'erreur `Invalid Masterkey Specified` persiste.

## ✅ Solutions à vérifier

### 1. ⚠️ Redéploiement obligatoire

**IMPORTANT** : Après avoir ajouté/modifié des variables d'environnement dans Vercel, vous **DEVEZ** redéployer pour que les changements soient pris en compte.

#### Option A : Via CLI
```bash
cd payment-api
vercel --prod
```

#### Option B : Via Dashboard
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet `payment-api`
3. Allez dans **Deployments**
4. Cliquez sur les **3 points** du dernier déploiement
5. Cliquez sur **Redeploy**

### 2. 🔍 Vérifier le format des clés

Les clés PayDunya ne doivent **PAS** contenir :
- ❌ Espaces au début ou à la fin
- ❌ Guillemets (`"` ou `'`)
- ❌ Retours à la ligne

**Format correct** :
```
PAYDUNYA_MASTER_KEY=test_3T9S0zED-0LOy-6WWg-98Ra-c4JbSf1BduVk
```

**Format incorrect** :
```
PAYDUNYA_MASTER_KEY="test_3T9S0zED-0LOy-6WWg-98Ra-c4JbSf1BduVk"
PAYDUNYA_MASTER_KEY= test_3T9S0zED-0LOy-6WWg-98Ra-c4JbSf1BduVk
```

### 3. 🔄 Vérifier PAYDUNYA_MODE

Assurez-vous que `PAYDUNYA_MODE` correspond au type de clés :

- **Si vos clés commencent par `test_`** → `PAYDUNYA_MODE=sandbox`
- **Si vos clés commencent par `live_`** → `PAYDUNYA_MODE=live`

**Exemple** :
```
PAYDUNYA_MODE=sandbox
PAYDUNYA_MASTER_KEY=test_3T9S0zED-0LOy-6WWg-98Ra-c4JbSf1BduVk
PAYDUNYA_PRIVATE_KEY=test_private_0K10Tk8yZn25WE406q3G5D2QgcM
PAYDUNYA_TOKEN=test_EkVFX4BZQsfVwYy3IQ03
```

### 4. 📋 Vérifier toutes les variables

Dans Vercel Dashboard > Settings > Environment Variables, vérifiez que vous avez **exactement** ces 5 variables :

- ✅ `PAYDUNYA_MODE` (valeur : `sandbox` ou `live`)
- ✅ `PAYDUNYA_MASTER_KEY` (votre clé complète)
- ✅ `PAYDUNYA_PRIVATE_KEY` (votre clé complète)
- ✅ `PAYDUNYA_TOKEN` (votre token complet)
- ✅ `PAYDUNYA_MERCHANT_NAME` (ex: `SAMA-QUETE`)

### 5. 🌍 Vérifier les environnements

Pour chaque variable, cochez **tous** les environnements :
- ✅ Production
- ✅ Preview
- ✅ Development

### 6. 🔍 Vérifier les logs Vercel

Pour voir si les clés sont bien chargées :

1. Allez sur Vercel Dashboard
2. Sélectionnez votre projet
3. Allez dans **Deployments**
4. Cliquez sur le dernier déploiement
5. Allez dans **Functions** > `/api/paydunya/donation/checkout`
6. Vérifiez les logs

**Attention** : Les valeurs des variables d'environnement ne sont **PAS** affichées dans les logs (pour des raisons de sécurité), mais vous verrez les erreurs.

### 7. 🧪 Test avec des clés de test PayDunya

Si vous utilisez des clés de production, essayez d'abord avec des clés **Sandbox** pour tester :

1. Créez une application de test dans PayDunya Dashboard
2. Obtenez les clés Sandbox (commencent par `test_`)
3. Configurez dans Vercel :
   ```
   PAYDUNYA_MODE=sandbox
   PAYDUNYA_MASTER_KEY=test_...
   PAYDUNYA_PRIVATE_KEY=test_private_...
   PAYDUNYA_TOKEN=test_...
   ```
4. Redéployez
5. Testez à nouveau

### 8. 🔄 Supprimer et recréer les variables

Si rien ne fonctionne, essayez de :

1. **Supprimer** toutes les variables PayDunya dans Vercel
2. **Attendre 1 minute**
3. **Recréer** les variables une par une
4. **Redéployer**

## ✅ Checklist de vérification

- [ ] Redéploiement effectué après avoir ajouté les clés
- [ ] Format des clés correct (pas d'espaces, pas de guillemets)
- [ ] `PAYDUNYA_MODE` correspond au type de clés (sandbox/live)
- [ ] Les 5 variables sont présentes dans Vercel
- [ ] Toutes les variables sont cochées pour Production, Preview, Development
- [ ] Les clés sont complètes (pas tronquées)
- [ ] Test avec clés Sandbox effectué

## 🎯 Test après correction

```bash
curl -X POST https://payment-api-pink.vercel.app/api/paydunya/donation/checkout \
  -H "Content-Type: application/json" \
  -d '{"donationType": "quete", "amount": 1000, "description": "Test"}'
```

**Résultat attendu** :
```json
{
  "paymentId": 123,
  "token": "abc123...",
  "checkout_url": "https://app.paydunya.com/sandbox/checkout/...",
  "amount": 1000,
  "donationType": "quete"
}
```

## 🆘 Si le problème persiste

1. **Vérifiez les clés dans PayDunya Dashboard** : Assurez-vous qu'elles sont toujours actives
2. **Contactez le support PayDunya** : Vérifiez que votre compte est actif et que les clés sont valides
3. **Vérifiez les logs Vercel** : Regardez les erreurs détaillées dans les logs de fonction

---

**Le problème le plus courant est l'oubli de redéployer après avoir ajouté les variables !** 🔄

