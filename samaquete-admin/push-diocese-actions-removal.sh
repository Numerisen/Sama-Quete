#!/bin/bash

# Script pour pousser la suppression des actions admin diocèse vers Git
# Passage en mode consultation uniquement

echo "🚀 Poussée de la suppression des actions admin diocèse vers Git..."
echo ""

# Vérifier le statut Git
echo "📊 Statut Git actuel :"
git status --short
echo ""

# Ajouter tous les fichiers modifiés
echo "📁 Ajout des fichiers modifiés..."
git add .

# Vérifier les fichiers ajoutés
echo "📋 Fichiers ajoutés :"
git status --staged
echo ""

# Créer un commit avec un message descriptif
echo "💾 Création du commit..."
git commit -m "feat: Suppression des actions admin diocèse - Mode consultation uniquement

✅ Modifications apportées :
- Suppression de toutes les actions de modification et suppression
- Suppression des boutons d'édition, suppression et création
- Suppression des colonnes 'Actions' dans les tableaux
- Commentaire des fonctions d'export (CSV, Excel, Template)
- Passage en mode consultation uniquement

📊 Pages modifiées :
- admindiocese/users/page.tsx
- admindiocese/paroisses/page.tsx  
- admindiocese/donations/page.tsx
- admindiocese/news/page.tsx
- admindiocese/liturgy/page.tsx

🎯 Résultat :
- Interface admin diocèse en mode consultation uniquement
- Plus d'édition, suppression ou export possible
- Visualisation des données Firestore uniquement
- Interface plus sécurisée et contrôlée"

# Pousser vers le repository distant
echo "🌐 Poussée vers le repository distant..."
git push

echo ""
echo "✅ Modifications poussées avec succès !"
echo ""
echo "📝 Résumé des changements :"
echo "   - Actions de modification supprimées"
echo "   - Actions de suppression supprimées"
echo "   - Fonctions d'export commentées"
echo "   - Mode consultation uniquement activé"
echo ""
echo "🎯 Interface admin diocèse :"
echo "   - Visualisation des données uniquement"
echo "   - Recherche et filtres fonctionnels"
echo "   - États vides informatifs"
echo "   - Plus de modifications possibles"
