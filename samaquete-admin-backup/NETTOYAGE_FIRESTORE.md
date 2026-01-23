# 🗑️ Guide de Nettoyage Firestore

## ⚠️ ATTENTION

**Cette opération est IRRÉVERSIBLE !**  
Avant d'exécuter le script de nettoyage, assurez-vous d'avoir :
- ✅ Sauvegardé toutes les données importantes
- ✅ Compris que TOUS les dons et utilisateurs seront supprimés
- ✅ Obtenu l'autorisation nécessaire

## 📋 Collections qui seront supprimées

Le script supprime les documents des collections suivantes :
- `donations` - Tous les dons
- `admin_donations` - Dons PayDunya
- `parish_donations` - Dons saisis admin
- `users` - **TOUS les utilisateurs** (y compris les admins !)

## 🚀 Utilisation

### Option 1: Script Node.js (recommandé)

```bash
cd samaquete-admin
npm run cleanup:firestore
```

### Option 2: Exécution manuelle

```bash
cd samaquete-admin
node lib/cleanup-firestore.js
```

## 📊 Ce que fait le script

1. **Supprime par batch** : Les documents sont supprimés par lots de 500 pour éviter les timeouts
2. **Affiche la progression** : Vous verrez le nombre de documents supprimés en temps réel
3. **Génère un rapport** : Résumé final avec le nombre total de documents supprimés

## 🔒 Sécurité

Le script utilise l'API client Firebase (pas besoin de serviceAccount).  
Les règles Firestore s'appliquent, donc vous devez être authentifié avec les bonnes permissions.

## 📝 Exemple de sortie

```
🚀 Démarrage du nettoyage Firestore (mode client)...
⚠️  ATTENTION: Cette opération est irréversible !

🗑️  Suppression de la collection: donations
  📦 500 documents supprimés...
  📦 1000 documents supprimés...
  ...
✅ Collection donations vidée (539999 documents supprimés)

🗑️  Suppression de la collection: users
  📦 500 documents supprimés...
✅ Collection users vidée (1500 documents supprimés)

============================================================
📊 RÉSUMÉ DU NETTOYAGE
============================================================
  donations: 539999 documents supprimés
  admin_donations: 0 documents supprimés
  parish_donations: 0 documents supprimés
  users: 1500 documents supprimés

  TOTAL: 541499 documents supprimés
============================================================
✅ Nettoyage terminé avec succès !
```

## ⚠️ Après le nettoyage

Après avoir supprimé les utilisateurs, vous devrez :
1. Recréer les comptes admin nécessaires
2. Vérifier que les règles Firestore sont toujours correctes
3. Tester l'authentification

## 🔄 Restauration

Si vous avez besoin de restaurer des données :
- Utilisez les sauvegardes Firebase (si configurées)
- Importez depuis un export JSON précédent
- Recréez manuellement les données essentielles

---

**En cas de problème, arrêtez le script immédiatement (Ctrl+C)**
