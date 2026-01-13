#!/bin/bash

# Script pour démarrer l'adaptateur RAG Flask
# Cet adaptateur maintient la compatibilité avec l'app mobile tout en utilisant le RAG FastAPI

echo "🚀 Démarrage de l'Adaptateur RAG pour Jàngu Bi"
echo ""

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 n'est pas installé"
    exit 1
fi

# Vérifier si le fichier adaptateur existe
if [ ! -f "services/rag-adapter.py" ]; then
    echo "❌ Fichier services/rag-adapter.py non trouvé"
    exit 1
fi

# Vérifier si le port 8000 est déjà utilisé
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Le port 8000 est déjà utilisé"
    echo "   Arrêtez le processus existant ou changez le port"
    exit 1
fi

# Vérifier les variables d'environnement
if [ -z "$RAG_API_URL" ]; then
    export RAG_API_URL="http://localhost:8001"
    echo "📝 RAG_API_URL non défini, utilisation de la valeur par défaut: $RAG_API_URL"
fi

echo "📦 Installation des dépendances Python si nécessaire..."
pip3 install flask flask-cors requests --quiet 2>/dev/null || true

echo ""
echo "🌐 Démarrage de l'Adaptateur RAG Flask sur le port 8000..."
echo "📡 RAG API URL: $RAG_API_URL"
echo ""
echo "⚠️  IMPORTANT: Assurez-vous que le service RAG FastAPI est démarré sur $RAG_API_URL"
echo "   Si vous utilisez Docker: docker-compose -f rag-system/docker-compose.yml up -d"
echo ""

# Démarrer l'adaptateur
python3 services/rag-adapter.py

