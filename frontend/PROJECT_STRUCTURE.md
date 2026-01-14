# 📁 Structure du Projet - Authentification Client

## 🌳 Arborescence Complète

```
frontend/
│
├── 📄 CLIENT_AUTH_README.md              ← Documentation complète (NOUVEAU)
├── 📄 CLIENT_LOGIN_SUMMARY.md            ← Résumé des changements (NOUVEAU)
├── 📄 QUICK_START_CLIENT.md              ← Guide de démarrage rapide (NOUVEAU)
├── 📄 PROJECT_STRUCTURE.md               ← Ce fichier (NOUVEAU)
│
├── src/
│   ├── app/
│   │   │
│   │   ├── 👤 client-login/              ← NOUVEAU - Login Client
│   │   │   ├── client-login.component.ts
│   │   │   ├── client-login.component.html
│   │   │   └── client-login.component.css
│   │   │
│   │   ├── 📝 client-register/           ← NOUVEAU - Inscription Client
│   │   │   ├── client-register.component.ts
│   │   │   ├── client-register.component.html
│   │   │   └── client-register.component.css
│   │   │
│   │   ├── 📊 client-dashboard/          ← Dashboard Client (amélioré)
│   │   │   ├── layout/
│   │   │   │   └── client-layout.component.ts
│   │   │   │
│   │   │   ├── sidebar/
│   │   │   │   └── client-sidebar.component.ts    ← MODIFIÉ
│   │   │   │
│   │   │   ├── my-accounts/
│   │   │   │   └── my-accounts.component.ts       ← MODIFIÉ
│   │   │   │
│   │   │   ├── operations/
│   │   │   │   └── client-operations.component.ts
│   │   │   │
│   │   │   └── history/
│   │   │       └── client-history.component.ts
│   │   │
│   │   ├── 🔧 dashboard/                 ← Dashboard Admin (existant)
│   │   │   ├── clients-list/
│   │   │   ├── clients-create/
│   │   │   ├── accounts-list/
│   │   │   ├── accounts-create/
│   │   │   ├── deposit/
│   │   │   ├── withdrawal/
│   │   │   ├── transfer/
│   │   │   └── transactions/
│   │   │
│   │   ├── 🏠 landing-page/              ← Page d'accueil (modifiée)
│   │   │   ├── landing-page.component.ts
│   │   │   └── landing-page.component.html    ← MODIFIÉ
│   │   │
│   │   ├── 🔐 login/                     ← Login Admin (existant)
│   │   │   ├── login.component.ts
│   │   │   └── login.component.html
│   │   │
│   │   ├── app.routes.ts                 ← MODIFIÉ (routes client ajoutées)
│   │   └── app.config.ts                 ← MODIFIÉ (intercepteur ajouté)
│   │
│   └── security/core/
│       │
│       ├── services/
│       │   ├── auth.service.ts           ← Admin (existant)
│       │   ├── client-auth.service.ts    ← NOUVEAU - Client
│       │   └── bank.service.ts
│       │
│       ├── guards/
│       │   ├── auth.guard.ts             ← Admin (existant)
│       │   └── client-auth.guard.ts      ← NOUVEAU - Client
│       │
│       └── interceptors/
│           ├── jwt.interceptor.ts        ← Admin (existant)
│           └── client-auth.interceptor.ts ← NOUVEAU - Client
│
├── package.json
├── angular.json
└── tsconfig.json
```

---

## 🎯 Vue d'ensemble des Modules

### 1️⃣ Authentification Admin (Existant)

```
┌─────────────────────────────────────────┐
│         🔧 ESPACE ADMIN                 │
├─────────────────────────────────────────┤
│                                         │
│  Route:    /login                       │
│  Service:  AuthService                  │
│  Guard:    authGuard                    │
│  Token:    auth_token                   │
│                                         │
│  Dashboard: /dashboard                  │
│  ├─ Clients                             │
│  ├─ Comptes                             │
│  ├─ Opérations                          │
│  └─ Transactions                        │
│                                         │
└─────────────────────────────────────────┘
```

### 2️⃣ Authentification Client (NOUVEAU)

```
┌─────────────────────────────────────────┐
│         👤 ESPACE CLIENT                │
├─────────────────────────────────────────┤
│                                         │
│  Login:     /client/login               │
│  Register:  /client/register            │
│  Service:   ClientAuthService           │
│  Guard:     clientAuthGuard             │
│  Token:     client_auth_token           │
│                                         │
│  Dashboard: /client/dashboard           │
│  ├─ Mes Comptes                         │
│  ├─ Opérations                          │
│  └─ Historique                          │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔄 Flux d'Authentification Client

```
┌─────────────┐
│  Landing    │  http://localhost:4200
│    Page     │
└──────┬──────┘
       │
       ├─────► "Espace Admin" ────────────► /login
       │
       └─────► "Espace Client" ──────┬───► /client/login
                                      │
                                      └───► /client/register
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Inscription  │
                                       │ (3 étapes)   │
                                       └──────┬───────┘
                                              │
                                              ▼
                                       POST /api/clients
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │   Connexion  │
                                       └──────┬───────┘
                                              │
                                              ▼
                                 POST /api/client/auth/login
                                              │
                                              ▼
                                      ┌───────────────┐
                                      │  JWT Token    │
                                      │  (localStorage)│
                                      └───────┬───────┘
                                              │
                                              ▼
                                      ┌───────────────┐
                                      │   Dashboard   │
                                      │    Client     │
                                      └───────────────┘
```

---

## 🗂️ Séparation Admin / Client

### Storage (localStorage)

| Admin | Client |
|-------|--------|
| `auth_token` | `client_auth_token` |
| `auth_user_id` | `client_user_id` |
| `auth_email` | `client_email` |
| `auth_token_expires_at` | `client_token_expires_at` |
| - | `client_first_name` |
| - | `client_last_name` |

### Routes

| Type | Admin | Client |
|------|-------|--------|
| Login | `/login` | `/client/login` |
| Register | ❌ | `/client/register` |
| Dashboard | `/dashboard` | `/client/dashboard` |
| Protection | `authGuard` | `clientAuthGuard` |

### Services

```
AuthService (Admin)              ClientAuthService (Client)
├─ login()                       ├─ login()
├─ logout()                      ├─ register()         ← NOUVEAU
├─ getToken()                    ├─ logout()
├─ getUserId()                   ├─ getToken()
└─ isLoggedIn()                  ├─ getUserId()
                                 ├─ getUserEmail()
                                 ├─ getUserFullName()  ← NOUVEAU
                                 ├─ getCurrentClient() ← NOUVEAU
                                 └─ isLoggedIn()
```

---

## 📊 Diagramme des Composants Client

```
┌────────────────────────────────────────────────────────┐
│                  Client Application                    │
└────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐    ┌──────▼──────┐   ┌────▼────┐
    │ Login   │    │  Register   │   │Dashboard│
    │Component│    │  Component  │   │ Layout  │
    └────┬────┘    └──────┬──────┘   └────┬────┘
         │                │                │
         │                │                │
         └────────┬───────┴────────┬───────┘
                  │                │
         ┌────────▼────────┐  ┌────▼─────────┐
         │ ClientAuth      │  │  HTTP        │
         │   Service       │  │Interceptor   │
         └────────┬────────┘  └────┬─────────┘
                  │                │
                  └────────┬───────┘
                           │
                    ┌──────▼──────┐
                    │   Backend   │
                    │     API     │
                    └─────────────┘
```

---

## 🎨 Composants UI

### ClientLoginComponent

```
┌──────────────────────────────────────┐
│  🔐  Espace Client                   │
├──────────────────────────────────────┤
│                                      │
│  📧 Email: [___________________]     │
│                                      │
│  🔒 Mot de passe: [___________]      │
│                                      │
│  [ Se connecter ]                    │
│                                      │
│  Pas de compte ? → Inscrivez-vous    │
│  Admin ? → Connexion admin           │
│                                      │
└──────────────────────────────────────┘
```

### ClientRegisterComponent

```
┌──────────────────────────────────────┐
│  📝  Créer un compte client          │
├──────────────────────────────────────┤
│                                      │
│  Progress: ●━━━━○━━━━○               │
│           [1] [2] [3]                │
│                                      │
│  ┌─ Étape 1: Infos personnelles ─┐  │
│  │ Prénom: [_____________]        │  │
│  │ Nom: [_____________]           │  │
│  │ Date naissance: [__________]   │  │
│  │ Genre: [M] [F]                 │  │
│  │ Nationalité: [_____________]   │  │
│  └────────────────────────────────┘  │
│                                      │
│  [ Précédent ]  [ Suivant → ]        │
│                                      │
│  Déjà un compte ? → Connectez-vous   │
│                                      │
└──────────────────────────────────────┘
```

### ClientDashboard - MyAccountsComponent

```
┌──────────────────────────────────────────────────────┐
│  📊  Bonjour, Marie                                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 💳 Total │  │ 💰 Solde │  │ ⭐ Compte│          │
│  │   2      │  │ 17,500€  │  │ COURANT  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                      │
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ 💳 COURANT         │  │ 💰 EPARGNE         │    │
│  │ FR76...890123      │  │ FR76...210987      │    │
│  │                    │  │                    │    │
│  │ 2,500.50 FCFA      │  │ 15,000.00 FCFA     │    │
│  │                    │  │                    │    │
│  │ [Détails]          │  │ [Détails]          │    │
│  └────────────────────┘  └────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔐 Sécurité - Flux des Tokens

```
1. LOGIN
   ┌─────────┐  email/password   ┌─────────┐
   │ Client  │ ────────────────► │ Backend │
   │ Login   │                   │   API   │
   └────┬────┘                   └────┬────┘
        │                             │
        │      JWT Token (24h)        │
        │ ◄───────────────────────────┘
        │
        ▼
   localStorage.setItem('client_auth_token', token)
   localStorage.setItem('client_user_id', userId)
   ...


2. API CALLS
   ┌─────────┐   GET /api/accounts/...   ┌─────────┐
   │Dashboard│ ───────────────────────►  │ Backend │
   │Component│                            │   API   │
   └────┬────┘                            └────┬────┘
        │                                      │
        ▼                                      │
   ┌──────────────┐                           │
   │ Interceptor  │  Add: Authorization:      │
   │  (auto)      │  Bearer <token>           │
   └──────┬───────┘  ─────────────────────────┘
          │
          ▼
   ┌──────────────┐
   │   Response   │
   └──────────────┘


3. LOGOUT
   ┌─────────┐   Click Déconnexion   ┌──────────────┐
   │Sidebar  │ ─────────────────────► │ClientAuth    │
   │Component│                        │   Service    │
   └─────────┘                        └──────┬───────┘
                                             │
                                             ▼
                            localStorage.clear()
                            router.navigate('/client/login')
```

---

## 📡 API Endpoints

### Client Authentication

```http
POST   /api/clients                     # Inscription
POST   /api/client/auth/login           # Connexion
GET    /api/client/auth/me              # Info client
GET    /api/accounts/client/{id}        # Comptes client
```

### Admin (existant)

```http
POST   /api/auth/login                  # Admin login
GET    /api/clients                     # Liste clients
POST   /api/clients                     # Créer client
GET    /api/accounts                    # Liste comptes
POST   /api/accounts                    # Créer compte
...
```

---

## 🎨 Design System

### Couleurs

| Usage | Classe Tailwind | Hex |
|-------|----------------|-----|
| Primaire | `indigo-600` | #4F46E5 |
| Succès | `green-500` | #10B981 |
| Erreur | `red-500` | #EF4444 |
| Warning | `yellow-500` | #F59E0B |
| Info | `blue-500` | #3B82F6 |

### Types de Comptes

| Type | Couleur | Badge |
|------|---------|-------|
| COURANT | Blue | `bg-blue-50 text-blue-600` |
| EPARGNE | Green | `bg-green-50 text-green-600` |
| ENTREPRISE | Purple | `bg-purple-50 text-purple-600` |

---

## ✅ Checklist de Validation

### Fonctionnel
- [x] Inscription client fonctionne
- [x] Connexion client fonctionne
- [x] Dashboard client s'affiche
- [x] Comptes client sont chargés
- [x] Statistiques sont calculées
- [x] Navigation fonctionne
- [x] Déconnexion fonctionne
- [x] Guards protègent les routes

### Sécurité
- [x] Tokens séparés (admin/client)
- [x] Guards distincts
- [x] Intercepteurs séparés
- [x] Validation des formulaires
- [x] Auto-logout à expiration

### UI/UX
- [x] Design moderne
- [x] Responsive (mobile/tablet/desktop)
- [x] Animations fluides
- [x] Messages d'erreur clairs
- [x] Loading states
- [x] Empty states

---

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| `CLIENT_AUTH_README.md` | Documentation technique complète |
| `CLIENT_LOGIN_SUMMARY.md` | Résumé des changements |
| `QUICK_START_CLIENT.md` | Guide de démarrage rapide |
| `PROJECT_STRUCTURE.md` | Ce fichier (structure visuelle) |

---

**© 2024 E-Bank Système - Tous droits réservés**