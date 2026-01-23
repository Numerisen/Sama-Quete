#!/bin/bash

echo "🚀 Migration vers Firestore - Sama-Quete Admin"
echo "=============================================="
echo ""

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le dossier samaquete-admin"
    exit 1
fi

echo "📋 Étapes de migration:"
echo "1. Migration des données vers Firestore"
echo "2. Suppression des références localStorage"
echo "3. Test de la migration"
echo ""

# Étape 1: Migration des données
echo "🔄 Étape 1: Migration des données vers Firestore..."
node lib/migrate-to-firestore.js

if [ $? -eq 0 ]; then
    echo "✅ Migration des données terminée"
else
    echo "❌ Erreur lors de la migration des données"
    exit 1
fi

echo ""

# Étape 2: Suppression localStorage
echo "🗑️  Étape 2: Suppression des références localStorage..."
node lib/remove-localstorage.js

if [ $? -eq 0 ]; then
    echo "✅ Références localStorage supprimées"
else
    echo "❌ Erreur lors de la suppression localStorage"
    exit 1
fi

echo ""

# Étape 3: Test de la migration
echo "🧪 Étape 3: Test de la migration..."
node lib/test-firestore-migration.js

if [ $? -eq 0 ]; then
    echo "✅ Tests de migration réussis"
else
    echo "❌ Erreur lors des tests de migration"
    exit 1
fi

echo ""
echo "🎉 Migration terminée avec succès !"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Vérifier la configuration Firebase dans lib/firebase.ts"
echo "2. Déployer les règles Firestore: firebase deploy --only firestore:rules"
echo "3. Tester l'application: npm run dev"
echo "4. Vérifier la synchronisation en temps réel"
echo ""
echo "📚 Consultez MIGRATION_FIRESTORE.md pour plus de détails"
