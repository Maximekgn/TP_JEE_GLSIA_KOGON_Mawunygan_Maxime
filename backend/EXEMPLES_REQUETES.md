# 📬 Exemples de Requêtes HTTP - API Client

Ce fichier contient des exemples prêts à l'emploi pour tester l'API d'authentification client.

---

## 🔗 Base URL
```
http://localhost:8080
```

---

## 1️⃣ CRÉATION D'UN CLIENT

### Exemple 1 - Client basique
```http
POST /api/clients HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean.dupont@example.com",
  "password": "MotDePasse123!",
  "birth_date": "1990-05-15",
  "gender": "M",
  "address": "123 Rue de la Paix, 75001 Paris",
  "phone_number": "+33612345678",
  "nationality": "Française"
}
```

### Exemple 2 - Cliente
```http
POST /api/clients HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "first_name": "Marie",
  "last_name": "Martin",
  "email": "marie.martin@example.com",
  "password": "SecurePass456!",
  "birth_date": "1985-08-20",
  "gender": "F",
  "address": "456 Avenue des Champs, 69001 Lyon",
  "phone_number": "+33687654321",
  "nationality": "Française"
}
```

### Exemple 3 - Client étranger
```http
POST /api/clients HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@example.com",
  "password": "MyPassword789!",
  "birth_date": "1988-03-12",
  "gender": "M",
  "address": "10 Downing Street, London",
  "phone_number": "+447911123456",
  "nationality": "Britannique"
}
```

---

## 2️⃣ AUTHENTIFICATION

### Connexion - Succès
```http
POST /api/client/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "email": "jean.dupont@example.com",
  "password": "MotDePasse123!"
}
```

**Réponse attendue (200) :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlclR5cGUiOiJDTElFTlQiLCJ1c2VySWQiOjEsInN1YiI6ImplYW4uZHVwb250QGV4YW1wbGUuY29tIiwiaWF0IjoxNzA1MjI4ODAwLCJleHAiOjE3MDUzMTUyMDB9.abc123",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user_id": 1,
  "email": "jean.dupont@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "message": "Connexion réussie"
}
```

### Connexion - Email incorrect
```http
POST /api/client/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "email": "inconnu@example.com",
  "password": "MotDePasse123!"
}
```

**Réponse attendue (401) :**
```json
{
  "error": "Authentification échouée",
  "message": "Email ou mot de passe incorrect"
}
```

### Mes informations
```http
GET /api/client/auth/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse attendue (200) :**
```json
{
  "id": 1,
  "email": "jean.dupont@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone_number": "+33612345678",
  "address": "123 Rue de la Paix, 75001 Paris",
  "birth_date": "1990-05-15",
  "gender": "M",
  "nationality": "Française"
}
```

---

## 3️⃣ CONSULTATION DES COMPTES

### Liste de tous mes comptes
```http
GET /api/client/accounts HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse attendue (200) :**
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

### Détails d'un compte spécifique
```http
GET /api/client/accounts/1 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 4️⃣ OPÉRATIONS - DÉPÔTS

### Dépôt avec description
```http
POST /api/client/accounts/1/deposit HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 500.00,
  "description": "Dépôt en espèces"
}
```

### Dépôt sans description
```http
POST /api/client/accounts/1/deposit HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 1000.00
}
```

### Dépôt important
```http
POST /api/client/accounts/1/deposit HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 10000.00,
  "description": "Dépôt chèque salaire"
}
```

**Réponse attendue (200) :**
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

---

## 5️⃣ OPÉRATIONS - RETRAITS

### Retrait DAB
```http
POST /api/client/accounts/1/withdraw HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 200.00,
  "description": "Retrait DAB"
}
```

### Retrait guichet
```http
POST /api/client/accounts/1/withdraw HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 500.00,
  "description": "Retrait guichet agence"
}
```

### Retrait important
```http
POST /api/client/accounts/1/withdraw HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 2000.00,
  "description": "Retrait pour achat voiture"
}
```

**Réponse succès (200) :**
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
    "destination_account": null
  }
}
```

**Réponse erreur - Solde insuffisant (403) :**
```json
{
  "error": "Solde insuffisant",
  "message": "Le solde de votre compte est insuffisant"
}
```

---

## 6️⃣ OPÉRATIONS - VIREMENTS

### Virement simple
```http
POST /api/client/accounts/1/transfer HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 300.00,
  "destination_account_number": "ACC-002-2024",
  "description": "Virement interne"
}
```

### Virement remboursement
```http
POST /api/client/accounts/1/transfer HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 150.00,
  "destination_account_number": "ACC-003-2024",
  "description": "Remboursement prêt ami"
}
```

### Virement loyer
```http
POST /api/client/accounts/1/transfer HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 800.00,
  "destination_account_number": "ACC-PROPRIO-001",
  "description": "Loyer janvier 2024"
}
```

### Virement facture
```http
POST /api/client/accounts/1/transfer HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 125.50,
  "destination_account_number": "ACC-EDF-001",
  "description": "Facture électricité"
}
```

**Réponse succès (200) :**
```json
{
  "message": "Virement effectué avec succès",
  "transaction": {
    "id": 12,
    "amount": 300.00,
    "transaction_type": "TRANSFER",
    "transaction_date": "2024-01-14T16:30:00",
    "description": "Virement interne",
    "source_account": {
      "id": 1,
      "account_number": "ACC-001-2024",
      "balance": 5000.00
    },
    "destination_account": {
      "id": 2,
      "account_number": "ACC-002-2024",
      "balance": 1800.00
    }
  }
}
```

---

## 7️⃣ HISTORIQUE DES TRANSACTIONS

### Toutes les transactions d'un compte
```http
GET /api/client/accounts/1/transactions HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse (200) :**
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
    "description": "Virement interne",
    "source_account": {
      "id": 1,
      "account_number": "ACC-001-2024"
    },
    "destination_account": {
      "id": 2,
      "account_number": "ACC-002-2024"
    }
  }
]
```

---

## 8️⃣ RELEVÉS BANCAIRES

### Relevé du dernier mois (par défaut)
```http
GET /api/client/accounts/1/statement HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Relevé janvier 2024
```http
GET /api/client/accounts/1/statement?startDate=2024-01-01&endDate=2024-01-31 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Relevé depuis le début de l'année
```http
GET /api/client/accounts/1/statement?startDate=2024-01-01 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Relevé dernier trimestre
```http
GET /api/client/accounts/1/statement?startDate=2023-10-01&endDate=2023-12-31 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse (200) :**
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
      "description": "Dépôt en espèces"
    },
    {
      "id": 11,
      "amount": 200.00,
      "transaction_type": "WITHDRAWAL",
      "transaction_date": "2024-01-14T16:00:00",
      "description": "Retrait DAB"
    }
  ],
  "current_balance": 5000.00
}
```

---

## 9️⃣ TESTS DE SÉCURITÉ

### Accès sans token (doit échouer - 401)
```http
GET /api/client/accounts HTTP/1.1
Host: localhost:8080
```

### Token invalide (doit échouer - 401)
```http
GET /api/client/accounts HTTP/1.1
Host: localhost:8080
Authorization: Bearer token_invalide_xyz123
```

### Accès au compte d'un autre client (doit échouer - 403)
```http
GET /api/client/accounts/999 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <token_client_1>
```

### Dépôt sur le compte d'un autre (doit échouer - 403)
```http
POST /api/client/accounts/999/deposit HTTP/1.1
Host: localhost:8080
Authorization: Bearer <token_client_1>
Content-Type: application/json

{
  "amount": 100.00,
  "description": "Test sécurité"
}
```

---

## 🧪 SCÉNARIOS DE TEST COMPLETS

### Scénario 1 : Nouveau client - Premier dépôt
```
1. POST /api/clients → Créer le client
2. POST /api/client/auth/login → Se connecter
3. GET /api/client/accounts → Voir ses comptes
4. POST /api/client/accounts/{id}/deposit → Premier dépôt
5. GET /api/client/accounts/{id}/transactions → Vérifier l'historique
```

### Scénario 2 : Virement entre deux clients
```
1. POST /api/clients → Créer client A
2. POST /api/clients → Créer client B
3. POST /api/client/auth/login → Connecter client A
4. POST /api/client/accounts/{idA}/deposit → Approvisionner compte A
5. POST /api/client/accounts/{idA}/transfer → Virer vers compte B
6. POST /api/client/auth/login → Connecter client B
7. GET /api/client/accounts → Vérifier réception du virement
```

### Scénario 3 : Relevé mensuel
```
1. POST /api/client/auth/login → Se connecter
2. POST /api/client/accounts/{id}/deposit → Plusieurs dépôts
3. POST /api/client/accounts/{id}/withdraw → Plusieurs retraits
4. POST /api/client/accounts/{id}/transfer → Quelques virements
5. GET /api/client/accounts/{id}/statement?startDate=2024-01-01&endDate=2024-01-31
```

---

## 💡 CONSEILS

### Variables à remplacer
- `{id}` → ID du compte (ex: 1, 2, 3...)
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` → Votre token JWT réel
- `ACC-002-2024` → Numéro de compte réel

### Ordre recommandé pour les tests
1. ✅ Créer plusieurs clients
2. ✅ Se connecter avec chaque client
3. ✅ Vérifier les comptes de chaque client
4. ✅ Effectuer des dépôts
5. ✅ Effectuer des retraits
6. ✅ Effectuer des virements entre comptes
7. ✅ Consulter l'historique
8. ✅ Générer des relevés

### Tools recommandés
- **Postman** : Importer `Postman_Client_API_Collection.json`
- **Insomnia** : Créer une collection avec ces exemples
- **cURL** : Copier-coller les commandes
- **HTTPie** : Alternative moderne à cURL

---

**Version:** 1.0  
**Auteur:** KOGON Mawunygan Maxime  
**Date:** 14 Janvier 2024