#!/bin/bash

# Script de push manuel sur Git
# Utilisation: ./git-push-manual.sh "Votre message de commit"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}   Push manuel sur Git${NC}"
echo -e "${BLUE}==================================${NC}\n"

# Vérifier si un message de commit est fourni
if [ -z "$1" ]; then
    echo -e "${YELLOW}Message de commit par défaut utilisé${NC}"
    COMMIT_MESSAGE="Mise à jour: $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MESSAGE="$1"
fi

echo -e "${BLUE}Message de commit:${NC} $COMMIT_MESSAGE\n"

# 1. Vérifier le statut Git
echo -e "${YELLOW}1. Vérification du statut Git...${NC}"
git status

# 2. Ajouter tous les fichiers
echo -e "\n${YELLOW}2. Ajout de tous les fichiers...${NC}"
git add .

# 3. Afficher les fichiers qui seront commités
echo -e "\n${YELLOW}3. Fichiers à commiter:${NC}"
git status --short

# 4. Créer le commit
echo -e "\n${YELLOW}4. Création du commit...${NC}"
git commit -m "$COMMIT_MESSAGE"

# 5. Afficher la branche actuelle
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "\n${BLUE}Branche actuelle:${NC} $CURRENT_BRANCH"

# 6. Push vers le dépôt distant
echo -e "\n${YELLOW}5. Push vers le dépôt distant...${NC}"
git push origin $CURRENT_BRANCH

# 7. Vérifier le résultat
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Push réussi !${NC}"
    echo -e "${GREEN}Les modifications ont été envoyées sur GitHub${NC}"
else
    echo -e "\n${RED}❌ Erreur lors du push${NC}"
    echo -e "${RED}Vérifiez votre connexion ou les conflits éventuels${NC}"
    exit 1
fi

# 8. Afficher les derniers commits
echo -e "\n${YELLOW}Derniers commits:${NC}"
git log --oneline -5

echo -e "\n${BLUE}==================================${NC}"
echo -e "${GREEN}   Terminé !${NC}"
echo -e "${BLUE}==================================${NC}"

