# 🚀 Guide de Démarrage Rapide - Authentification Client

Ce guide vous permet de commencer rapidement à utiliser l'API d'authentification client.

---

## 📋 Prérequis

1. **Base de données** : Exécutez ce script SQL une seule fois
```sql
ALTER TABLE clients ADD COLUMN password VARCHAR(255);
```

2. **Serveur** : Démarrez votre application Spring Boot
```bash
./mvnw spring-boot:run
```

---

## 🎯 Étapes rapides

### 1️⃣ Créer un client

**Endpoint:** `POST /api/clients`

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

**Réponse (201):**
```json
{
  "id": 1,
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean.dupont@example.com",
  ...
}
```

---

### 2️⃣ Se connecter

**Endpoint:** `POST /api/client/auth/login`

```json
{
  "email": "jean.dupont@example.com",
  "password": "MotDePasse123!"
}
```

**Réponse (200):**
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

**⚠️ Important:** Copiez le `access_token` pour les prochaines requêtes !

---

### 3️⃣ Voir mes comptes

**Endpoint:** `GET /api/client/accounts`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse (200):**
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
      "last_name": "Dupont"
    }
  }
]
```

---

### 4️⃣ Effectuer un dépôt

**Endpoint:** `POST /api/client/accounts/1/deposit`

**Headers:**
```
Authorization: Bearer <votre_token>
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 500.00,
  "description": "Dépôt en espèces"
}
```

**Réponse (200):**
```json
{
  "message": "Dépôt effectué avec succès",
  "transaction": {
    "id": 10,
    "amount": 500.00,
    "transaction_type": "DEPOSIT",
    "source_account": {
      "balance": 5500.00
    }
  }
}
```

---

### 5️⃣ Effectuer un retrait

**Endpoint:** `POST /api/client/accounts/1/withdraw`

**Headers:**
```
Authorization: Bearer <votre_token>
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 200.00,
  "description": "Retrait DAB"
}
```

---

### 6️⃣ Effectuer un virement

**Endpoint:** `POST /api/client/accounts/1/transfer`

**Headers:**
```
Authorization: Bearer <votre_token>
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 300.00,
  "destination_account_number": "ACC-002-2024",
  "description": "Remboursement"
}
```

---

### 7️⃣ Voir l'historique

**Endpoint:** `GET /api/client/accounts/1/transactions`

**Headers:**
```
Authorization: Bearer <votre_token>
```

---

### 8️⃣ Générer un relevé bancaire

**Endpoint:** `GET /api/client/accounts/1/statement?startDate=2024-01-01&endDate=2024-01-31`

**Headers:**
```
Authorization: Bearer <votre_token>
```

**Réponse:**
```json
{
  "account": { ... },
  "start_date": "2024-01-01T00:00:00",
  "end_date": "2024-01-31T23:59:59",
  "transactions": [ ... ],
  "current_balance": 5000.00
}
```

---

## 📚 Toutes les routes disponibles

| Route | Méthode | Description | Auth |
|-------|---------|-------------|------|
| `/api/clients` | POST | Créer un client | ❌ |
| `/api/client/auth/login` | POST | Se connecter | ❌ |
| `/api/client/auth/me` | GET | Mes infos | ✅ |
| `/api/client/accounts` | GET | Mes comptes | ✅ |
| `/api/client/accounts/{id}` | GET | Un compte | ✅ |
| `/api/client/accounts/{id}/deposit` | POST | Dépôt | ✅ |
| `/api/client/accounts/{id}/withdraw` | POST | Retrait | ✅ |
| `/api/client/accounts/{id}/transfer` | POST | Virement | ✅ |
| `/api/client/accounts/{id}/transactions` | GET | Historique | ✅ |
| `/api/client/accounts/{id}/statement` | GET | Relevé | ✅ |

---

## 🔒 Sécurité

- ✅ Les mots de passe sont encodés avec BCrypt
- ✅ Les tokens JWT expirent après 24h
- ✅ Un client ne peut accéder qu'à ses propres comptes
- ✅ Vérification du solde avant retrait/virement

---

## ⚠️ Codes d'erreur courants

| Code | Signification | Solution |
|------|---------------|----------|
| 401 | Non autorisé | Vérifier le token / Se reconnecter |
| 403 | Accès refusé | Vérifier que le compte vous appartient / Solde suffisant |
| 400 | Requête invalide | Vérifier les champs obligatoires |
| 409 | Conflit | Email déjà utilisé |

---

## 🧪 Tester avec cURL

### Login
```bash
curl -X POST http://localhost:8080/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jean.dupont@example.com","password":"MotDePasse123!"}'
```

### Voir mes comptes
```bash
curl -X GET http://localhost:8080/api/client/accounts \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### Dépôt
```bash
curl -X POST http://localhost:8080/api/client/accounts/1/deposit \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":500,"description":"Dépôt"}'
```

---

## 📖 Documentation complète

Consultez `API_CLIENT_DOCUMENTATION.md` pour :
- Toutes les réponses détaillées
- Gestion d'erreurs complète
- Exemples avec Postman
- Tests de sécurité

---

## 🎉 Félicitations !

Vous êtes maintenant prêt à utiliser l'API Client !

**Besoin d'aide ?** Consultez la documentation complète dans `API_CLIENT_DOCUMENTATION.md`
