# Jàngu Bi Admin

Interface d'administration web pour l'application mobile Jàngu Bi.

## 🏗️ Architecture

### Stack technique
- **Framework**: Next.js 14 (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Authentification**: Firebase Auth
- **Base de données**: Firestore
- **API Dons**: REST API (Neon PostgreSQL)

### Structure hiérarchique

```
Archidiocèse (Dakar)
└── Diocèses (7 fixes)
    └── Paroisses
        └── Églises (internes)
```

## 👥 Rôles et permissions

### 1. Super Admin
- Accès total à toutes les fonctionnalités
- Crée diocèses, paroisses, églises
- Gère tous les utilisateurs
- Voit tous les dons

### 2. Admin Archidiocèse
- Voit tout le Sénégal (lecture seule hors Dakar)
- Peut publier annonces archidiocésaines
- Consulte tous les dons (lecture seule)

### 3. Admin Diocèse
- Gère les paroisses et églises de son diocèse
- Voit les dons de ses paroisses

### 4. Admin Paroisse
- Gère les informations de sa paroisse
- Gère les églises internes
- Gère les actualités, types de dons, notifications
- Voit les dons de sa paroisse

### 5. Admin Église
- Crée des contenus (actualités, activités, prières)
- Contenus en statut "draft" ou "pending"
- Validation par l'admin paroisse pour publication

## 📁 Structure du projet

```
samaquete-admin/
├── app/                    # Pages Next.js (App Router)
│   ├── admin/             # Routes admin
│   │   ├── dashboard/     # Dashboard
│   │   ├── dioceses/      # Gestion diocèses
│   │   ├── parishes/      # Gestion paroisses
│   │   ├── churches/      # Gestion églises
│   │   ├── news/          # Actualités
│   │   ├── donations/     # Dons (lecture seule)
│   │   └── ...
│   └── login/             # Page de connexion
├── components/            # Composants React
│   ├── auth/             # Authentification
│   ├── layout/           # Layouts (Sidebar, Header)
│   └── ui/               # Composants UI réutilisables
├── lib/                  # Utilitaires et services
│   ├── firebase.ts       # Configuration Firebase
│   ├── auth.ts           # Gestion authentification
│   ├── permissions.ts    # Système de permissions
│   ├── api/              # Clients API externes
│   └── firestore/        # Services Firestore
└── types/                # Types TypeScript
```

## 🔑 Règles Firestore

Chaque document doit contenir :
- `dioceseId`: ID du diocèse
- `parishId`: ID de la paroisse
- `status`: "draft" | "pending" | "published"

Le mobile lit uniquement :
- `status === "published"`
- `parishId === selectedParish`

## 💰 Gestion des dons

- Les dons sont stockés dans Neon (PostgreSQL)
- Accès via API REST (lecture seule côté admin)
- Les dons sont toujours rattachés à `parishId` (jamais à `churchId`)

## 🚀 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.local.example .env.local
# Remplir les valeurs Firebase et API
```

3. Lancer le serveur de développement :
```bash
npm run dev
```

## 📝 Notes importantes

- L'application mobile est en production et fonctionne
- L'admin doit s'adapter au mobile, pas l'inverse
- Les églises sont internes (non visibles sur mobile)
- Les dons ne sont jamais liés à une église
- Seuls les admins paroisse et supérieurs peuvent publier
