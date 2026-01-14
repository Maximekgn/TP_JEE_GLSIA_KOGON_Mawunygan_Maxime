-- Migration pour ajouter la colonne password à la table clients
-- Ce script permet aux clients de se connecter avec un mot de passe

ALTER TABLE clients
ADD COLUMN password VARCHAR(255);

-- Optionnel: ajouter un commentaire sur la colonne
COMMENT ON COLUMN clients.password IS 'Mot de passe encodé pour l''authentification du client';
