# 🏡 KreAgency

> Plateforme immobilière web — consultez des biens à la vente ou à la location, explorez les agences sur une carte de France, gérez vos favoris et administrez le catalogue via des tableaux de bord selon votre rôle.

Monorepo **frontend (React + Vite)** + **backend (Express + TypeScript)**, avec **Supabase** (PostgreSQL + Auth) pour la persistance et l'authentification.

---

## ✨ Fonctionnalités

- 🔍 **Catalogue de biens** avec filtres (ville, type, prix, statut) et fiches détaillées
- 🗺️ **Cartographie interactive** (Leaflet) des biens et des agences, filtrable par région / département
- 🏢 **Annuaire des agences** avec biens rattachés
- 💰 **Simulateur d'estimation** de prix au m² (page « Vendre »)
- 👤 **Espace client** : profil, favoris
- 📊 **Tableaux de bord par rôle** : gestion des annonces, des transactions, statistiques
- 🔐 **Authentification sécurisée** par cookies httpOnly + refresh automatique
- 🛡️ **Sécurité** : Helmet/CSP, rate limiting, validation Zod, journalisation des événements sensibles

---

## 🧱 Stack technique

| Couche | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 6, React Router 6, Axios, Framer Motion, Leaflet, Swiper, CSS Modules |
| **Backend** | Node.js, Express 4, TypeScript, Zod, Helmet, CORS, Morgan, express-rate-limit |
| **Base de données / Auth** | Supabase (PostgreSQL + Supabase Auth) |
| **Infrastructure** | Docker, Docker Compose, nginx |

---

## 🚀 Démarrage rapide

### Prérequis
- **Node.js 18+** et **npm**
- Un projet **Supabase** (URL + clés API)

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/Pl0um/y-plaza.git
cd y-plaza

# 2. Installer toutes les dépendances (workspaces frontend + backend)
npm run install:all

# 3. Configurer le backend
cp backend/.env.example backend/.env
# → renseigner SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 4. Lancer le frontend + le backend simultanément
npm run dev
```

- Frontend : **http://localhost:5173**
- Backend (API) : **http://localhost:3000**

En développement, Vite proxifie automatiquement `/api` vers le backend Express.

---

## 📜 Scripts

À la racine du monorepo :

| Script | Description |
|---|---|
| `npm run dev` | Lance backend + frontend en parallèle |
| `npm run dev:frontend` | Frontend uniquement (Vite) |
| `npm run dev:backend` | Backend uniquement (nodemon + ts-node) |
| `npm run build` | Build des deux applications |
| `npm run install:all` | Installe toutes les dépendances |

---

## 🗂️ Structure du projet

```
y-plaza/
├── frontend/                 # Application React (SPA)
│   ├── src/
│   │   ├── components/       # Composants réutilisables (cartes, layout, maps…)
│   │   ├── pages/            # Pages routées (+ dashboard/)
│   │   ├── contexts/         # AuthContext (état d'authentification)
│   │   ├── services/api.ts   # Client HTTP centralisé (axios)
│   │   ├── types/            # Interfaces TypeScript partagées
│   │   └── utils/            # Helpers (deptToRegion…)
│   └── nginx.conf            # Config nginx (prod)
│
├── backend/                  # API REST Express
│   └── src/
│       ├── routes/           # Définition des routes par domaine
│       ├── controllers/      # Logique métier
│       ├── middlewares/      # auth, validate, errorHandler
│       ├── validators/       # Schémas Zod
│       ├── utils/            # securityLogger
│       └── supabase.ts       # Clients Supabase (DB + Auth)
│
├── docker-compose.yml        # Orchestration des conteneurs
├── DOCUMENTATION.md          # Documentation fonctionnelle & technique détaillée
└── readme.md
```

---

## 👥 Rôles & accès

| Rôle | Accès principaux |
|---|---|
| `client` | Profil, favoris |
| `commercial` | Dashboard annonces (CRUD biens) |
| `gestionnaire_ventes` | Dashboard transactions |
| `directeur` | Dashboard statistiques |
| `admin` | Administration complète (utilisateurs, rôles, invitations, agences) |

> Les comptes employés sont créés **par invitation** d'un admin ; l'inscription publique crée uniquement des comptes `client`.

---

## 🔌 Aperçu de l'API

Base : `/api` — réponses au format `{ success, ... }`.

| Domaine | Endpoints |
|---|---|
| **Auth** | `POST /auth/register`, `/login`, `/logout`, `/refresh`, `/reset-password` · `GET/PATCH /auth/me` · `POST /auth/invite` |
| **Biens** | `GET /biens`, `GET /biens/:id`, `POST /biens`, `PUT /biens/:id`, `DELETE /biens/:id` |
| **Agences** | `GET /agences`, `GET /agences/:id`, `GET /agences/:id/biens`, `POST /agences`, `PUT /agences/:id` |
| **Utilisateurs** | `GET /utilisateurs`, `PUT /utilisateurs/:id/role` |
| **Transactions** | `GET /transactions`, `GET /transactions/:id`, `POST /transactions`, `PUT /transactions/:id` |
| **Favoris** | `GET /favoris`, `POST /favoris`, `DELETE /favoris/:bienId` |
| **Santé** | `GET /api/health` |

📖 Détail complet (rôles requis, validation, modèle de données) dans **[DOCUMENTATION.md](DOCUMENTATION.md)**.

---

## ⚙️ Variables d'environnement (backend)

À définir dans `backend/.env` (voir `backend/.env.example`) :

| Variable | Description |
|---|---|
| `PORT` | Port d'écoute du backend (défaut `3000`) |
| `NODE_ENV` | `development` / `production` |
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_ANON_KEY` | Clé publique anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (⚠️ sensible — jamais exposée côté client) |
| `CORS_ORIGIN` | Origine(s) autorisée(s) pour CORS |

---

## 🐳 Déploiement (Docker)

```bash
docker-compose up --build
```

- **frontend** : build Vite servi par nginx sur le port **80** (proxifie `/api/` vers le backend)
- **backend** : API Express sur le port interne **3000**

L'image frontend et l'image backend sont construites en **multi-stage** (build puis runtime allégé).

---

## 📚 Documentation

La documentation **fonctionnelle et technique complète** (architecture, modèle de données, API détaillée, sécurité, déploiement) est disponible dans **[DOCUMENTATION.md](DOCUMENTATION.md)**.

---

VICENTE ROMAIN 
PLOYER KEO 
GRANANA ENZO 
