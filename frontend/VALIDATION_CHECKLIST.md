# ✅ Checklist de Validation - Système d'Authentification Client

> **Utilisez cette checklist pour valider que tout fonctionne correctement**

---

## 📋 Validation de l'Installation

### Frontend

- [ ] Le frontend démarre sans erreur : `npm start`
- [ ] Aucune erreur dans la console du navigateur (F12)
- [ ] Tous les fichiers TypeScript compilent correctement
- [ ] Aucun warning critique dans le terminal

### Backend

- [ ] Le backend est démarré
- [ ] La base de données est accessible
- [ ] La colonne `password` existe dans la table `clients`
- [ ] Les endpoints API sont disponibles

---

## 🔐 Validation de l'Authentification

### Inscription Client

- [ ] La page `/client/register` s'affiche correctement
- [ ] Le formulaire affiche 3 étapes distinctes
- [ ] La barre de progression fonctionne
- [ ] La validation des champs fonctionne :
  - [ ] Email (format valide)
  - [ ] Téléphone (format international)
  - [ ] Date de naissance (18 ans minimum)
  - [ ] Mot de passe (minimum 6 caractères)
  - [ ] Confirmation de mot de passe (correspondance)
- [ ] Le bouton "Suivant" est désactivé si le formulaire est invalide
- [ ] Le bouton "Précédent" fonctionne
- [ ] La soumission appelle `POST /api/clients`
- [ ] Un message de succès s'affiche après inscription
- [ ] Redirection vers `/client/login` après succès
- [ ] Message d'erreur en cas d'email déjà utilisé (409)

### Connexion Client

- [ ] La page `/client/login` s'affiche correctement
- [ ] Le formulaire de connexion fonctionne
- [ ] La validation email fonctionne
- [ ] La validation mot de passe fonctionne
- [ ] La soumission appelle `POST /api/client/auth/login`
- [ ] Le token JWT est reçu et stocké dans localStorage
- [ ] Redirection vers `/client/dashboard` après connexion
- [ ] Message d'erreur en cas d'identifiants incorrects (401)
- [ ] Le lien "Inscrivez-vous" fonctionne
- [ ] Le lien "Connexion admin" fonctionne

---

## 📊 Validation du Dashboard

### Layout et Navigation

- [ ] Le layout s'affiche correctement
- [ ] La sidebar est visible à gauche
- [ ] Le logo et le nom de la banque s'affichent
- [ ] Le menu de navigation fonctionne :
  - [ ] "Mes Comptes" → `/client/dashboard`
  - [ ] "Opérations" → `/client/dashboard/operations`
  - [ ] "Historique" → `/client/dashboard/history`
- [ ] L'état actif du menu est visible
- [ ] Le profil client s'affiche dans la sidebar :
  - [ ] Avatar généré avec les initiales
  - [ ] Nom complet du client
  - [ ] Email du client
- [ ] Le bouton "Déconnexion" fonctionne
- [ ] La zone de contenu principal est responsive

### Page "Mes Comptes"

- [ ] Le titre affiche le prénom du client
- [ ] Les 3 cartes de statistiques s'affichent :
  - [ ] Total des comptes (nombre)
  - [ ] Solde total (somme)
  - [ ] Type de compte principal
- [ ] L'état "Loading" s'affiche pendant le chargement
- [ ] Les comptes sont chargés via `GET /api/accounts/client/{id}`
- [ ] Les cartes de comptes s'affichent correctement
- [ ] Les couleurs varient selon le type de compte :
  - [ ] COURANT → Bleu
  - [ ] EPARGNE → Vert
  - [ ] ENTREPRISE → Violet
- [ ] Le solde est formaté correctement (2 décimales)
- [ ] Le numéro de compte s'affiche
- [ ] La date de création s'affiche
- [ ] L'effet hover fonctionne sur les cartes
- [ ] L'état "Empty" s'affiche si aucun compte
- [ ] L'état "Error" s'affiche en cas d'erreur
- [ ] Le bouton "Réessayer" fonctionne

---

## 🔒 Validation de la Sécurité

### Protection des Routes

- [ ] Impossible d'accéder à `/client/dashboard` sans être connecté
- [ ] Redirection vers `/client/login` si non authentifié
- [ ] Le guard `clientAuthGuard` fonctionne
- [ ] Impossible d'accéder aux sous-routes sans authentification :
  - [ ] `/client/dashboard/operations`
  - [ ] `/client/dashboard/history`

### Tokens et Sessions

- [ ] Le token est stocké dans `localStorage.client_auth_token`
- [ ] L'ID utilisateur est stocké dans `localStorage.client_user_id`
- [ ] L'email est stocké dans `localStorage.client_email`
- [ ] Le prénom est stocké dans `localStorage.client_first_name`
- [ ] Le nom est stocké dans `localStorage.client_last_name`
- [ ] La date d'expiration est stockée dans `localStorage.client_token_expires_at`
- [ ] Le token est envoyé automatiquement aux requêtes API
- [ ] Le header `Authorization: Bearer <token>` est présent
- [ ] La déconnexion supprime tous les tokens
- [ ] L'auto-logout fonctionne à l'expiration du token

### Séparation Admin/Client

- [ ] Les tokens admin et client sont séparés
- [ ] Le token admin n'est pas utilisé pour les routes client
- [ ] Le token client n'est pas utilisé pour les routes admin
- [ ] Les deux systèmes peuvent coexister sans conflit
- [ ] Possible de se connecter en tant qu'admin ET client simultanément

---

## 🎨 Validation UI/UX

### Design et Apparence

- [ ] Le design est moderne et professionnel
- [ ] Les couleurs sont cohérentes (indigo comme couleur principale)
- [ ] Les icônes s'affichent correctement
- [ ] Les fonts sont lisibles
- [ ] Les espacements sont corrects
- [ ] Les ombres (shadows) sont visibles
- [ ] Les bordures (borders) sont visibles
- [ ] Les animations sont fluides

### Responsive Design

- [ ] Mobile (< 640px) :
  - [ ] La sidebar est adaptée
  - [ ] Les cartes sont empilées verticalement
  - [ ] Le texte est lisible
  - [ ] Les boutons sont cliquables
- [ ] Tablette (640px - 1024px) :
  - [ ] Les cartes sont en 2 colonnes
  - [ ] La sidebar reste visible
- [ ] Desktop (> 1024px) :
  - [ ] Layout complet avec sidebar fixe
  - [ ] Les cartes sont en 3 colonnes
  - [ ] Tous les éléments sont visibles

### Interactivité

- [ ] Les boutons ont un effet hover
- [ ] Les inputs ont un effet focus
- [ ] Les liens changent de couleur au hover
- [ ] Les cartes de comptes ont un effet hover (translate + shadow)
- [ ] Les spinners de chargement sont visibles
- [ ] Les transitions sont fluides (0.2s-0.3s)

### Messages et Feedback

- [ ] Les messages de succès sont verts avec icône ✓
- [ ] Les messages d'erreur sont rouges avec icône ✗
- [ ] Les messages d'erreur de validation sont clairs
- [ ] Les champs requis ont un astérisque (*)
- [ ] Les placeholders sont informatifs
- [ ] Les labels sont descriptifs

---

## 🧪 Tests Fonctionnels

### Scénario 1 : Nouveau Client

```
1. Ouvrir http://localhost:4200
2. Cliquer sur "Espace Client"
3. Cliquer sur "Inscrivez-vous"
4. Remplir tous les champs du formulaire
5. Soumettre le formulaire
6. Vérifier le message de succès
7. Se connecter avec les identifiants créés
8. Vérifier l'accès au dashboard
9. Vérifier l'affichage des informations
10. Se déconnecter
```

**Résultat attendu :** ✅ Tout fonctionne sans erreur

### Scénario 2 : Client Existant

```
1. Ouvrir http://localhost:4200/client/login
2. Entrer email et mot de passe corrects
3. Cliquer sur "Se connecter"
4. Vérifier la redirection vers le dashboard
5. Naviguer vers "Opérations"
6. Naviguer vers "Historique"
7. Revenir sur "Mes Comptes"
8. Se déconnecter
9. Vérifier la redirection vers /client/login
10. Essayer d'accéder à /client/dashboard
```

**Résultat attendu :** ✅ Redirection vers login (route protégée)

### Scénario 3 : Erreurs et Edge Cases

```
1. Essayer de s'inscrire avec un email invalide → Erreur de validation
2. Essayer de s'inscrire avec un email existant → 409 Conflict
3. Essayer de se connecter avec un mauvais mot de passe → 401 Unauthorized
4. Essayer d'accéder au dashboard sans token → Redirection
5. Supprimer le token manuellement → Auto-déconnexion
6. Rafraîchir la page en étant connecté → Reste connecté
7. Fermer et rouvrir le navigateur → Reste connecté (si token valide)
```

**Résultat attendu :** ✅ Toutes les erreurs sont gérées correctement

---

## 📡 Validation API Backend

### Endpoints Client

- [ ] `POST /api/clients` fonctionne (inscription)
  - [ ] Retourne 201 Created en cas de succès
  - [ ] Retourne 409 Conflict si email existant
  - [ ] Retourne 400 Bad Request si données invalides
  - [ ] Le mot de passe est hashé en base de données

- [ ] `POST /api/client/auth/login` fonctionne (connexion)
  - [ ] Retourne 200 OK avec le token JWT
  - [ ] Retourne 401 Unauthorized si identifiants incorrects
  - [ ] Le token contient les bonnes informations
  - [ ] Le token a une expiration (24h recommandé)

- [ ] `GET /api/client/auth/me` fonctionne
  - [ ] Retourne 200 OK avec les infos du client
  - [ ] Retourne 401 Unauthorized sans token
  - [ ] Retourne 401 Unauthorized avec token invalide

- [ ] `GET /api/accounts/client/{id}` fonctionne
  - [ ] Retourne 200 OK avec la liste des comptes
  - [ ] Retourne 401 Unauthorized sans token
  - [ ] Retourne 404 Not Found si client inexistant
  - [ ] Filtre correctement par ID client

---

## 🔍 Validation Console

### Aucune Erreur

- [ ] Aucune erreur rouge dans la console
- [ ] Aucune erreur 404 (fichiers manquants)
- [ ] Aucune erreur CORS
- [ ] Aucune erreur de compilation TypeScript

### Logs Attendus

- [ ] "ClientAuthService.register - sending: ..."
- [ ] "ClientAuthService.login - sending: ..."
- [ ] "Client login success: ..."
- [ ] "Loaded accounts: ..."

### Performance

- [ ] Le chargement de la page est rapide (< 2s)
- [ ] Les requêtes API sont rapides (< 1s)
- [ ] Pas de lags ou freezes
- [ ] Les animations sont fluides (60fps)

---

## 📱 Validation Cross-Browser

- [ ] Chrome / Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 🎯 Validation Finale

### Documentation

- [ ] `CLIENT_AUTH_README.md` est complet
- [ ] `CLIENT_LOGIN_SUMMARY.md` est à jour
- [ ] `QUICK_START_CLIENT.md` est précis
- [ ] `PROJECT_STRUCTURE.md` reflète la structure actuelle
- [ ] `README_CLIENT_SYSTEM.md` est informatif

### Code Quality

- [ ] Pas de code commenté inutile
- [ ] Pas de console.log oubliés (sauf logs intentionnels)
- [ ] Nommage des variables clair et cohérent
- [ ] Indentation correcte
- [ ] Imports organisés

### Git

- [ ] Tous les fichiers sont trackés
- [ ] Les commits sont descriptifs
- [ ] Le `.gitignore` est correct
- [ ] Aucun fichier sensible n'est commité

---

## ✅ Score de Validation

**Nombre de cases cochées : _____ / 200+**

- **200+** : 🎉 Parfait ! Le système est prêt pour la production
- **180-199** : ✅ Très bien ! Quelques ajustements mineurs
- **150-179** : ⚠️ Bon, mais nécessite des corrections
- **< 150** : ❌ Revoyez les points non cochés

---

## 🚀 Prêt pour la Production ?

### Checklist Finale Production

- [ ] Tests unitaires écrits
- [ ] Tests E2E écrits
- [ ] Documentation utilisateur créée
- [ ] Variables d'environnement configurées
- [ ] HTTPS configuré
- [ ] Rate limiting implémenté
- [ ] Logs de sécurité activés
- [ ] Monitoring en place
- [ ] Backup de la base de données configuré
- [ ] Plan de rollback défini

---

## 📞 Support

Si des cases ne peuvent pas être cochées :

1. 🔍 Vérifiez la console (F12)
2. 📖 Consultez `CLIENT_AUTH_README.md`
3. 🐛 Vérifiez les logs du backend
4. 💬 Créez une issue détaillée

---

**© 2024 E-Bank Système - Checklist de Validation v1.0**

---

> 💡 **Conseil :** Cochez les cases au fur et à mesure. Si une case ne peut pas être cochée, notez la raison et corrigez avant de continuer.