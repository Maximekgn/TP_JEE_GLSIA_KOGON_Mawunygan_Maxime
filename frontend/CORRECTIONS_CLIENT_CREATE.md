# 🔧 Corrections - Création d'un Client

## 📌 Problèmes identifiés et corrigés

### 1. **Mapping des champs incorrect**
   
**❌ Avant :**
- Le frontend envoyait : `firstName`, `lastName`, `phone`, `company`, `metadata`
- Le backend attendait : `first_name`, `last_name`, `phoneNumber`, `gender`, `nationality`, `address`

**✅ Après :**
Le payload est maintenant construit avec le bon mapping :

```javascript
const payload = {
  first_name: v.firstName.trim(),        // ✅ snake_case
  last_name: v.lastName.trim(),          // ✅ snake_case
  email: v.email.trim(),
  phoneNumber: v.phoneNumber.trim(),     // ✅ phoneNumber au lieu de phone
  birthDate: v.birthDate.trim(),
  gender: v.gender.trim(),               // ✅ nouveau champ obligatoire
  address: v.address.trim(),             // ✅ string au lieu d'objet
  nationality: v.nationality.trim().toUpperCase(), // ✅ nouveau champ obligatoire
};
```

---

### 2. **Champs manquants dans le formulaire**

**❌ Avant :**
Les champs `gender` et `nationality` n'existaient pas dans le formulaire.

**✅ Après :**
Ajout de tous les champs obligatoires requis par l'API :

#### **Genre (gender)** - Obligatoire
```html
<select formControlName="gender">
  <option value="">-- Sélectionner --</option>
  <option value="M">Masculin</option>
  <option value="F">Féminin</option>
</select>
```
- Valeurs acceptées : `"M"` ou `"F"`
- Validation : `Validators.required`

#### **Nationalité (nationality)** - Obligatoire
```html
<input 
  type="text" 
  formControlName="nationality"
  placeholder="Ex: TG, FR, US"
  maxlength="2"
/>
```
- Format : Code pays ISO 2 lettres (ex: `TG`, `FR`, `US`)
- Validation : `Validators.required`, `minLength(2)`, `maxLength(2)`
- Automatiquement converti en majuscules dans le payload

---

### 3. **Champ adresse : objet → string**

**❌ Avant :**
```typescript
address: this.fb.group({
  street: this.fb.control(''),
  city: this.fb.control(''),
  postalCode: this.fb.control(''),
  country: this.fb.control('')
})
```
L'adresse était un objet avec plusieurs sous-champs.

**✅ Après :**
```typescript
address: this.fb.control('', { 
  nonNullable: true, 
  validators: [Validators.required] 
})
```
L'adresse est maintenant un simple champ texte (textarea) où l'utilisateur saisit l'adresse complète.

**Interface utilisateur :**
```html
<textarea
  formControlName="address"
  placeholder="Ex: 1 Rue Principale, 75001 Paris, France"
></textarea>
```

---

### 4. **Suppression des champs non requis**

**❌ Avant :**
- `company` (société)
- `metadata` (métadonnées JSON)

Ces champs n'existent pas dans le schéma backend.

**✅ Après :**
Supprimés du formulaire pour éviter toute confusion et erreur.

---

### 5. **Renommage : phone → phoneNumber**

**❌ Avant :**
```typescript
phone: this.fb.control('')
```

**✅ Après :**
```typescript
phoneNumber: this.fb.control('', { 
  nonNullable: true, 
  validators: [Validators.required] 
})
```

Le backend attend `phoneNumber` et non `phone`.

---

## 🎯 Résumé des champs du formulaire

| Champ | Type | Obligatoire | Format/Contraintes | Nom API |
|-------|------|-------------|-------------------|---------|
| Prénom | `text` | ✅ Oui | Non vide | `first_name` |
| Nom | `text` | ✅ Oui | Non vide | `last_name` |
| Email | `email` | ✅ Oui | Format email valide, unique | `email` |
| Téléphone | `tel` | ✅ Oui | Non vide | `phoneNumber` |
| Date de naissance | `date` | ✅ Oui | Format ISO 8601 : `YYYY-MM-DD` | `birthDate` |
| Genre | `select` | ✅ Oui | `"M"` ou `"F"` | `gender` |
| Nationalité | `text` | ✅ Oui | Code pays 2 lettres (ex: `TG`) | `nationality` |
| Adresse | `textarea` | ✅ Oui | Adresse complète | `address` |

---

## 🔄 Gestion des erreurs API

### **409 Conflict - Email déjà utilisé**
```typescript
if (status === 409) {
  const message = 'Cet email est déjà utilisé par un autre client.';
  const emailCtrl = this.form.get('email');
  emailCtrl?.setErrors({ api: message });
  this.globalError.set(message);
}
```
- L'erreur est affichée directement sur le champ email
- Un message global est également affiché

### **400 Bad Request - Validation échouée**
```typescript
if (status === 400) {
  // Mapper les erreurs de champs du backend vers le formulaire
  for (const { field, message } of errors) {
    const mapped = this.mapApiFieldToFormControl(field);
    if (mapped) {
      const ctrl = this.form.get(mapped);
      ctrl?.setErrors({ api: message });
    }
  }
}
```
- Les erreurs de validation du backend sont mappées aux contrôles du formulaire
- Chaque champ affiche son erreur spécifique

### **401 Unauthorized - Non authentifié**
```typescript
if (status === 401) {
  const m = 'Non authentifié. Veuillez vous reconnecter.';
  this.globalError.set(m);
}
```

---

## 📝 Mapping API → Formulaire

```typescript
const mapping: Record<string, keyof ClientCreateForm> = {
  first_name: 'firstName',
  last_name: 'lastName',
  email: 'email',
  phoneNumber: 'phoneNumber',
  birthDate: 'birthDate',
  gender: 'gender',
  address: 'address',
  nationality: 'nationality',
};
```

Ce mapping permet de convertir les noms de champs du backend (snake_case) vers les noms de contrôles du formulaire (camelCase).

---

## ✅ Exemple de payload envoyé

```json
{
  "first_name": "Alice",
  "last_name": "Dupont",
  "email": "alice@example.com",
  "phoneNumber": "123456789",
  "birthDate": "1990-01-01",
  "gender": "F",
  "address": "1 Rue Principale, 75001 Paris, France",
  "nationality": "TG"
}
```

---

## 🧪 Test de la correction

### **1. Lancer le frontend**
```bash
cd frontend
npm install
npm start
```

### **2. Accéder au formulaire**
Naviguer vers : `http://localhost:4200/dashboard/admin/clients/create`

### **3. Remplir le formulaire**
- Prénom : `Alice`
- Nom : `Dupont`
- Email : `alice@example.com`
- Téléphone : `123456789`
- Date de naissance : `1990-01-01`
- Genre : `F` (Féminin)
- Nationalité : `TG`
- Adresse : `1 Rue Principale, Lomé, Togo`

### **4. Vérifier les cas d'erreur**
- **Email déjà utilisé** : Le formulaire affiche l'erreur sur le champ email
- **Champs vides** : Les validations empêchent la soumission
- **Format invalide** : Les erreurs sont affichées sous chaque champ

---

## 📦 Fichiers modifiés

- `frontend/src/app/dashboard/clients-create/client-create.component.ts`

---

## 🎉 Résultat

Le formulaire de création de client est maintenant **100% compatible** avec l'API backend :
- ✅ Tous les champs obligatoires sont présents
- ✅ Le mapping des noms de champs est correct (snake_case)
- ✅ Les types de données correspondent (string pour address au lieu d'objet)
- ✅ La gestion des erreurs est robuste
- ✅ L'interface utilisateur est claire et intuitive

**Le client peut maintenant être créé avec succès via le frontend ! 🚀**