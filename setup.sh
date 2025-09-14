#!/bin/bash

# 🚀 Script de Setup Automatique - SamaQuête
# Ce script configure automatiquement l'environnement de développement

echo "🏛️ Configuration de SamaQuête..."
echo "=================================="

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ requis. Version actuelle: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

echo "✅ npm $(npm -v) détecté"

# Installer Expo CLI globalement
echo "📱 Installation d'Expo CLI..."
npm install -g @expo/cli

# Setup Panel d'Administration
echo ""
echo "🖥️ Configuration du Panel d'Administration..."
cd samaquete-admin

if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances admin..."
    npm install
else
    echo "✅ Dépendances admin déjà installées"
fi

# Créer les profils utilisateurs
echo "👥 Création des profils utilisateurs..."
node lib/create-profiles.js

# Initialiser les diocèses
echo "🏛️ Initialisation des diocèses..."
node lib/init-dioceses.js

# Créer des données de test
echo "💰 Création des données de test..."
node lib/init-donation-data.js

echo "✅ Panel d'Administration configuré"

# Setup Application Mobile
echo ""
echo "📱 Configuration de l'Application Mobile..."
cd ../samaquete-mobile

if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances mobile..."
    npm install
else
    echo "✅ Dépendances mobile déjà installées"
fi

echo "✅ Application Mobile configurée"

# Tests de connexion
echo ""
echo "🧪 Tests de connexion Firebase..."

echo "🔍 Test Admin..."
cd ../samaquete-admin
node lib/test-firebase-data.js

echo "🔍 Test Mobile..."
cd ../samaquete-mobile
node lib/test-mobile-parishes.js

echo ""
echo "🎉 Setup terminé avec succès !"
echo "=================================="
echo ""
echo "📋 Prochaines étapes :"
echo "1. Panel Admin: cd samaquete-admin && npm run dev"
echo "2. Application Mobile: cd samaquete-mobile && npx expo start"
echo "3. Ouvrir http://localhost:3000 pour l'admin"
echo "4. Scanner le QR code avec Expo Go pour le mobile"
echo ""
echo "🔑 Comptes de test :"
echo "- Super Admin: admin@admin.com / admin123"
echo "- Admin Diocèse: diocese@diocese.com / diocese123"
echo ""
echo "📚 Documentation:"
echo "- README.md - Documentation complète"
echo "- SETUP.md - Guide de démarrage"
echo "- FIREBASE_GUIDE.md - Guide Firebase"
echo ""
echo "🚀 Bon développement !"