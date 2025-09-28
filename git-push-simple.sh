#!/bin/bash

# Script simple pour pousser les modifications
echo "🚀 Push des modifications Sama Quete..."

# Aller dans le répertoire du projet
cd /Users/cheikhahmadoubambakebe/Desktop/Samaquete-RECLONE/Sama-Quete

# Ajouter tous les fichiers
git add .

# Commiter avec un message descriptif
git commit -m "feat: Amélioration admin diocèse - correction navigation et mode consultation"

# Pousser vers main
git push origin main

echo "✅ Push terminé !"
