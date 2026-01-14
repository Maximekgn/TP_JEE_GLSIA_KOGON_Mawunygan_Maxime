# 🔐 Système d'Authentification Client - Documentation

Cette documentation décrit le système d'authentification pour les clients de la banque, distinct du système d'authentification admin.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Routes disponibles](#routes-disponibles)
4. [Utilisation](#utilisation)
5. [Services et Guards](#services-et-guards)
6. [Composants](#composants)
7. [Configuration Backend requise](#configuration-backend-requise)

---

## 🎯 Vue d'ensemble

Le système d'authentification client permet aux clients de la banque de :
- ✅ **S'inscrire** avec leurs informations personnelles
- ✅ **Se connecter** avec email et mot de passe
- ✅ **Accéder à leur dashboard** personnel
- ✅ **Consulter leurs comptes** bancaires
- ✅ **Effectuer des opérations** bancaires
- ✅ **Voir l'historique** de leurs transactions

Le système est **complètement séparé** du système admin pour des raisons de sécurité.

---

## 🏗️ Architecture

### Séparation Admin / Client

```
├── Admin
│   ├── /login (Admin)
│   ├── /dashboard (Admin Dashboard)
│   └── AuthService + authGuard
│
└── Client
    ├── /client/login (Client Login)
    ├── /client/register (Client Register)
    ├── /client/dashboard (Client Dashboard)
    └── ClientAuthService + clientAuthGuard
```

### Stockage des tokens

Les tokens sont stockés séparément dans le localStorage :

**Admin:**
- `auth_token`
- `auth_user_id`
- `auth_email`
- `auth_token_expires_at`

**Client:**
- `client_auth_token`
- `client_user_id`
- `client_email`
- `client_first_name`
- `client_last_name`
- `client_token_expires_at`

---

## 🚀 Routes disponibles

### Routes publiques

| Route | Description | Composant |
|-------|-------------|-----------|
| `/` | Page d'accueil | LandingPageComponent |
| `/client/login` | Connexion client | ClientLoginComponent |
| `/client/register` | Inscription client | ClientRegisterComponent |
| `/login` | Connexion admin | LoginComponent |

### Routes protégées (Client)

| Route | Description | Guard | Composant |
|-------|-------------|-------|-----------|
| `/client/dashboard` | Dashboard principal | clientAuthGuard | MyAccountsComponent |
| `/client/dashboard/operations` | Opérations bancaires | clientAuthGuard | ClientOperationsComponent |
| `/client/dashboard/history` | Historique des transactions | clientAuthGuard | ClientHistoryComponent |

---

## 💻 Utilisation

### 1. Inscription d'un nouveau client

**URL:** `http://localhost:4200/client/register`

**Formulaire en 3 étapes:**

#### Étape 1 : Informations personnelles
- Prénom (min. 2 caractères)
- Nom (min. 2 caractères)
- Date de naissance (18 ans minimum)
- Genre (M/F)
- Nationalité

#### Étape 2 : Informations de contact
- Email (format valide)
- Numéro de téléphone (format: +33612345678 ou 0612345678)
- Adresse complète (min. 10 caractères)

#### Étape 3 : Sécurité
- Mot de passe (min. 6 caractères)
- Confirmation du mot de passe

**Exemple de données:**
```json
{
  "first_name": "Marie",
  "last_name": "Dubois",
  "email": "marie.dubois@example.com",
  "password": "MotDePasse123!",
  "birth_date": "1995-03-15",
  "gender": "F",
  "address": "45 Avenue des Champs-Élysées, 75008 Paris",
  "phone_number": "+33698765432",
  "nationality": "Française"
}
```

### 2. Connexion client

**URL:** `http://localhost:4200/client/login`

**Champs requis:**
- Email
- Mot de passe

**Après connexion réussie:**
- Token JWT stocké dans localStorage
- Redirection vers `/client/dashboard`
- Accès aux comptes et opérations du client

### 3. Dashboard client

**URL:** `http://localhost:4200/client/dashboard`

**Fonctionnalités:**
- Vue d'ensemble des comptes
- Solde total
- Nombre de comptes
- Compte principal
- Carte pour chaque compte avec détails

---

## 🔧 Services et Guards

### ClientAuthService

Localisation: `frontend/src/security/core/services/client-auth.service.ts`

**Méthodes principales:**

```typescript
// Inscription
register(clientData: ClientRegisterData): Observable<any>

// Connexion
login(credentials: { email: string; password: string }): Observable<ClientAuthResponse>

// Récupérer les infos du client connecté
getCurrentClient(): Observable<ClientInfo>

// Déconnexion
logout(): void

// Vérifier si connecté
isLoggedIn(): boolean

// Récupérer le token
getToken(): string | null

// Récupérer l'ID du client
getUserId(): number | null

// Récupérer le nom complet
getUserFullName(): string
```

**Exemple d'utilisation:**

```typescript
import { ClientAuthService } from '../../security/core/services/client-auth.service';

constructor(private clientAuthService: ClientAuthService) {}

login() {
  this.clientAuthService.login({
    email: 'marie@example.com',
    password: 'password123'
  }).subscribe({
    next: (response) => {
      console.log('Connecté:', response);
      // Redirection automatique vers /client/dashboard
    },
    error: (err) => {
      console.error('Erreur:', err.message);
    }
  });
}
```

### clientAuthGuard

Localisation: `frontend/src/security/core/guards/client-auth.guard.ts`

Protège les routes client. Si non authentifié, redirige vers `/client/login`.

**Utilisation dans les routes:**

```typescript
{
  path: 'client/dashboard',
  canActivate: [clientAuthGuard],
  loadComponent: () => import('./client-dashboard/...'),
}
```

### clientAuthInterceptor

Localisation: `frontend/src/security/core/interceptors/client-auth.interceptor.ts`

Ajoute automatiquement le header `Authorization: Bearer <token>` aux requêtes API client.

**Requêtes concernées:**
- `/api/client/*`
- `/api/accounts/*`

---

## 🎨 Composants

### ClientLoginComponent

**Chemin:** `frontend/src/app/client-login/`

**Fonctionnalités:**
- Formulaire de connexion avec validation
- Gestion des erreurs
- Messages de succès
- Liens vers inscription et admin
- Design moderne avec Tailwind CSS

### ClientRegisterComponent

**Chemin:** `frontend/src/app/client-register/`

**Fonctionnalités:**
- Formulaire multi-étapes (3 étapes)
- Barre de progression visuelle
- Validation complète des champs
- Vérification de correspondance des mots de passe
- Animations fluides entre les étapes

### ClientLayoutComponent

**Chemin:** `frontend/src/app/client-dashboard/layout/`

**Fonctionnalités:**
- Layout principal du dashboard client
- Sidebar de navigation
- Zone de contenu principale
- Responsive design

### ClientSidebarComponent

**Chemin:** `frontend/src/app/client-dashboard/sidebar/`

**Fonctionnalités:**
- Navigation entre les pages
- Affichage du profil client
- Bouton de déconnexion
- Avatar généré dynamiquement
- Design moderne et élégant

### MyAccountsComponent

**Chemin:** `frontend/src/app/client-dashboard/my-accounts/`

**Fonctionnalités:**
- Liste des comptes du client
- Cartes de statistiques (total comptes, solde total, compte principal)
- Carte détaillée par compte avec couleurs selon le type
- Gestion des états (loading, error, empty)
- Actions rapides sur chaque compte

---

## ⚙️ Configuration Backend requise

### 1. Base de données

Assurez-vous que la colonne `password` existe dans la table `clients`:

```sql
ALTER TABLE clients ADD COLUMN password VARCHAR(255);
```

### 2. Endpoints API requis

#### Créer un client (inscription)
```
POST /api/clients
Content-Type: application/json

{
  "first_name": "Marie",
  "last_name": "Dubois",
  "email": "marie@example.com",
  "password": "password123",
  "birth_date": "1995-03-15",
  "gender": "F",
  "address": "45 Avenue...",
  "phone_number": "+33698765432",
  "nationality": "Française"
}
```

**Réponse (201):**
```json
{
  "id": 2,
  "first_name": "Marie",
  "last_name": "Dubois",
  "email": "marie@example.com",
  "birth_date": "1995-03-15",
  "gender": "F",
  "address": "45 Avenue...",
  "phone_number": "+33698765432",
  "nationality": "Française",
  "created_at": "2024-01-14T10:30:00",
  "updated_at": "2024-01-14T10:30:00"
}
```

#### Connexion client
```
POST /api/client/auth/login
Content-Type: application/json

{
  "email": "marie@example.com",
  "password": "password123"
}
```

**Réponse (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user_id": 2,
  "email": "marie@example.com",
  "first_name": "Marie",
  "last_name": "Dubois",
  "message": "Connexion réussie"
}
```

#### Informations du client connecté
```
GET /api/client/auth/me
Authorization: Bearer <token>
```

**Réponse (200):**
```json
{
  "id": 2,
  "email": "marie@example.com",
  "first_name": "Marie",
  "last_name": "Dubois",
  "phone_number": "+33698765432",
  "address": "45 Avenue...",
  "birth_date": "1995-03-15",
  "gender": "F",
  "nationality": "Française"
}
```

#### Comptes du client
```
GET /api/accounts/client/{clientId}
Authorization: Bearer <token>
```

**Réponse (200):**
```json
[
  {
    "id": 1,
    "accountNumber": "FR7612345678901234567890123",
    "accountType": "COURANT",
    "balance": 2500.50,
    "createdAt": "2024-01-10T08:00:00",
    "clientId": 2
  },
  {
    "id": 2,
    "accountNumber": "FR7698765432109876543210987",
    "accountType": "EPARGNE",
    "balance": 15000.00,
    "createdAt": "2024-01-11T09:30:00",
    "clientId": 2
  }
]
```

---

## 🎨 Thème et Design

### Couleurs principales

| Utilisation | Couleur | Tailwind Class |
|-------------|---------|----------------|
| Primaire | Indigo | `bg-indigo-600` |
| Succès | Vert | `bg-green-500` |
| Erreur | Rouge | `bg-red-500` |
| Compte Courant | Bleu | `bg-blue-50` / `text-blue-600` |
| Compte Épargne | Vert | `bg-green-50` / `text-green-600` |
| Compte Entreprise | Violet | `bg-purple-50` / `text-purple-600` |

### Icônes

Le projet utilise **Heroicons** via SVG inline pour tous les icônes.

---

## 🔒 Sécurité

### Bonnes pratiques implémentées

1. ✅ **Tokens séparés** pour admin et client
2. ✅ **Guards distincts** pour protéger les routes
3. ✅ **Intercepteurs HTTP** pour ajouter automatiquement le token
4. ✅ **Expiration automatique** des tokens (24h)
5. ✅ **Auto-logout** quand le token expire
6. ✅ **Validation des formulaires** côté client
7. ✅ **Mots de passe hashés** côté backend (BCrypt recommandé)
8. ✅ **Messages d'erreur** génériques pour éviter les fuites d'information

### Points d'attention

⚠️ **Ne jamais stocker** les mots de passe en clair
⚠️ **Toujours valider** les données côté backend
⚠️ **Utiliser HTTPS** en production
⚠️ **Implémenter un rate limiting** pour éviter les attaques par force brute

---

## 🧪 Tests

### Scénario de test complet

1. **Inscription**
   - Aller sur `/client/register`
   - Remplir les 3 étapes du formulaire
   - Vérifier la création du compte

2. **Connexion**
   - Aller sur `/client/login`
   - Se connecter avec l'email et le mot de passe
   - Vérifier la redirection vers `/client/dashboard`

3. **Dashboard**
   - Vérifier l'affichage du nom du client
   - Vérifier l'affichage des comptes
   - Vérifier les statistiques (total comptes, solde)

4. **Déconnexion**
   - Cliquer sur le bouton de déconnexion
   - Vérifier la redirection vers `/client/login`
   - Vérifier que l'accès au dashboard est bloqué

---

## 📱 Responsive Design

Tous les composants sont **100% responsive** :

- ✅ Mobile (< 640px)
- ✅ Tablette (640px - 1024px)
- ✅ Desktop (> 1024px)

**Breakpoints Tailwind utilisés:**
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

---

## 🚀 Démarrage rapide

### 1. Backend

Assurez-vous que le backend est démarré avec les endpoints requis.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

L'application sera accessible sur `http://localhost:4200`

### 3. Test rapide

1. Aller sur `http://localhost:4200`
2. Cliquer sur "Espace Client"
3. Cliquer sur "Inscrivez-vous"
4. Créer un compte test
5. Se connecter avec ce compte
6. Explorer le dashboard

---

## 📞 Support

Pour toute question ou problème :

- 📧 Vérifier la console du navigateur pour les erreurs
- 🔍 Vérifier les logs du backend
- 📝 Consulter la documentation de l'API backend
- 🐛 Créer une issue avec les détails de l'erreur

---

## ✨ Améliorations futures possibles

- [ ] Réinitialisation du mot de passe
- [ ] Vérification email (double opt-in)
- [ ] Authentification à deux facteurs (2FA)
- [ ] Notifications en temps réel
- [ ] Téléchargement de relevés PDF
- [ ] Chat support en direct
- [ ] Mode sombre
- [ ] Multilingue (i18n)

---

**© 2024 E-Bank Système - Tous droits réservés**