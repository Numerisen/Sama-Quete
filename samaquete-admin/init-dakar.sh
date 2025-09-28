#!/bin/bash

echo "🚀 Initialisation des données pour l'Archidiocèse de Dakar..."

# Aller dans le répertoire admin
cd samaquete-admin

# Exécuter le script d'initialisation
node lib/init-dakar-data.js

echo "✅ Script d'initialisation terminé !"
echo "📊 Vérifiez maintenant le tableau de bord de l'admin diocèse"
