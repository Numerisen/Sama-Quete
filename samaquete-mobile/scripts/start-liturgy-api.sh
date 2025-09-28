#!/bin/bash

# Script de démarrage pour l'API des textes liturgiques
# Ce script lance l'API Python et ngrok automatiquement

echo "🚀 Démarrage de l'API des textes liturgiques"
echo "============================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    print_error "Python3 n'est pas installé"
    exit 1
fi

# Vérifier si ngrok est installé
if ! command -v ngrok &> /dev/null; then
    print_error "ngrok n'est pas installé. Installez-le avec: brew install ngrok/ngrok/ngrok"
    exit 1
fi

# Vérifier si le dossier de l'API existe
API_DIR="../TextOfTheDay"
if [ ! -d "$API_DIR" ]; then
    print_warning "Le dossier de l'API n'existe pas. Clonage du repository..."
    git clone https://github.com/Numerisen/TextOfTheDay.git "$API_DIR"
    if [ $? -ne 0 ]; then
        print_error "Impossible de cloner le repository"
        exit 1
    fi
fi

# Aller dans le dossier de l'API
cd "$API_DIR" || exit 1

print_status "Installation des dépendances Python..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    print_error "Erreur lors de l'installation des dépendances"
    exit 1
fi

print_success "Dépendances installées"

# Créer un fichier de configuration pour l'API si nécessaire
if [ ! -f "config.py" ]; then
    print_status "Création du fichier de configuration..."
    cat > config.py << EOF
# Configuration pour l'API des textes liturgiques
import os

# Configuration de base
DEBUG = True
HOST = '0.0.0.0'
PORT = 5000

# Configuration CORS
CORS_ORIGINS = ['*']

# Configuration de la base de données (si nécessaire)
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///liturgy.db')

# Configuration des logs
LOG_LEVEL = 'INFO'
EOF
    print_success "Fichier de configuration créé"
fi

# Lancer l'API Python en arrière-plan
print_status "Lancement de l'API Python sur le port 5000..."
python3 app.py &
API_PID=$!

# Attendre que l'API soit prête
print_status "Attente du démarrage de l'API..."
sleep 5

# Vérifier si l'API fonctionne
if curl -s http://localhost:5000/health > /dev/null; then
    print_success "API Python lancée avec succès (PID: $API_PID)"
else
    print_error "L'API Python n'a pas démarré correctement"
    kill $API_PID 2>/dev/null
    exit 1
fi

# Lancer ngrok
print_status "Lancement de ngrok..."
ngrok http 5000 &
NGROK_PID=$!

# Attendre que ngrok soit prêt
print_status "Attente du démarrage de ngrok..."
sleep 3

# Récupérer l'URL ngrok
print_status "Récupération de l'URL ngrok..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data['tunnels']:
    print(data['tunnels'][0]['public_url'])
else:
    print('')
")

if [ -n "$NGROK_URL" ]; then
    print_success "ngrok lancé avec succès"
    print_success "URL publique: $NGROK_URL"
    print_success "URL de l'API: $NGROK_URL/api/liturgy/today"
    
    # Sauvegarder l'URL dans un fichier
    echo "$NGROK_URL" > ../ngrok_url.txt
    print_status "URL sauvegardée dans ngrok_url.txt"
else
    print_warning "Impossible de récupérer l'URL ngrok"
fi

print_success "🎉 Configuration terminée !"
echo ""
echo "📋 Instructions:"
echo "1. L'API Python fonctionne sur: http://localhost:5000"
echo "2. L'URL publique ngrok est: $NGROK_URL"
echo "3. Testez l'API: curl $NGROK_URL/api/liturgy/today"
echo "4. Dans votre app mobile, utilisez l'URL ngrok"
echo ""
echo "🛑 Pour arrêter les services:"
echo "   kill $API_PID $NGROK_PID"
echo ""

# Fonction de nettoyage
cleanup() {
    print_status "Arrêt des services..."
    kill $API_PID $NGROK_PID 2>/dev/null
    print_success "Services arrêtés"
    exit 0
}

# Capturer les signaux d'arrêt
trap cleanup SIGINT SIGTERM

# Attendre indéfiniment
print_status "Services en cours d'exécution... (Ctrl+C pour arrêter)"
wait
