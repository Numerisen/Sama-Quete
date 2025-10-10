#!/bin/bash

# Script d'initialisation pour l'interface admin paroisse
# Ce script configure l'environnement et initialise les données de test

echo "🏛️ Initialisation de l'interface admin paroisse"
echo "=============================================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Node.js et npm sont installés"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo "✅ Dépendances installées"
else
    echo "✅ Dépendances déjà installées"
fi

# Vérifier si le fichier de configuration Firebase existe
if [ ! -f "lib/firebase.ts" ]; then
    echo "⚠️ Fichier de configuration Firebase non trouvé"
    echo "📝 Veuillez configurer Firebase dans lib/firebase.ts"
    echo "💡 Consultez FIREBASE_SETUP.md pour plus d'informations"
    exit 1
fi

echo "✅ Configuration Firebase trouvée"

# Demander confirmation avant de continuer
echo ""
echo "🚨 ATTENTION: Ce script va créer des données de test dans votre base de données Firestore"
echo "📊 Les données suivantes seront créées:"
echo "   - Heures de prières de la paroisse"
echo "   - Dons de test"
echo "   - Activités paroissiales"
echo "   - Actualités"
echo "   - Utilisateurs de test"
echo "   - Paramètres paroissiaux"
echo ""
read -p "Voulez-vous continuer? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Opération annulée"
    exit 1
fi

# Créer l'utilisateur de test
echo ""
echo "👤 Création de l'utilisateur de test..."
node lib/create-parish-test-user.js

if [ $? -eq 0 ]; then
    echo "✅ Utilisateur de test créé avec succès"
else
    echo "⚠️ Erreur lors de la création de l'utilisateur de test"
    echo "💡 L'utilisateur existe peut-être déjà"
fi

# Initialiser les données paroissiales
echo ""
echo "📊 Initialisation des données paroissiales..."
node lib/init-parish-data.js

if [ $? -eq 0 ]; then
    echo "✅ Données paroissiales initialisées avec succès"
else
    echo "❌ Erreur lors de l'initialisation des données"
    exit 1
fi

echo ""
echo "🎉 Initialisation terminée avec succès!"
echo ""
echo "📋 Informations de connexion:"
echo "=============================="
echo "🌐 URL: http://localhost:3000/adminparoisse?paroisse=Paroisse%20Saint%20Jean%20Bosco"
echo "📧 Email: admin.paroisse@test.com"
echo "🔑 Mot de passe: Paroisse123!"
echo "🏛️ Paroisse: Paroisse Saint Jean Bosco"
echo ""
echo "🚀 Pour démarrer l'application:"
echo "   npm run dev"
echo ""
echo "📚 Documentation:"
echo "   - Consultez README.md pour plus d'informations"
echo "   - Consultez FIREBASE_SETUP.md pour la configuration Firebase"
echo ""
echo "✨ Bon développement!"
