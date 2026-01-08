#!/bin/sh
set -e

# Script d'entrée Docker pour démarrer les services

echo "🚀 Démarrage de Sama-Quete..."

# Vérifier que les variables d'environnement requises sont définies
if [ -z "$FIREBASE_PROJECT_ID" ]; then
  echo "⚠️  Avertissement: FIREBASE_PROJECT_ID non défini"
fi

if [ -z "$PAYDUNYA_MASTER_KEY" ]; then
  echo "⚠️  Avertissement: PAYDUNYA_MASTER_KEY non défini"
fi

# Démarrer l'API de paiement en arrière-plan
echo "📦 Démarrage de l'API de paiement sur le port ${PAYMENT_API_PORT:-3001}..."
cd /app/payment-api
PORT=${PAYMENT_API_PORT:-3001} NODE_ENV=production npm start &
PAYMENT_API_PID=$!

# Attendre que l'API de paiement soit prête
echo "⏳ Attente du démarrage de l'API de paiement..."
sleep 5

# Vérifier que l'API de paiement répond
for i in 1 2 3 4 5; do
  if curl -f http://localhost:${PAYMENT_API_PORT:-3001}/api/entitlements > /dev/null 2>&1 || \
     curl -f http://localhost:${PAYMENT_API_PORT:-3001} > /dev/null 2>&1; then
    echo "✅ API de paiement démarrée"
    break
  fi
  if [ $i -eq 5 ]; then
    echo "⚠️  L'API de paiement ne répond pas encore, mais on continue..."
  else
    sleep 2
  fi
done

# Démarrer l'application admin
echo "🌐 Démarrage de l'application admin sur le port ${ADMIN_PORT:-3000}..."
cd /app/samaquete-admin
PORT=${ADMIN_PORT:-3000} NODE_ENV=production npm start &
ADMIN_PID=$!

# Fonction de nettoyage à l'arrêt
cleanup() {
  echo "🛑 Arrêt des services..."
  kill $PAYMENT_API_PID $ADMIN_PID 2>/dev/null || true
  wait $PAYMENT_API_PID $ADMIN_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGTERM SIGINT

# Attendre indéfiniment
wait

