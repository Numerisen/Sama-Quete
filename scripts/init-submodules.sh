#!/bin/bash
# Script d'initialisation des submodules Git

set -e

echo "🔧 Initialisation des submodules Git..."

# Vérifier que Git est disponible
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Veuillez installer Git d'abord."
    exit 1
fi

# Initialiser et mettre à jour les submodules
echo "📦 Initialisation du submodule payment-api..."
git submodule init
git submodule update --recursive

# Vérifier que le submodule payment-api existe
if [ ! -d "payment-api" ]; then
    echo "⚠️  Le submodule payment-api n'existe pas."
    echo "💡 Si le repository est privé, assurez-vous d'avoir les droits d'accès."
    echo "💡 Vous pouvez aussi cloner manuellement:"
    echo "   git submodule add <URL_DU_REPO> payment-api"
    exit 1
fi

echo "✅ Submodules initialisés avec succès!"

# Installer les dépendances du submodule payment-api
if [ -f "payment-api/package.json" ]; then
    echo "📦 Installation des dépendances de payment-api..."
    cd payment-api
    npm install
    cd ..
    echo "✅ Dépendances de payment-api installées!"
fi

echo "🎉 Initialisation terminée!"

