# Documentation — KreAgency

> Plateforme immobilière web (monorepo). Document fonctionnel et technique.
> Généré par analyse du code source — version au 14/06/2026.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Documentation fonctionnelle](#2-documentation-fonctionnelle)
3. [Documentation technique](#3-documentation-technique)
4. [Modèle de données](#4-modèle-de-données)
5. [API REST](#5-api-rest)
6. [Authentification & sécurité](#6-authentification--sécurité)
7. [Déploiement & environnement](#7-déploiement--environnement)
8. [Installation & démarrage local](#8-installation--démarrage-local)
9. [Points d'attention](#9-points-dattention)

---

## 1. Vue d'ensemble

**KreAgency** est une plateforme immobilière permettant de consulter des biens à la vente ou à la location, d'explorer les agences sur une carte de France, de gérer ses favoris, et d'administrer le catalogue via des tableaux de bord selon le rôle de l'utilisateur.

Le projet est un **monorepo npm workspaces** composé de deux applications :

| Application | Rôle | Technologie |
|---|---|---|
| `frontend` | Interface web (SPA) | React 18 + TypeScript + Vite |
| `backend` | API REST | Node.js + Express + TypeScript |

La persistance et l'authentification sont déléguées à **Supabase** (PostgreSQL + Supabase Auth).

### Schéma d'architecture

```
Navigateur
   │
   ▼
[ Frontend React (SPA) ]  ──proxy /api──►  [ Backend Express (API REST) ]
   nginx (prod) / Vite (dev)                       │
                                                    ▼
                                            [ Supabase ]
                                         PostgreSQL + Auth
```

- En **développement** : Vite (port 5173) proxifie `/api` vers Express (port 3000).
- En **production** : nginx sert le build statique du frontend (port 80) et proxifie `/api/` vers le conteneur `backend:3000`.

---

## 2. Documentation fonctionnelle

### 2.1 Rôles utilisateurs

L'application définit 5 rôles (identiques côté frontend `RoleUtilisateur` et backend `Role`) :

| Rôle | Description | Accès principaux |
|---|---|---|
| `client` | Visiteur inscrit | Profil, favoris |
| `commercial` | Agent immobilier | Dashboard annonces (CRUD biens) |
| `gestionnaire_ventes` | Gestion des ventes | Dashboard transactions |
| `directeur` | Direction d'agence | Dashboard statistiques (lecture transactions limitée à son agence) |
| `admin` | Administrateur | Accès total : utilisateurs, rôles, invitations, agences, biens, transactions |

Les comptes employés (`commercial`, `gestionnaire_ventes`, `directeur`, `admin`) ne peuvent **pas** s'auto-inscrire : ils sont créés par invitation d'un admin. L'inscription publique crée uniquement des comptes `client`.

### 2.2 Pages publiques (sans connexion)

| Route | Page | Fonctionnalité |
|---|---|---|
| `/` | Accueil | Hero, carrousel de biens en vedette, section « à propos » |
| `/louer` | Louer | Catalogue des biens en location, carte de France filtrable |
| `/acheter` | Acheter | Catalogue des biens à la vente, carte de France filtrable |
| `/vendre` | Vendre | Simulateur d'estimation de prix au m² (calcul local, indicatif) |
| `/biens` | Liste des biens | Liste avec filtres (ville, type, prix, statut) |
| `/biens/:id` | Détail d'un bien | Galerie photos, caractéristiques, carte de localisation |
| `/agences` | Agences | Carte de France des agences + liste, filtrage par région/département |
| `/agences/:id` | Détail d'une agence | Coordonnées, carte, biens rattachés |
| `/login` | Connexion | Authentification email / mot de passe |
| `/register` | Inscription | Création d'un compte client |
| `/reset-password` | Mot de passe oublié | Envoi d'un email de réinitialisation |
| `/mentions-legales` | Mentions légales | Page d'information légale |

> Les pages `/louer` et `/acheter` sont deux instances du même composant `FrancePage`, paramétré par `typeTransaction` (`location` / `vente`).

### 2.3 Espace client (connecté)

| Route | Accès | Fonctionnalité |
|---|---|---|
| `/profil` | Tout utilisateur connecté | Modifier nom / prénom / téléphone ; consulter et retirer ses favoris |

### 2.4 Tableaux de bord (selon rôle)

| Route | Rôles autorisés | Fonctionnalité |
|---|---|---|
| `/dashboard/annonces` | `commercial`, `admin` | Gestion des biens : créer, modifier, supprimer (CRUD via modale) |
| `/dashboard/transactions` | `gestionnaire_ventes`, `admin` | Suivi des transactions, mise à jour du statut et des notes |
| `/dashboard/stats` | `directeur`, `admin` | Statistiques agrégées : biens par ville, transactions finalisées par mois |
| `/admin` | `admin` | Administration : gestion des utilisateurs et de leurs rôles, invitations d'employés, gestion des agences |

### 2.5 Matrice fonctionnelle (résumé)

| Fonctionnalité | client | commercial | gestionnaire | directeur | admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Consulter biens / agences | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gérer ses favoris | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modifier son profil | ✅ | ✅ | ✅ | ✅ | ✅ |
| CRUD biens | — | ✅ | — | — | ✅ |
| Supprimer un bien | — | — | — | — | ✅ |
| Gérer les transactions | — | — | ✅ | lecture | ✅ |
| Voir les statistiques | — | — | — | ✅ | ✅ |
| Gérer utilisateurs / rôles | — | — | — | lecture¹ | ✅ |
| Inviter un employé | — | — | — | — | ✅ |
| Gérer les agences | — | — | — | — | ✅ |

¹ Le backend autorise `directeur` à lister les utilisateurs (`GET /utilisateurs`), mais aucune page frontend dédiée ne l'expose (l'écran `/admin` est réservé à `admin`).

---

## 3. Documentation technique

### 3.1 Stack technique

**Frontend**
- React 18.3 + TypeScript (~5.8)
- Vite 6 (build & dev server)
- react-router-dom 6 (routing SPA)
- axios (client HTTP, avec intercepteur de refresh)
- framer-motion (animations)
- leaflet + react-leaflet (cartes)
- swiper (carrousels)
- CSS Modules (styles encapsulés par composant)

**Backend**
- Node.js + Express 4 + TypeScript
- @supabase/supabase-js (accès DB + Auth)
- zod (validation des entrées)
- helmet (headers de sécurité), cors, morgan (logs HTTP)
- express-rate-limit (limitation de débit)
- cookie-parser (lecture du cookie httpOnly)
- dotenv (variables d'environnement)

**Base de données / Auth**
- Supabase (PostgreSQL managé + Supabase Auth)

**Infrastructure**
- Docker + docker-compose
- nginx (service du frontend + reverse proxy `/api`)

### 3.2 Structure du frontend (`frontend/src`)

```
src/
├── App.tsx                  # Routeur principal + layout (Navbar/Footer)
├── main.tsx                 # Point d'entrée React
├── components/              # Composants réutilisables
│   ├── Navbar, Footer       # Layout global
│   ├── Hero, PropertyCarousel, AboutSection   # Accueil
│   ├── FranceMap, MapView   # Cartographie (leaflet)
│   ├── BienCard, BienListCard, BienFilters    # Biens
│   └── ProtectedRoute       # Garde de routes (auth + rôle)
├── pages/                   # Pages routées
│   ├── (publiques)          # Home, Acheter, Louer, Vendre, Biens, Agences…
│   └── dashboard/           # AnnoncesPage, TransactionsPage, StatsPage
├── contexts/
│   └── AuthContext.tsx      # État d'authentification global (hook useAuth)
├── services/
│   └── api.ts               # Client HTTP centralisé (axios) vers le backend
├── types/
│   └── index.ts             # Interfaces TypeScript partagées
└── utils/
    └── deptToRegion.ts      # Mapping département → région (filtrage carte)
```

**Gestion de l'état d'authentification** — `AuthContext` :
- Au montage, appelle `GET /auth/me` pour restaurer la session depuis le cookie httpOnly.
- Expose `user`, `role`, `isAuthenticated`, `loading`, et les actions `login`, `logout`, `refreshUser`.
- Écoute l'événement `auth:session-expired` (émis par l'intercepteur axios) pour déconnecter l'UI quand le refresh token est invalide.

**Découpage du build** (`vite.config.ts`) : les dépendances lourdes sont séparées en chunks (`vendor-react`, `vendor-motion`, `vendor-swiper`, `vendor-leaflet`) pour optimiser le cache navigateur.

### 3.3 Structure du backend (`backend/src`)

```
src/
├── index.ts                 # Bootstrap Express : middlewares, rate-limit, routes
├── supabase.ts              # Clients Supabase (DB + Auth, isolés)
├── routes/                  # Définition des routes par domaine
│   ├── auth, biens, agences, utilisateurs, transactions, favoris
├── controllers/             # Logique métier par domaine
├── middlewares/
│   ├── auth.ts              # authenticate + requireRole
│   ├── validate.ts          # Validation Zod générique
│   └── errorHandler.ts      # Gestion centralisée des erreurs
├── validators/
│   └── schemas.ts           # Schémas Zod par endpoint
└── utils/
    └── securityLogger.ts    # Journalisation des événements sensibles
```

**Pattern de routage** : chaque route assemble une chaîne de middlewares dans l'ordre
`authenticate → requireRole(...) → validate(schema) → controller`.

**Clients Supabase isolés** (`supabase.ts`) : deux clients distincts sont créés —
`supabase` pour les requêtes DB (service role, bypass RLS) et `supabaseAuth` pour les
opérations d'authentification — afin d'éviter toute contamination de session.

---

## 4. Modèle de données

Tables PostgreSQL (Supabase) déduites du code. L'authentification s'appuie sur `auth.users`
(table interne Supabase) ; un trigger `handle_new_user` crée la ligne `utilisateurs` à partir
des métadonnées d'inscription / d'invitation.

### `utilisateurs`
| Champ | Type | Notes |
|---|---|---|
| `id` | uuid | = `auth.users.id` |
| `email` | text | |
| `nom`, `prenom` | text | |
| `role` | enum | client / commercial / gestionnaire_ventes / directeur / admin |
| `agence_id` | uuid \| null | rattachement à une agence |
| `telephone` | text \| null | |
| `actif` | bool | un compte inactif est refusé à la connexion |

### `agences`
| Champ | Type |
|---|---|
| `id` | uuid |
| `nom`, `adresse`, `ville`, `code_postal` | text |
| `telephone`, `email` | text |
| `latitude`, `longitude` | numeric \| null |
| `est_siege` | bool \| null |

### `biens`
| Champ | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `titre`, `description` | text | |
| `type_bien` | enum | appartement / maison / bureau / commerce / terrain |
| `type_transaction` | enum | vente / location |
| `prix` | numeric | |
| `surface`, `nb_pieces`, `nb_chambres` | numeric \| null | |
| `adresse`, `ville`, `code_postal` | text | |
| `latitude`, `longitude` | numeric \| null | |
| `statut` | enum | disponible / sous_compromis / vendu / loue |
| `agence_id`, `agent_id` | uuid \| null | |
| `created_at`, `updated_at` | timestamp | |

### `photos_biens`
| Champ | Type | Notes |
|---|---|---|
| `bien_id` | uuid | FK → biens (suppression en cascade) |
| `url` | text | URL HTTPS |
| `ordre` | int | ordre d'affichage |

> Les photos sont stockées dans une table séparée et **aplaties** en `photos: string[]`
> par les contrôleurs avant d'être renvoyées au frontend.

### `transactions`
| Champ | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `bien_id` | uuid | FK → biens |
| `acheteur_id` | uuid | FK → utilisateurs |
| `prix_final` | numeric | |
| `type` | enum | vente / location |
| `statut` | enum | en_cours / finalisee / annulee |
| `notes` | text \| null | |
| `created_at` | timestamp | |

### `favoris`
| Champ | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `utilisateur_id` | uuid | FK → utilisateurs |
| `bien_id` | uuid | FK → biens |
| `created_at` | timestamp | contrainte UNIQUE (utilisateur_id, bien_id) |

---

## 5. API REST

Base : `/api`. Toutes les réponses suivent le format `{ success: boolean, ... }`.
Réponses types : `{ success, data }`, `{ success, count, data }`, `{ success, message }`,
ou `{ success: false, error/message, details? }` en cas d'erreur.

### 5.1 Authentification — `/api/auth`
| Méthode | Endpoint | Accès | Validation | Description |
|---|---|---|---|---|
| POST | `/register` | public | `registerSchema` | Inscription (rôle client) |
| POST | `/login` | public | `loginSchema` | Connexion → pose le cookie httpOnly, renvoie le profil |
| POST | `/logout` | public | — | Efface les cookies de session |
| POST | `/refresh` | public | — | Renouvelle le JWT via le refresh token (cookie) |
| POST | `/reset-password` | public | `resetPasswordSchema` | Envoi d'un email de réinitialisation |
| GET | `/me` | authentifié | — | Profil de l'utilisateur connecté |
| PATCH | `/me` | authentifié | `updateProfilSchema` | Mise à jour du profil |
| POST | `/invite` | admin | `inviteSchema` | Invitation d'un employé par email |

### 5.2 Biens — `/api/biens`
| Méthode | Endpoint | Accès | Validation | Description |
|---|---|---|---|---|
| GET | `/` | public | — | Liste (filtres : ville, type_bien, type_transaction, prix_min, prix_max, statut) |
| GET | `/:id` | public | — | Détail d'un bien (avec photos) |
| POST | `/` | commercial, admin | `bienSchema` | Créer un bien (+ photos) |
| PUT | `/:id` | commercial, admin | `bienUpdateSchema` | Modifier un bien |
| DELETE | `/:id` | admin | — | Supprimer un bien (cascade photos) |

### 5.3 Agences — `/api/agences`
| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| GET | `/` | public | Liste des agences |
| GET | `/:id` | public | Détail d'une agence |
| GET | `/:id/biens` | public | Biens rattachés à l'agence |
| POST | `/` | admin | Créer une agence (validation manuelle) |
| PUT | `/:id` | admin | Modifier une agence (validation manuelle) |

### 5.4 Utilisateurs — `/api/utilisateurs`
| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| GET | `/` | directeur, admin | Liste des utilisateurs |
| PUT | `/:id/role` | admin | Modifier rôle / activation / agence d'un utilisateur |

### 5.5 Transactions — `/api/transactions` *(toutes authentifiées)*
| Méthode | Endpoint | Accès | Validation | Description |
|---|---|---|---|---|
| GET | `/` | gestionnaire_ventes, directeur, admin | — | Liste (directeur : limité à son agence) |
| GET | `/:id` | gestionnaire_ventes, directeur, admin | — | Détail d'une transaction |
| POST | `/` | gestionnaire_ventes, admin | `transactionSchema` | Créer une transaction |
| PUT | `/:id` | gestionnaire_ventes, admin | `transactionUpdateSchema` | Mettre à jour statut / notes / prix |

### 5.6 Favoris — `/api/favoris` *(toutes authentifiées)*
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/` | Favoris de l'utilisateur connecté (avec détail du bien) |
| POST | `/` | Ajouter un bien aux favoris (`{ bien_id }`) |
| DELETE | `/:bienId` | Retirer un bien des favoris |

### 5.7 Santé
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Vérification de disponibilité de l'API |

---

## 6. Authentification & sécurité

### 6.1 Flux d'authentification (cookies httpOnly)
1. `POST /auth/login` vérifie les identifiants auprès de Supabase Auth.
2. Le backend pose deux cookies **httpOnly** (`sb-token` = JWT d'accès, `sb-refresh-token`).
   Le JWT **n'est jamais** renvoyé dans le corps de la réponse — protection contre le XSS.
3. Chaque requête authentifiée envoie automatiquement le cookie (`withCredentials: true`).
4. Le middleware `authenticate` lit le cookie (ou, en fallback, le header `Authorization: Bearer`),
   vérifie le JWT via Supabase, charge le profil et vérifie que le compte est actif.
5. Sur réponse `401`, l'intercepteur axios appelle `POST /auth/refresh` et rejoue la requête.
   En cas d'échec, il émet `auth:session-expired` (déconnexion UI). Les requêtes concurrentes
   sont mises en file d'attente pendant le refresh.

### 6.2 Contrôle d'accès
- `requireRole(...roles)` : middleware appliqué **après** `authenticate`, renvoie `403` si le rôle ne fait pas partie de la liste.
- `ProtectedRoute` (frontend) : redirige vers `/login` si non connecté, affiche une page `403` si le rôle est insuffisant.

### 6.3 Durcissement (backend `index.ts`)
- **Helmet** : headers de sécurité + Content-Security-Policy stricte (scripts `self` uniquement, images limitées à Supabase / Picsum, etc.).
- **`x-powered-by` désactivé** (ne révèle pas la stack).
- **Taille des requêtes limitée** à 10 ko (`express.json` / `urlencoded`).
- **`trust proxy`** activé pour lire l'IP réelle derrière nginx.

### 6.4 Rate limiting
| Portée | Limite |
|---|---|
| Global `/api` | 100 req / 15 min / IP |
| `/auth/login` | 5 tentatives / 15 min (échecs uniquement) |
| `/auth/register` | 5 / heure |
| `/auth/reset-password` | 5 / 15 min |
| `/auth/invite` | 10 / heure |
| `/auth/refresh` | 30 / 15 min |

### 6.5 Validation des entrées
- Schémas **Zod** (`validators/schemas.ts`) appliqués via le middleware `validate`.
- Zod **nettoie** (trim, coercion) et **filtre** les champs inconnus avant le contrôleur.
- Règles notables : mot de passe (≥ 8 car., majuscule + chiffre + caractère spécial, max 72), code postal `\d{5}`, URLs photos en `https://`, etc.

### 6.6 Journalisation de sécurité
`securityLogger.ts` trace au format JSON structuré : `LOGIN_SUCCESS/FAILED`, `LOGIN_COMPTE_DESACTIVE`,
`LOGOUT`, `REGISTER_SUCCESS`, `ROLE_CHANGED`, `COMPTE_DESACTIVE`, `BIEN_DELETED`, `INVITE_SENT`,
`UNAUTHORIZED_ACCESS`. Les événements à risque sont remontés en `warn` (exploitables par un SIEM).

---

## 7. Déploiement & environnement

### 7.1 Docker Compose
Deux services sur un réseau bridge `vnet` :
- **backend** : build depuis `./backend`, lit `./backend/.env`, expose le port interne 3000.
- **frontend** : build depuis `./frontend` (nginx), publie le port **80**, dépend du backend.

```bash
docker-compose up --build
```

### 7.2 Images Docker
- **backend** : multi-stage Node 22 Alpine (build TypeScript → image runtime avec `dist/` uniquement).
- **frontend** : multi-stage — build Vite (Node 20 Alpine) → service via `nginx:alpine`.

### 7.3 Reverse proxy nginx
`frontend/nginx.conf` :
- Sert le SPA (`try_files ... /index.html` pour le routing côté client).
- Proxifie `/api/` vers `http://backend:3000` en transmettant `X-Forwarded-For` / `X-Forwarded-Proto`.

### 7.4 Variables d'environnement (backend `.env`)
| Variable | Description |
|---|---|
| `PORT` | Port d'écoute (défaut 3000) |
| `NODE_ENV` | `development` / `production` |
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_ANON_KEY` | Clé publique anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (accès DB, bypass RLS) |
| `CORS_ORIGIN` | Origine(s) autorisée(s) pour CORS |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` est une clé sensible (accès complet à la base) : elle ne doit jamais être exposée côté frontend ni committée.

---

## 8. Installation & démarrage local

### Prérequis
- Node.js (18+ recommandé) et npm
- Un projet Supabase configuré (URL + clés)

### Étapes
```bash
# 1. Installer toutes les dépendances (workspaces frontend + backend)
npm run install:all     # ou : npm install

# 2. Configurer le backend
cp backend/.env.example backend/.env
#   puis renseigner SUPABASE_URL / SUPABASE_*_KEY

# 3. Lancer frontend + backend simultanément
npm run dev
#   - Frontend : http://localhost:5173
#   - Backend  : http://localhost:3000
```

### Scripts utiles (racine)
| Script | Effet |
|---|---|
| `npm run dev` | Lance backend + frontend en parallèle (concurrently) |
| `npm run dev:frontend` | Frontend uniquement (Vite) |
| `npm run dev:backend` | Backend uniquement (nodemon + ts-node) |
| `npm run build` | Build des deux applications |

---

## 9. Points d'attention

Éléments relevés lors de l'analyse, à connaître pour la maintenance :

- **Validation des agences** : `POST`/`PUT /api/agences` n'utilisent pas de schéma Zod (validation manuelle dans le contrôleur), contrairement aux biens et transactions. Harmonisation possible via un `agenceSchema`.
- **`ResetPasswordPage`** appelle `axios.post('/api/auth/reset-password')` en direct, sans passer par le client `http` centralisé (`services/api.ts`). Fonctionnel mais légèrement incohérent avec le reste du frontend.
- **`GET /api/transactions/:id`** existe côté backend mais n'a aucun consommateur frontend.
- **`dockerfile` à la racine** : orphelin — il référence un `server.ts` et le port 3030 qui n'existent pas dans le dépôt. Le déploiement réel s'appuie sur `docker-compose.yml` + les Dockerfiles de `frontend/` et `backend/`.
- **`design-preview.html`** : maquette de design statique autonome, non intégrée au build de l'application.

---

*Fin du document.*
