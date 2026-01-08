# 🚀 Test Rapide du Paiement

## ✅ Configuration terminée

- ✅ `payment-api` déployé : `https://payment-api-pink.vercel.app`
- ✅ Fichier `.env` mis à jour avec l'URL de production
- ✅ Deep linking configuré (`samaquete://`)

## 📱 Étapes pour tester

### 1. Redémarrer Expo

```bash
cd samaquete-mobile
# Arrêtez Expo (Ctrl+C si en cours)
npm start
```

**Important** : Redémarrez Expo après avoir modifié le `.env` pour que les changements soient pris en compte.

### 2. Tester dans l'app

1. **Ouvrez l'app** dans Expo Go
2. **Allez dans Dons**
3. **Sélectionnez un type** (Quête, Denier, etc.)
4. **Entrez un montant** (ex: 1000 FCFA)
5. **Cliquez sur "Payer maintenant"**

### 3. Vérifier le flux

L'app devrait :
- ✅ Créer un checkout via l'API Vercel
- ✅ Ouvrir PayDunya dans le navigateur
- ✅ Après paiement, rediriger vers l'app
- ✅ Afficher une confirmation

## 🔍 Vérifications

### Test de l'API directement

```bash
curl -X POST https://payment-api-pink.vercel.app/api/paydunya/donation/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "donationType": "quete",
    "amount": 1000,
    "description": "Test"
  }'
```

Vous devriez recevoir :
```json
{
  "paymentId": 123,
  "token": "...",
  "checkout_url": "https://paydunya.com/checkout/...",
  "amount": 1000,
  "donationType": "quete"
}
```

### Logs à surveiller

**Dans Expo (console)** :
- `✅ Checkout créé:` = Succès
- `❌ Erreur lors du paiement:` = Problème

**Dans Vercel Dashboard** :
- Allez dans votre projet > Deployments > Functions
- Vérifiez les logs de `/api/paydunya/donation/checkout`

## 🎯 Si tout fonctionne

Vous verrez :
1. ✅ Checkout créé avec succès
2. ✅ Page PayDunya s'ouvre
3. ✅ Après paiement, retour à l'app
4. ✅ Confirmation affichée

## 🐛 Si ça ne fonctionne pas

1. **Vérifiez que Expo a été redémarré** après modification du `.env`
2. **Vérifiez les logs Expo** pour voir les erreurs
3. **Testez l'API directement** avec curl (voir ci-dessus)
4. **Vérifiez les logs Vercel** pour voir les erreurs serveur

---

**Prêt à tester !** 🚀

