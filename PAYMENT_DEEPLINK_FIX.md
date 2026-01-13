# 🔧 Correction du Deep Link de Paiement

## Problème Identifié

Safari iOS bloque souvent les custom URL schemes (`jangui-bi://`) pour des raisons de sécurité. C'est pourquoi vous voyez "Safari cannot open the page because the address is invalid".

## Solutions Implémentées

### 1. ✅ Méthodes de Redirection Multiples

La page de retour utilise maintenant **3 méthodes** de redirection :
- **Méthode 1** : Créer un lien invisible et le cliquer (plus fiable pour Safari)
- **Méthode 2** : `window.location.href` (fallback)
- **Méthode 3** : `window.open` (dernier recours)

### 2. ✅ Bouton Manuel avec Instructions

Un bouton "Ouvrir l'application" avec des instructions claires :
1. Cliquez sur le bouton
2. Si cela ne fonctionne pas, fermez Safari
3. Ouvrez manuellement l'application Jàngu Bi
4. Votre paiement sera visible dans l'historique

### 3. ✅ Configuration iOS Améliorée

Ajout de `CFBundleURLTypes` dans `app.json` pour mieux supporter les deep links.

## Solution Recommandée : Universal Links (Optionnel)

Pour une solution plus robuste en production, configurez des **Universal Links** :

### Configuration Universal Links

1. **Créer un fichier `apple-app-site-association`** sur votre domaine :
   ```
   https://payment-api-pink.vercel.app/.well-known/apple-app-site-association
   ```

2. **Contenu du fichier** :
   ```json
   {
     "applinks": {
       "apps": [],
       "details": [
         {
           "appID": "TEAM_ID.numerisen.quete",
           "paths": ["/payment/return*"]
         }
       ]
     }
   }
   ```

3. **Mettre à jour `app.json`** :
   ```json
   {
     "ios": {
       "associatedDomains": ["applinks:payment-api-pink.vercel.app"]
     }
   }
   ```

### Alternative : Smart App Banner

Ajouter un Smart App Banner dans la page de retour :
```html
<meta name="apple-itunes-app" content="app-id=YOUR_APP_ID, app-argument=jangui-bi://payment/return?token=TOKEN">
```

## Test de la Solution Actuelle

1. **Effectuer un paiement** via PayDunya
2. **Sur la page de retour** :
   - La redirection automatique sera tentée
   - Si elle échoue, un bouton "Ouvrir l'application" apparaîtra
   - Cliquez sur le bouton
   - Si Safari bloque toujours, suivez les instructions affichées

3. **Dans l'application** :
   - Ouvrez manuellement l'app si nécessaire
   - Allez dans "Historique des dons"
   - Votre paiement récent sera visible

## Vérification

Pour vérifier que le deep link fonctionne :

1. **Test manuel** :
   ```bash
   # Sur iOS, ouvrir Safari et taper :
   jangui-bi://payment/return?token=test
   ```

2. **Vérifier les logs** dans l'app mobile :
   - Les logs devraient montrer la réception du deep link
   - L'app devrait naviguer vers l'historique des dons

## Notes Importantes

- ⚠️ **Safari iOS bloque souvent les custom URL schemes** pour des raisons de sécurité
- ✅ **Le paiement est toujours enregistré** même si le deep link échoue
- ✅ **L'utilisateur peut toujours voir son paiement** dans l'historique
- ✅ **Les instructions claires** guident l'utilisateur si le deep link échoue

## Prochaines Étapes (Optionnel)

Pour une solution plus robuste en production :
1. Configurer Universal Links (nécessite un domaine vérifié)
2. Utiliser Smart App Banners
3. Implémenter un système de notification push pour informer l'utilisateur

