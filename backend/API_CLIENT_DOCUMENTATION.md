# Documentation API Client - Système Bancaire

Cette documentation décrit toutes les routes disponibles pour les clients du système bancaire, incluant l'authentification et les opérations bancaires.

---

## 📋 Table des matières

1. [Configuration requise](#configuration-requise)
2. [Création d'un client](#création-dun-client)
3. [Authentification client](#authentification-client)
4. [Opérations sur les comptes](#opérations-sur-les-comptes)
5. [Exemples de réponses](#exemples-de-réponses)

---

## 🔧 Configuration requise

### Base de données
Avant de commencer, assurez-vous d'exécuter le script SQL pour ajouter la colonne `password` :

```sql
ALTER TABLE clients ADD COLUMN password VARCHAR(255);
```

### Headers requis pour les requêtes authentifiées
```
Authorization: Bearer <votre_token_jwt>
Content-Type: application/json
```

---

## 👤 Création d'un client

### Endpoint
```
POST /api/clients
```

### Headers
```
Content-Type: application/json
```

### Corps de la requête (JSON)
```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean.dupont@example.com",
  "password": "MotDePasse123!",
  "birth_date": "1990-05-15",
  "gender": "M",
  "address": "123 Rue de la Paix, Paris",
  "phone_number": "+33612345678",
  "nationality": "Française"
}
```

### Champs obligatoires
- ✅ `first_name` (String) - Prénom du client
- ✅ `last_name` (String) - Nom du client
- ✅ `email` (String) - Email unique du client
- ✅ `password` (String) - Mot de passe (sera encodé automatiquement)
- ✅ `birth_date` (Date au format YYYY-MM-DD) - Date de naissance
- ✅ `gender` (String) - Genre (M ou F)
- ✅ `address` (String) - Adresse complète
- ✅ `phone_number` (String) - Numéro de téléphone
- ✅ `nationality` (String) - Nationalité

### Réponses possibles

#### ✅ Succès (201 Created)
```json
{
  "id": 1,
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean.dupont@example.com",
  "birth_date": "1990-05-15",
  "gender": "M",
  "address": "123 Rue de la Paix, Paris",
  "phone_number": "+33612345678",
  "nationality": "Française",
  "created_at": "2024-01-14T10:30:00",
  "updated_at": "2024-01-14T10:30:00"
}
```
**Note:** Le mot de passe n'est pas retourné dans la réponse (sécurité).

#### ❌ Email déjà utilisé (409 Conflict)
```
Statut HTTP: 409
Corps vide
```

#### ❌ Données invalides (400 Bad Request)
```
Statut HTTP: 400
Corps vide
```

---

## 🔐 Authentification client

### 1. Connexion (Login)

#### Endpoint
```
POST /api/client/auth/login
```

#### Headers
```
Content-Type: application/json
```

#### Corps de la requête
```json
{
  "email": "jean.dupont@example.com",
  "password": "MotDePasse123!"
}
```

#### Réponses possibles

##### ✅ Succès (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user_id": 1,
  "email": "jean.dupont@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "message": "Connexion réussie"
}
```

**Détails du token:**
- `access_token`: Token JWT à utiliser pour les requêtes authentifiées
- `token_type`: Toujours "Bearer"
- `expires_in`: Durée de validité en secondes (24h = 86400s)
- `user_id`: ID du client connecté
- `email`, `first_name`, `last_name`: Informations du client

##### ❌ Identifiants incorrects (401 Unauthorized)
```json
{
  "error": "Authentification échouée",
  "message": "Email ou mot de passe incorrect"
}
```

##### ❌ Client sans mot de passe (401 Unauthorized)
```json
{
  "error": "Authentification échouée",
  "message": "Ce client n'a pas de mot de passe configuré"
}
```

##### ❌ Champs manquants (401 Unauthorized)
```json
{
  "error": "Authentification échouée",
  "message": "Email et mot de passe requis"
}
```

---

### 2. Obtenir les informations du client connecté

#### Endpoint
```
GET /api/client/auth/me
```

#### Headers
```
Authorization: Bearer <votre_token>
```

#### Réponses possibles

##### ✅ Succès (200 OK)
```json
{
  "id": 1,
  "email": "jean.dupont@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone_number": "+33612345678",
  "address": "123 Rue de la Paix, Paris",
  "birth_date": "1990-05-15",
  "gender": "M",
  "nationality": "Française"
}
```

##### ❌ Token invalide ou manquant (401 Unauthorized)
```json
{
  "error": "Non autorisé",
  "message": "Token invalide"
}
```

---

## 💰 Opérations sur les comptes

### 1. Voir tous mes comptes

#### Endpoint
```
GET /api/client/accounts
```

#### Headers
```
Authorization: Bearer <votre_token>
```

#### Réponse (200 OK)
```json
[
  {
    "id": 1,
    "account_number": "ACC-001-2024",
    "account_type": "SAVINGS",
    "balance": 5000.00,
    "owner": {
      "id": 1,
      "first_name": "Jean",
      "last_name": "Dupont",
      "email": "jean.dupont@example.com"
    },
    "created_at": "2024-01-14T10:30:00",
    "updated_at": "2024-01-14T10:30:00"
  },
  {
    "id": 2,
    "account_number": "ACC-002-2024",
    "account_type": "CHECKING",
    "balance": 1500.00,
    "owner": {
      "id": 1,
      "first_name": "Jean",
      "last_name": "Dupont",
      "email": "jean.dupont@example.com"
    },
    "created_at": "2024-01-14T11:00:00",
    "updated_at": "2024-01-14T11:00:00"
  }
]
```

---

### 2. Voir un compte spécifique

#### Endpoint
```
GET /api/client/accounts/{accountId}
```

#### Headers
```
Authorization: Bearer <votre_token>
```

#### Exemple
```
GET /api/client/accounts/1
```

#### Réponses possibles

##### ✅ Succès (200 OK)
```json
{
  "id": 1,
  "account_number": "ACC-001-2024",
  "account_type": "SAVINGS",
  "balance": 5000.00,
  "owner": {
    "id": 1,
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean.dupont@example.com"
  },
  "created_at": "2024-01-14T10:30:00",
  "updated_at": "2024-01-14T10:30:00"
}
```

##### ❌ Compte ne vous appartient pas (403 Forbidden)
```json
{
  "error": "Accès refusé",
  "message": "Ce compte ne vous appartient pas"
}
```

##### ❌ Compte non trouvé (401 Unauthorized)
```json
{
  "error": "Non autorisé",
  "message": "Compte non trouvé"
}
```

---

### 3. Effectuer un dépôt

#### Endpoint
```
POST /api/client/accounts/{accountId}/deposit
```

#### Headers
```
Authorization: Bearer <votre_token>
Content-Type: application/json
```

#### Corps de la requête
```json
{
  "amount": 500.00,
  "description": "Dépôt en espèces"
}
```

**Champs:**
- ✅ `amount` (Number, obligatoire) - Montant du dépôt (doit être > 0)
- ❓ `description` (String, optionnel) - Description de la transaction

#### Réponses possibles

##### ✅ Succès (200 OK)
```json
{
  "message": "Dépôt effectué avec succès",
  "transaction": {
    "id": 10,
    "amount": 500.00,
    "transaction_type": "DEPOSIT",
    "transaction_date": "2024-01-14T15:30:00",
    "description": "Dépôt en espèces",
    "source_account": {
      "id": 1,
      "account_number": "ACC-001-2024",
      "balance": 5500.00
    },
    "destination_account": null,
    "created_at": "2024-01-14T15:30:00",
    "updated_at": "2024-01-14T15:30:00"
  }
}
```

##### ❌ Montant invalide (400 Bad Request)
```json
{
  "error": "Montant invalide",
  "message": "Le montant doit être positif"
}
```

##### ❌ Compte ne vous appartient pas (403 Forbidden)
```json
{
  "error": "Accès refusé",
  "message": "Ce compte ne vous appartient pas"
}
```

---

### 4. Effectuer un retrait

#### Endpoint
```
POST /api/client/accounts/{accountId}/withdraw
```

#### Headers
```
Authorization: Bearer <votre_token>
Content-Type: application/json
```

#### Corps de la requête
```json
{
  "amount": 200.00,
  "description": "Retrait DAB"
}
```

**Champs:**
- ✅ `amount` (Number, obligatoire) - Montant du retrait (doit être > 0)
- ❓ `description` (String, optionnel) - Description de la transaction

#### Réponses possibles

##### ✅ Succès (200 OK)
```json
{
  "message": "Retrait effectué avec succès",
  "transaction": {
    "id": 11,
    "amount": 200.00,
    "transaction_type": "WITHDRAWAL",
    "transaction_date": "2024-01-14T16:00:00",
    "description": "Retrait DAB",
    "source_account": {
      "id": 1,
      "account_number": "ACC-001-2024",
      "balance": 5300.00
    },
    "destination_account": null,
    "created_at": "2024-01-14T16:00:00",
    "updated_at": "2024-01-14T16:00:00"
  }
}
```

##### ❌ Solde insuffisant (403 Forbidden)
```json
{
  "error": "Solde insuffisant",
  "message": "Le solde de votre compte est insuffisant"
}
```

##### ❌ Montant invalide (400 Bad Request)
```json
{
  "error": "Montant invalide",
  "message": "Le montant doit être positif"
}
```

---

### 5. Effectuer un virement

#### Endpoint
```
POST /api/client/accounts/{accountId}/transfer
```

#### Headers
```
Authorization: Bearer <votre_token>
Content-Type: application/json
```

#### Corps de la requête
```json
{
  "amount": 300.00,
  "destination_account_number": "ACC-003-2024",
  "description": "Remboursement prêt"
}
```

**Champs:**
- ✅ `amount` (Number, obligatoire) - Montant du virement (doit être > 0)
- ✅ `destination_account_number` (String, obligatoire) - Numéro du compte destinataire
- ❓ `description` (String, optionnel) - Description du virement

#### Réponses possibles

##### ✅ Succès (200 OK)
```json
{
  "message": "Virement effectué avec succès",
  "transaction": {
    "id": 12,
    "amount": 300.00,
    "transaction_type": "TRANSFER",
    "transaction_date": "2024-01-14T16:30:00",
    "description": "Remboursement prêt",
    "source_account": {
      "id": 1,
      "account_number": "ACC-001-2024",
      "balance": 5000.00
    },
    "destination_account": {
      "id": 3,
      "account_number": "ACC-003-2024",
      "balance": 2300.00
    },
    "created_at": "2024-01-14T16:30:00",
    "updated_at": "2024-01-14T16:30:00"
  }
}
```

##### ❌ Solde insuffisant (403 Forbidden)
```json
{
  "error": "Solde insuffisant",
  "message": "Le solde de votre compte est insuffisant"
}
```

##### ❌ Compte destination non trouvé (401 Unauthorized)
```json
{
  "error": "Non autorisé",
  "message": "Compte destination non trouvé"
}
```

##### ❌ Numéro de compte manquant (400 Bad Request)
```json
{
  "error": "Compte destination manquant",
  "message": "Le numéro de compte destination est requis"
}
```

---

### 6. Voir l'historique des transactions d'un compte

#### Endpoint
```
GET /api/client/accounts/{accountId}/transactions
```

#### Headers
```
Authorization: Bearer <votre_token>
```

#### Exemple
```
GET /api/client/accounts/1/transactions
```

#### Réponse (200 OK)
```json
[
  {
    "id": 10,
    "amount": 500.00,
    "transaction_type": "DEPOSIT",
    "transaction_date": "2024-01-14T15:30:00",
    "description": "Dépôt en espèces",
    "source_account": {
      "id": 1,
      "account_number": "ACC-001-2024"
    },
    "destination_account": null
  },
  {
    "id": 11,
    "amount": 200.00,
    "transaction_type": "WITHDRAWAL",
    "transaction_date": "2024-01-14T16:00:00",
    "description": "Retrait DAB",
    "source_account": {
      "id": 1,
      "account_number": "ACC-001-2024"
    },
    "destination_account": null
  },
  {
    "id": 12,
    "amount": 300.00,
    "transaction_type": "TRANSFER",
    "transaction_date": "2024-01-14T16:30:00",
    "description": "Remboursement prêt",
    "source_account": {
      "id": 1,
      "account_number": "ACC-001-2024"
    },
    "destination_account": {
      "id": 3,
      "account_number": "ACC-003-2024"
    }
  }
]
```

---

### 7. Obtenir un relevé bancaire (entre deux dates)

#### Endpoint
```
GET /api/client/accounts/{accountId}/statement
```

#### Headers
```
Authorization: Bearer <votre_token>
```

#### Paramètres de requête (Query params)
- ❓ `startDate` (String, optionnel) - Date de début au format `YYYY-MM-DD` (par défaut: il y a 1 mois)
- ❓ `endDate` (String, optionnel) - Date de fin au format `YYYY-MM-DD` (par défaut: aujourd'hui)

#### Exemples
```
GET /api/client/accounts/1/statement
GET /api/client/accounts/1/statement?startDate=2024-01-01&endDate=2024-01-31
GET /api/client/accounts/1/statement?startDate=2024-01-01
```

#### Réponse (200 OK)
```json
{
  "account": {
    "id": 1,
    "account_number": "ACC-001-2024",
    "account_type": "SAVINGS",
    "balance": 5000.00,
    "owner": {
      "id": 1,
      "first_name": "Jean",
      "last_name": "Dupont",
      "email": "jean.dupont@example.com"
    }
  },
  "start_date": "2024-01-01T00:00:00",
  "end_date": "2024-01-31T23:59:59",
  "transactions": [
    {
      "id": 10,
      "amount": 500.00,
      "transaction_type": "DEPOSIT",
      "transaction_date": "2024-01-14T15:30:00",
      "description": "Dépôt en espèces",
      "source_account": {
        "id": 1,
        "account_number": "ACC-001-2024"
      },
      "destination_account": null
    },
    {
      "id": 11,
      "amount": 200.00,
      "transaction_type": "WITHDRAWAL",
      "transaction_date": "2024-01-14T16:00:00",
      "description": "Retrait DAB",
      "source_account": {
        "id": 1,
        "account_number": "ACC-001-2024"
      },
      "destination_account": null
    }
  ],
  "current_balance": 5000.00
}
```

---

## 📝 Exemples complets avec cURL

### Créer un client
```bash
curl -X POST http://localhost:8080/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean.dupont@example.com",
    "password": "MotDePasse123!",
    "birth_date": "1990-05-15",
    "gender": "M",
    "address": "123 Rue de la Paix, Paris",
    "phone_number": "+33612345678",
    "nationality": "Française"
  }'
```

### Se connecter
```bash
curl -X POST http://localhost:8080/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "MotDePasse123!"
  }'
```

### Voir mes comptes
```bash
curl -X GET http://localhost:8080/api/client/accounts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Effectuer un dépôt
```bash
curl -X POST http://localhost:8080/api/client/accounts/1/deposit \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500.00,
    "description": "Dépôt en espèces"
  }'
```

### Effectuer un virement
```bash
curl -X POST http://localhost:8080/api/client/accounts/1/transfer \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 300.00,
    "destination_account_number": "ACC-003-2024",
    "description": "Remboursement prêt"
  }'
```

### Obtenir un relevé
```bash
curl -X GET "http://localhost:8080/api/client/accounts/1/statement?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔒 Sécurité

### Protection des routes
Toutes les routes sous `/api/client/accounts` et `/api/client/auth/me` nécessitent un token JWT valide dans le header `Authorization`.

### Format du token
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Durée de validité
- Token d'accès : **24 heures** (86400 secondes)
- Après expiration, le client doit se reconnecter

### Vérifications automatiques
- ✅ Le client ne peut accéder qu'à **ses propres comptes**
- ✅ Vérification du solde avant retrait/virement
- ✅ Mot de passe encodé avec BCrypt
- ✅ Token JWT signé et vérifié

---

## 📊 Codes de statut HTTP

| Code | Signification | Utilisation |
|------|---------------|-------------|
| 200 | OK | Opération réussie |
| 201 | Created | Client créé avec succès |
| 400 | Bad Request | Données invalides ou manquantes |
| 401 | Unauthorized | Authentification échouée ou token invalide |
| 403 | Forbidden | Accès refusé (ex: solde insuffisant, compte ne vous appartient pas) |
| 409 | Conflict | Email déjà utilisé |
| 500 | Internal Server Error | Erreur serveur |

---

## 🎯 Récapitulatif des routes

### Authentification
| Méthode | Route | Description | Auth requise |
|---------|-------|-------------|--------------|
| POST | `/api/clients` | Créer un client | ❌ |
| POST | `/api/client/auth/login` | Se connecter | ❌ |
| GET | `/api/client/auth/me` | Mes informations | ✅ |

### Opérations bancaires
| Méthode | Route | Description | Auth requise |
|---------|-------|-------------|--------------|
| GET | `/api/client/accounts` | Tous mes comptes | ✅ |
| GET | `/api/client/accounts/{id}` | Un compte spécifique | ✅ |
| POST | `/api/client/accounts/{id}/deposit` | Dépôt | ✅ |
| POST | `/api/client/accounts/{id}/withdraw` | Retrait | ✅ |
| POST | `/api/client/accounts/{id}/transfer` | Virement | ✅ |
| GET | `/api/client/accounts/{id}/transactions` | Historique | ✅ |
| GET | `/api/client/accounts/{id}/statement` | Relevé bancaire | ✅ |

---

## 💡 Notes importantes

1. **Première connexion**: Vous devez d'abord créer un client via `/api/clients` (route admin ou publique selon votre configuration)

2. **Mot de passe**: 
   - Stocké de manière sécurisée (BCrypt)
   - Jamais retourné dans les réponses JSON
   - Minimum recommandé: 8 caractères avec chiffres et caractères spéciaux

3. **Token JWT**: 
   - À conserver côté client (localStorage, sessionStorage, cookies)
   - À envoyer dans chaque requête authentifiée
   - Contient l'ID du client et le type d'utilisateur

4. **Gestion d'erreurs**:
   - Toujours vérifier le code HTTP de la réponse
   - Les erreurs retournent un objet JSON avec `error` et `message`

5. **Dates**:
   - Format ISO 8601: `YYYY-MM-DD` pour les paramètres
   - Format complet dans les réponses: `YYYY-MM-DDTHH:mm:ss`

---

**Version:** 1.0  
**Date:** 14 Janvier 2024  
**Auteur:** KOGON Mawunygan Maxime