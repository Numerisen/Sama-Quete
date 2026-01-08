#!/bin/bash
# Script de vérification de l'état du submodule payment-api

set -e

echo "🔍 Vérification de l'état du submodule payment-api..."

# Vérifier que le submodule est présent
if [ ! -d "payment-api" ]; then
    echo "❌ Le dossier payment-api n'existe pas"
    echo "💡 Exécutez: ./scripts/init-submodules.sh"
    exit 1
fi

# Vérifier que le submodule est initialisé
if [ ! -f "payment-api/.git" ]; then
    echo "❌ Le submodule payment-api n'est pas initialisé"
    echo "💡 Exécutez: git submodule update --init --recursive"
    exit 1
fi

# Vérifier que package.json existe
if [ ! -f "payment-api/package.json" ]; then
    echo "❌ Le fichier payment-api/package.json n'existe pas"
    exit 1
fi

# Vérifier que node_modules existe (optionnel)
if [ ! -d "payment-api/node_modules" ]; then
    echo "⚠️  Les dépendances de payment-api ne sont pas installées"
    echo "💡 Exécutez: cd payment-api && npm install"
fi

echo "✅ Le submodule payment-api est correctement configuré"

# Afficher des informations utiles
echo ""
echo "📋 Informations du submodule:"
cd payment-api
echo "  - Chemin: $(pwd)"
echo "  - Version Node: $(node --version 2>/dev/null || echo 'Non disponible')"
echo "  - npm version: $(npm --version 2>/dev/null || echo 'Non disponible')"
if [ -f "package.json" ]; then
    echo "  - Nom du package: $(grep -o '"name": "[^"]*"' package.json | cut -d'"' -f4 || echo 'Non disponible')"
fi
cd ..

