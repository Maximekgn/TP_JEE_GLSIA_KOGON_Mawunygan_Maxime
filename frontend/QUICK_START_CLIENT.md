# 🚀 Guide de Démarrage Rapide - Authentification Client

## 📌 Vue d'ensemble rapide

Votre application dispose maintenant de **DEUX systèmes d'authentification séparés** :

1. **🔧 Espace Admin** - Pour les administrateurs de la banque
2. **👤 Espace Client** - Pour les clients de la banque (NOUVEAU !)

---

## ⚡ Démarrage en 5 minutes

### 1️⃣ Démarrer l'application

```bash
cd frontend
npm install
npm start
```

L'application sera disponible sur : **http://localhost:4200**

### 2️⃣ Accéder aux différents espaces

| Espace | URL | Description |
|--------|-----|-------------|
| 🏠 Accueil | http://localhost:4200 | Page d'accueil avec choix Admin/Client |
| 👤 Login Client | http://localhost:4200/client/login | Connexion client |
| 📝 Inscription Client | http://localhost:4200/client/register | Créer un compte client |
| 📊 Dashboard Client | http://localhost:4200/client/dashboard | Interface client (protégé) |
| 🔧 Login Admin | http://localhost:4200/login | Connexion admin |
| 🎛️ Dashboard Admin | http://localhost:4200/dashboard | Interface admin (protégé) |

---

## 👤 Créer et utiliser un compte client

### Étape 1 : Inscription

1. Allez sur http://localhost:4200
2. Cliquez sur **"Espace Client"**
3. Cliquez sur **"Inscrivez-vous"**
4. Remplissez le formulaire en 3 étapes :

#### 📝 Étape 1 - Informations personnelles
```
Prénom : Marie
Nom : Dubois
Date de naissance : 15/03/1995
Genre : Féminin
Nationalité : Française
```

#### 📧 Étape 2 - Contact
```
Email : marie.dubois@example.com
Téléphone : +33698765432
Adresse : 45 Avenue des Champs-Élysées, 75008 Paris
```

#### 🔒 Étape 3 - Sécurité
```
Mot de passe : MotDePasse123!
Confirmer : MotDePasse123!
```

5. Cliquez sur **"Créer mon compte"**
6. Vous serez redirigé vers la page de connexion

### Étape 2 : Connexion

1. Sur la page de connexion client (http://localhost:4200/client/login)
2. Entrez vos identifiants :
   - **Email** : marie.dubois@example.com
   - **Mot de passe** : MotDePasse123!
3. Cliquez sur **"Se connecter"**
4. Vous accédez au dashboard client ! 🎉

### Étape 3 : Explorer le Dashboard

Une fois connecté, vous pouvez :

- ✅ **Voir vos comptes** bancaires
- ✅ **Consulter votre solde total**
- ✅ **Effectuer des opérations** (menu Opérations)
- ✅ **Consulter l'historique** de vos transactions
- ✅ **Vous déconnecter** via le bouton en bas de la sidebar

---

## 🔧 Configuration Backend Requise

### Base de données

Exécutez ce script SQL si ce n'est pas déjà fait :

```sql
ALTER TABLE clients ADD COLUMN password VARCHAR(255);
```

### Endpoints API nécessaires

Votre backend DOIT implémenter ces endpoints :

#### 1. Inscription client
```http
POST /api/clients
Content-Type: application/json

Body: {
  "first_name": "Marie",
  "last_name": "Dubois",
  "email": "marie@example.com",
  "password": "MotDePasse123!",
  "birth_date": "1995-03-15",
  "gender": "F",
  "address": "45 Avenue...",
  "phone_number": "+33698765432",
  "nationality": "Française"
}

Réponse: 201 Created
```

#### 2. Connexion client
```http
POST /api/client/auth/login
Content-Type: application/json

Body: {
  "email": "marie@example.com",
  "password": "MotDePasse123!"
}

Réponse: 200 OK
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

#### 3. Informations du client
```http
GET /api/client/auth/me
Authorization: Bearer <token>

Réponse: 200 OK
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

#### 4. Comptes du client
```http
GET /api/accounts/client/{clientId}
Authorization: Bearer <token>

Réponse: 200 OK
[
  {
    "id": 1,
    "accountNumber": "FR7612345678901234567890123",
    "accountType": "COURANT",
    "balance": 2500.50,
    "createdAt": "2024-01-10T08:00:00",
    "clientId": 2
  }
]
```

---

## 🎯 Test Rapide

### Scénario complet en 2 minutes

```bash
# 1. Lancer l'application
npm start

# 2. Ouvrir le navigateur
# → http://localhost:4200

# 3. Cliquer sur "Espace Client"
# → Vous êtes sur /client/login

# 4. Cliquer sur "Inscrivez-vous"
# → Vous êtes sur /client/register

# 5. Créer un compte test
# → Remplir les 3 étapes du formulaire

# 6. Se connecter avec ce compte
# → Email + mot de passe

# 7. Explorer le dashboard
# → Voir les comptes, naviguer dans le menu

# 8. Se déconnecter
# → Cliquer sur "Déconnexion"

✅ Test réussi !
```

---

## 🔍 Vérification des Fonctionnalités

### ✅ Checklist de vérification

- [ ] L'application démarre sans erreur (`npm start`)
- [ ] La page d'accueil affiche deux boutons : "Espace Admin" et "Espace Client"
- [ ] Le formulaire d'inscription s'affiche avec 3 étapes
- [ ] La barre de progression fonctionne entre les étapes
- [ ] La validation des champs fonctionne (email, téléphone, etc.)
- [ ] L'inscription crée bien le client en base de données
- [ ] La connexion fonctionne avec email + mot de passe
- [ ] Le token JWT est stocké dans localStorage (clé: `client_auth_token`)
- [ ] Le dashboard affiche le nom du client dans la sidebar
- [ ] Les comptes du client s'affichent correctement
- [ ] Les statistiques sont calculées (total comptes, solde)
- [ ] La navigation fonctionne (Mes Comptes, Opérations, Historique)
- [ ] La déconnexion fonctionne et redirige vers `/client/login`
- [ ] Impossible d'accéder au dashboard sans être connecté

---

## 🐛 Dépannage

### Problème : "Cannot GET /api/client/auth/login"

**Solution :** Vérifiez que votre backend est démarré et que l'endpoint existe.

### Problème : "409 Conflict" lors de l'inscription

**Solution :** Un client avec cet email existe déjà. Utilisez un autre email.

### Problème : "401 Unauthorized" à la connexion

**Solutions possibles :**
- Vérifiez l'email et le mot de passe
- Vérifiez que le client a bien un mot de passe en base de données
- Vérifiez que le mot de passe est correctement hashé dans le backend

### Problème : Le dashboard ne charge pas les comptes

**Solution :** 
- Vérifiez que l'endpoint `/api/accounts/client/{id}` existe
- Vérifiez que le token est bien envoyé (F12 → Network → Headers)
- Vérifiez que le client a des comptes associés

### Problème : Redirection infinie

**Solution :**
- Supprimez le localStorage : `localStorage.clear()`
- Rechargez la page
- Reconnectez-vous

---

## 📱 Responsive Design

L'interface s'adapte automatiquement :

- 📱 **Mobile** (< 640px) : Layout simplifié, sidebar mobile
- 💻 **Tablette** (640px - 1024px) : Layout intermédiaire
- 🖥️ **Desktop** (> 1024px) : Layout complet avec sidebar fixe

Testez avec les DevTools : F12 → Toggle device toolbar

---

## 🎨 Personnalisation

### Changer les couleurs principales

Éditez le fichier du composant et remplacez :
- `indigo` → votre couleur (blue, purple, green, etc.)
- Exemple : `bg-indigo-600` → `bg-blue-600`

### Changer le logo

Éditez `landing-page.component.html` et modifiez le SVG dans le header.

### Changer le nom de la banque

Cherchez et remplacez "E-Bank Système" par votre nom.

---

## 📚 Documentation Complète

Pour une documentation détaillée, consultez :

📖 **CLIENT_AUTH_README.md** - Documentation complète avec :
- Architecture détaillée
- Référence des services
- Référence des composants
- Exemples de code
- Bonnes pratiques de sécurité
- API Backend complète

📝 **CLIENT_LOGIN_SUMMARY.md** - Résumé des changements avec :
- Liste de tous les fichiers créés/modifiés
- Comparaison Admin vs Client
- Tests à effectuer
- Checklist de validation

---

## 💡 Conseils

### Pour le développement

1. Utilisez les **DevTools** (F12) pour déboguer
2. Consultez l'onglet **Network** pour voir les requêtes API
3. Consultez l'onglet **Console** pour voir les logs
4. Consultez l'onglet **Application** → Storage → Local Storage pour voir les tokens

### Pour la production

1. ⚠️ **N'oubliez pas** de configurer HTTPS
2. ⚠️ **Implémentez** un rate limiting côté backend
3. ⚠️ **Hashage des mots de passe** avec BCrypt (backend)
4. ⚠️ **Validez toutes les données** côté backend
5. ⚠️ **Utilisez des tokens sécurisés** avec expiration courte

---

## ✨ Prochaines étapes suggérées

1. 🔄 Implémenter la réinitialisation du mot de passe
2. 📧 Ajouter la vérification email (double opt-in)
3. 🔐 Ajouter l'authentification à deux facteurs (2FA)
4. 📱 Ajouter des notifications push
5. 📊 Ajouter des graphiques sur le dashboard
6. 💾 Télécharger des relevés PDF
7. 💬 Chat support en direct
8. 🌙 Implémenter le mode sombre
9. 🌍 Ajouter le multilingue (i18n)

---

## 🎉 Félicitations !

Votre système d'authentification client est maintenant opérationnel ! 

Les clients peuvent s'inscrire, se connecter et accéder à leur espace personnel de manière sécurisée.

**Bon développement ! 🚀**

---

**© 2024 E-Bank Système - Tous droits réservés**