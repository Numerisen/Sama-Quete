#!/bin/bash

# Script pour démarrer l'API Flask et ngrok automatiquement

echo "🚀 Démarrage de l'API Flask et ngrok pour Jàngu Bi"
echo ""

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 n'est pas installé"
    exit 1
fi

# Vérifier si ngrok est installé
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok n'est pas installé"
    echo "📦 Installez-le avec: brew install ngrok/ngrok/ngrok"
    exit 1
fi

# Vérifier si le fichier API existe
if [ ! -f "assistant_biblique_optimized.py" ]; then
    echo "❌ Fichier assistant_biblique_optimized.py non trouvé"
    exit 1
fi

# Vérifier si le port 8000 est déjà utilisé
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Le port 8000 est déjà utilisé"
    echo "   Arrêtez le processus existant ou changez le port"
    exit 1
fi

# Vérifier si ngrok est déjà en cours d'exécution
if lsof -Pi :4040 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  ngrok est déjà en cours d'exécution sur le port 4040"
    echo "   Arrêtez-le d'abord avec: pkill ngrok"
    exit 1
fi

echo "📦 Installation des dépendances Python si nécessaire..."
pip3 install flask flask-cors requests beautifulsoup4 pytz openai anthropic --quiet 2>/dev/null || true

echo ""
echo "🌐 Démarrage de l'API Flask sur le port 8000..."
python3 assistant_biblique_optimized.py &
FLASK_PID=$!

# Attendre que Flask démarre
echo "⏳ Attente du démarrage de Flask (5 secondes)..."
sleep 5

# Vérifier si Flask fonctionne
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API Flask démarrée avec succès (PID: $FLASK_PID)"
else
    echo "❌ L'API Flask n'a pas démarré correctement"
    kill $FLASK_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🔗 Démarrage de ngrok..."
ngrok http 8000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Attendre que ngrok démarre
echo "⏳ Attente du démarrage de ngrok (3 secondes)..."
sleep 3

# Récupérer l'URL ngrok
echo "📡 Récupération de l'URL ngrok..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('tunnels'):
        print(data['tunnels'][0]['public_url'])
    else:
        print('')
except:
    print('')
" 2>/dev/null)

if [ -n "$NGROK_URL" ]; then
    echo ""
    echo "✅ ngrok lancé avec succès !"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌐 URL publique ngrok: $NGROK_URL"
    echo "📋 Endpoint API: $NGROK_URL/api/text-of-the-day"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Sauvegarder l'URL dans un fichier
    echo "$NGROK_URL" > ngrok_url.txt
    echo "💾 URL sauvegardée dans: ngrok_url.txt"
    echo ""
    
    echo "📝 Prochaines étapes:"
    echo "1. Copiez l'URL ci-dessus: $NGROK_URL"
    echo "2. Mettez à jour l'URL dans:"
    echo "   - samaquete-mobile/lib/liturgyApiService.ts (ligne 16)"
    echo "   - samaquete-mobile/src/components/screens/liturgy/LiturgyScreen.tsx (ligne 31)"
    echo "3. Redémarrez votre app mobile (Expo)"
    echo ""
    echo "🧪 Testez l'API:"
    echo "   curl $NGROK_URL/api/text-of-the-day"
    echo ""
    echo "🛑 Pour arrêter les services:"
    echo "   kill $FLASK_PID $NGROK_PID"
    echo "   ou"
    echo "   pkill -f assistant_biblique_optimized.py"
    echo "   pkill ngrok"
    echo ""
else
    echo "⚠️  Impossible de récupérer l'URL ngrok"
    echo "   Vérifiez les logs: tail -f /tmp/ngrok.log"
    echo "   ou visitez: http://localhost:4040"
fi

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    kill $FLASK_PID $NGROK_PID 2>/dev/null || true
    wait $FLASK_PID $NGROK_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# Attendre indéfiniment
echo "✅ Services en cours d'exécution. Appuyez sur Ctrl+C pour arrêter."
wait

