# 📝 Changelog - Authentification Client

## Version 1.0 - 14 Janvier 2024

### 🎯 Objectif
Implémenter un système d'authentification complet pour les clients permettant :
- ✅ Connexion sécurisée des clients
- ✅ Accès à leurs propres informations
- ✅ Opérations bancaires (dépôt, retrait, virement)
- ✅ Consultation de l'historique des transactions
- ✅ Génération de relevés bancaires

---

## 🆕 Nouveaux fichiers créés

### 1. Services
- **`ClientUserDetailsService.java`**
  - Service Spring Security pour charger les détails des clients
  - Implémente `UserDetailsService` pour l'authentification
  - Recherche les clients par email

- **`ClientAuthService.java`**
  - Service d'authentification pour les clients
  - Méthodes : `loginClient()`, `getCurrentClient()`, `extractClientIdFromToken()`
  - Génération de tokens JWT spécifiques aux clients
  - Validation des credentials

### 2. Contrôleurs
- **`ClientAuthController.java`**
  - Route : `POST /api/client/auth/login` - Connexion client
  - Route : `GET /api/client/auth/me` - Informations du client connecté
  - Gestion des erreurs d'authentification

- **`ClientOperationsController.java`**
  - Route : `GET /api/client/accounts` - Liste des comptes
  - Route : `GET /api/client/accounts/{id}` - Détails d'un compte
  - Route : `POST /api/client/accounts/{id}/deposit` - Dépôt
  - Route : `POST /api/client/accounts/{id}/withdraw` - Retrait
  - Route : `POST /api/client/accounts/{id}/transfer` - Virement
  - Route : `GET /api/client/accounts/{id}/transactions` - Historique
  - Route : `GET /api/client/accounts/{id}/statement` - Relevé bancaire

### 3. Documentation
- **`API_CLIENT_DOCUMENTATION.md`** - Documentation complète de l'API (822 lignes)
- **`QUICKSTART_CLIENT.md`** - Guide de démarrage rapide
- **`Postman_Client_API_Collection.json`** - Collection Postman pour tests
- **`CHANGELOG_CLIENT_AUTH.md`** - Ce fichier

### 4. Migration base de données
- **`add_password_to_clients.sql`**
  - Script SQL pour ajouter la colonne `password` à la table `clients`

---

## 🔧 Fichiers modifiés

### 1. **`Client.java`** (Entité)
**Changements :**
```java
// Ajout du champ password
@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
@Column(name = "password")
private String password;
```
- Annotation `@JsonProperty(access = WRITE_ONLY)` pour masquer le mot de passe dans les réponses

### 2. **`JwtUtil.java`** (Utilitaire)
**Changements :**
```java
// Nouvelle méthode pour générer des tokens pour les clients
public String generateTokenForClient(Client client) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("id", client.getId());
    claims.put("userType", "CLIENT");
    claims.put("userId", client.getId());
    
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(client.getEmail())
        // ...
}
```
- Ajout de `generateTokenForClient()` pour créer des JWT pour les clients
- Ajout du claim `userType` avec valeur "CLIENT" ou "ADMIN"
- Utilisation de l'email comme subject pour les clients

### 3. **`ClientsService.java`** (Service)
**Changements :**
```java
// Injection du PasswordEncoder
@Autowired
private final PasswordEncoder passwordEncoder;

// Dans createClient()
if (client.getPassword() != null && !client.getPassword().isEmpty()) {
    client.setPassword(passwordEncoder.encode(client.getPassword()));
}

// Dans updateClient()
if (clientDetails.getPassword() != null && !clientDetails.getPassword().isEmpty()) {
    client.setPassword(passwordEncoder.encode(clientDetails.getPassword()));
}
```
- Encodage automatique du mot de passe avec BCrypt lors de la création
- Encodage lors de la mise à jour si un nouveau mot de passe est fourni

### 4. **`pom.xml`**
**Changements :**
```xml
<java.version>17</java.version>
```
- Correction de la version Java de 25 à 17 (compatibilité)

### 5. **`application.properties`**
**Changements :**
- Conversion de l'encodage de ISO-8859-1 vers UTF-8
- Aucune modification fonctionnelle

---

## 🔐 Fonctionnalités de sécurité

### Authentification
- ✅ Mot de passe encodé avec BCrypt (impossible à décoder)
- ✅ Tokens JWT signés avec clé secrète (HS256)
- ✅ Durée de validité : 24 heures
- ✅ Claim `userType` pour distinguer CLIENT/ADMIN

### Autorisation
- ✅ Vérification du token sur toutes les routes `/api/client/*`
- ✅ Vérification que le compte appartient au client connecté
- ✅ Extraction de l'ID client depuis le token JWT
- ✅ Protection contre l'accès aux comptes d'autres clients

### Validations métier
- ✅ Vérification du solde avant retrait/virement
- ✅ Montants positifs uniquement
- ✅ Compte destination existant pour les virements
- ✅ Vérification de propriété du compte source

---

## 📊 Structure de l'API

### Routes publiques (sans authentification)
```
POST /api/clients              → Créer un client
POST /api/client/auth/login    → Se connecter
```

### Routes protégées (authentification requise)
```
GET  /api/client/auth/me                          → Mes informations
GET  /api/client/accounts                         → Mes comptes
GET  /api/client/accounts/{id}                    → Un compte
POST /api/client/accounts/{id}/deposit            → Dépôt
POST /api/client/accounts/{id}/withdraw           → Retrait
POST /api/client/accounts/{id}/transfer           → Virement
GET  /api/client/accounts/{id}/transactions       → Historique
GET  /api/client/accounts/{id}/statement          → Relevé
```

---

## 🎨 Format des réponses

### Succès - Login (200)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user_id": 1,
  "email": "client@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "message": "Connexion réussie"
}
```

### Erreur - Authentification (401)
```json
{
  "error": "Authentification échouée",
  "message": "Email ou mot de passe incorrect"
}
```

### Erreur - Accès refusé (403)
```json
{
  "error": "Accès refusé",
  "message": "Ce compte ne vous appartient pas"
}
```

### Succès - Opération (200)
```json
{
  "message": "Dépôt effectué avec succès",
  "transaction": {
    "id": 10,
    "amount": 500.00,
    "transaction_type": "DEPOSIT",
    "transaction_date": "2024-01-14T15:30:00",
    "source_account": {
      "balance": 5500.00
    }
  }
}
```

---

## 🗄️ Modifications base de données

### Nouvelle colonne
```sql
ALTER TABLE clients ADD COLUMN password VARCHAR(255);
```

### Structure Client complète
```
clients
├── id (PK)
├── first_name
├── last_name
├── email (UNIQUE)
├── password (NOUVEAU - encodé BCrypt)
├── birth_date
├── gender
├── address
├── phone_number
├── nationality
├── created_at
└── updated_at
```

---

## 🔄 Flux d'authentification

### 1. Création du client
```
Client → POST /api/clients avec password
       → Service encode le password avec BCrypt
       → Sauvegarde en base de données
       → Retourne client (sans password)
```

### 2. Connexion
```
Client → POST /api/client/auth/login
       → Service vérifie email + password
       → Génère token JWT avec claims (id, userType=CLIENT)
       → Retourne token + infos client
```

### 3. Opération protégée
```
Client → GET /api/client/accounts
       → Header Authorization: Bearer <token>
       → Service extrait userId du token
       → Vérifie que userType = CLIENT
       → Filtre les comptes du client
       → Retourne uniquement ses comptes
```

---

## 📋 Checklist d'implémentation

- [x] Ajouter colonne `password` à l'entité Client
- [x] Créer ClientUserDetailsService
- [x] Créer ClientAuthService
- [x] Créer ClientAuthController
- [x] Créer ClientOperationsController
- [x] Modifier JwtUtil pour supporter les clients
- [x] Modifier ClientsService pour encoder les mots de passe
- [x] Créer script SQL de migration
- [x] Documenter l'API complète
- [x] Créer guide de démarrage rapide
- [x] Créer collection Postman
- [x] Tester toutes les routes
- [x] Vérifier la sécurité

---

## 🧪 Tests recommandés

### Tests fonctionnels
1. ✅ Création d'un client avec mot de passe
2. ✅ Login avec credentials corrects
3. ✅ Login avec email incorrect (401)
4. ✅ Login avec password incorrect (401)
5. ✅ Accès à mes comptes avec token valide
6. ✅ Dépôt sur mon compte
7. ✅ Retrait avec solde suffisant
8. ✅ Retrait avec solde insuffisant (403)
9. ✅ Virement vers compte existant
10. ✅ Virement vers compte inexistant (401)

### Tests de sécurité
1. ✅ Accès sans token (401)
2. ✅ Accès avec token invalide (401)
3. ✅ Accès au compte d'un autre client (403)
4. ✅ Opération sur compte d'un autre (403)
5. ✅ Token expiré (401)
6. ✅ Password non retourné dans les réponses

---

## 🚀 Déploiement

### Prérequis
1. Exécuter le script SQL de migration
2. Redémarrer l'application Spring Boot
3. Vérifier que les routes répondent

### Configuration
```properties
# Dans application.properties
jwt.secret=VotreCleSecrete256Bits
jwt.expiration=86400000  # 24h
```

---

## 📈 Améliorations futures possibles

- [ ] Refresh token pour renouveler automatiquement
- [ ] Limitation du nombre de tentatives de connexion
- [ ] Double authentification (2FA)
- [ ] Historique des connexions
- [ ] Notification par email lors de connexion
- [ ] Réinitialisation du mot de passe par email
- [ ] Changement de mot de passe
- [ ] Sessions actives et déconnexion
- [ ] Rate limiting sur les endpoints

---

## 👥 Auteur
**KOGON Mawunygan Maxime**

## 📅 Date
14 Janvier 2024

## 📄 Licence
Projet académique - TP JEE GLSIA