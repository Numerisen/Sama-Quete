# ============================================
# Dockerfile Production pour Sama-Quete
# ============================================
# Build optimisé multi-stage pour Next.js
# - samaquete-admin (port 3000)
# - payment-api (port 3001)

# ============================================
# Stage 1: Base avec Node 20
# ============================================
FROM node:20-alpine AS base

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    curl

# ============================================
# Stage 2: Builder samaquete-admin
# ============================================
FROM base AS admin-builder

WORKDIR /app/samaquete-admin

# Copier les fichiers de dépendances
COPY samaquete-admin/package*.json ./

# Installer toutes les dépendances (y compris devDependencies pour le build)
RUN npm ci --include=dev

# Copier le reste des fichiers
COPY samaquete-admin/ ./

# Builder l'application Next.js
RUN npm run build

# ============================================
# Stage 3: Builder payment-api
# ============================================
FROM base AS payment-api-builder

WORKDIR /app/payment-api

# Copier les fichiers de dépendances
COPY payment-api/package*.json ./

# Installer toutes les dépendances (y compris devDependencies pour le build)
RUN npm ci --include=dev

# Copier le reste des fichiers
COPY payment-api/ ./

# Builder l'API Next.js
RUN npm run build

# ============================================
# Stage 4: Image de production finale
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Installer curl pour les health checks et dépendances système minimales
RUN apk add --no-cache curl

# Créer les répertoires pour les applications
RUN mkdir -p /app/samaquete-admin /app/payment-api

# ============================================
# Copier samaquete-admin (production)
# ============================================
WORKDIR /app/samaquete-admin

# Copier les fichiers de build et de production
COPY --from=admin-builder /app/samaquete-admin/.next ./.next
COPY --from=admin-builder /app/samaquete-admin/public ./public
COPY --from=admin-builder /app/samaquete-admin/package*.json ./
COPY --from=admin-builder /app/samaquete-admin/next.config.mjs ./

# Installer uniquement les dépendances de production
# Next.js nécessite typescript et webpack au runtime pour charger les configs
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# ============================================
# Copier payment-api (production)
# ============================================
WORKDIR /app/payment-api

# Copier les fichiers de build et de production
COPY --from=payment-api-builder /app/payment-api/.next ./.next
COPY --from=payment-api-builder /app/payment-api/public ./public
COPY --from=payment-api-builder /app/payment-api/package*.json ./
COPY --from=payment-api-builder /app/payment-api/next.config.ts ./

# Installer les dépendances de production + TypeScript (nécessaire pour next.config.ts)
RUN npm ci --omit=dev --ignore-scripts && \
    npm install --save typescript@^5 --ignore-scripts && \
    npm cache clean --force

# ============================================
# Script de démarrage
# ============================================
WORKDIR /app
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# ============================================
# Variables d'environnement
# ============================================
ENV NODE_ENV=production
ENV PORT=3000
ENV PAYMENT_API_PORT=3001
ENV ADMIN_PORT=3000

# Exposer les ports
EXPOSE 3000 3001

# Point d'entrée
ENTRYPOINT ["/app/docker-entrypoint.sh"]
