#!/bin/bash

# Script pour pousser les modifications sur Git
# Sama Quete - Administration Diocèse

echo "🚀 Début du processus de push Git pour Sama Quete"
echo "=================================================="

# Aller dans le répertoire racine du projet
cd /Users/cheikhahmadoubambakebe/Desktop/Samaquete-RECLONE/Sama-Quete

echo "📁 Répertoire de travail: $(pwd)"
echo ""

# Vérifier l'état de Git
echo "📊 Vérification de l'état Git..."
git status
echo ""

# Ajouter tous les fichiers modifiés
echo "➕ Ajout des fichiers modifiés..."
git add .

# Vérifier ce qui va être commité
echo "📋 Fichiers à commiter:"
git status --porcelain
echo ""

# Créer un commit avec un message descriptif
echo "💾 Création du commit..."
git commit -m "feat: Amélioration de l'administration diocèse

- Correction du lien tableau de bord dans la sidebar diocèse
- Suppression des colonnes Actions des pages consultation (dons, utilisateurs, paroisses)
- Transformation des pages en mode consultation uniquement
- Ajout de données de test pour l'Archidiocèse de Dakar
- Amélioration de la navigation et de l'expérience utilisateur
- Intégration complète avec Firebase Firestore

Pages modifiées:
- components/admin/sidebar-diocese.tsx
- app/admindiocese/dashboard/page.tsx
- app/admindiocese/donations/page.tsx
- app/admindiocese/users/page.tsx
- app/admindiocese/paroisses/page.tsx
- lib/init-dakar-data.js (nouveau)
- init-dakar.sh (nouveau)"

echo ""

# Pousser vers le repository distant
echo "🚀 Push vers le repository distant..."
git push origin main

# Vérifier le statut final
echo ""
echo "✅ Push terminé !"
echo "📊 Statut final:"
git status

echo ""
echo "🎉 Toutes les modifications ont été poussées avec succès sur Git !"
echo "🔗 Repository: $(git remote get-url origin)"
echo "📝 Dernier commit: $(git log --oneline -1)"
