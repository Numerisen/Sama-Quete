# Makefile pour Sama-Quete
# Simplifie les commandes courantes du projet

.PHONY: help install init-submodules build docker-build docker-up docker-down docker-logs clean

help: ## Afficher cette aide
	@echo "Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Installer toutes les dépendances
	@echo "📦 Installation des dépendances..."
	cd samaquete-admin && npm install
	cd payment-api && npm install || echo "⚠️  payment-api non disponible"
	@echo "✅ Installation terminée"

init-submodules: ## Initialiser les submodules Git
	@echo "🔧 Initialisation des submodules..."
	./scripts/init-submodules.sh

check-submodule: ## Vérifier l'état du submodule payment-api
	@./scripts/check-submodule.sh

build: ## Builder toutes les applications
	@echo "🔨 Build des applications..."
	cd samaquete-admin && npm run build
	cd payment-api && npm run build || echo "⚠️  payment-api non disponible"
	@echo "✅ Build terminé"

docker-build: ## Builder l'image Docker
	@echo "🐳 Build de l'image Docker..."
	docker build -t samaquete:latest .
	@echo "✅ Image Docker buildée"

docker-up: ## Démarrer les services Docker
	@echo "🚀 Démarrage des services Docker..."
	docker-compose up -d
	@echo "✅ Services démarrés"

docker-down: ## Arrêter les services Docker
	@echo "🛑 Arrêt des services Docker..."
	docker-compose down
	@echo "✅ Services arrêtés"

docker-logs: ## Afficher les logs Docker
	docker-compose logs -f

docker-restart: ## Redémarrer les services Docker
	@make docker-down
	@make docker-up

clean: ## Nettoyer les fichiers de build et node_modules
	@echo "🧹 Nettoyage..."
	rm -rf samaquete-admin/.next
	rm -rf samaquete-admin/node_modules
	rm -rf payment-api/.next
	rm -rf payment-api/node_modules
	@echo "✅ Nettoyage terminé"

dev-admin: ## Démarrer l'application admin en mode développement
	cd samaquete-admin && npm run dev

dev-payment: ## Démarrer l'API de paiement en mode développement
	cd payment-api && npm run dev

