package com.backend.ega.entities.enums;

/**
 * Énumération des types de comptes disponibles
 * La banque met à disposition deux types de comptes :
 * - SAVINGS : Compte d'épargne (pour économiser)
 * - CHECKING : Compte courant (pour les opérations courantes)
 */
public enum AccountType {
    SAVINGS("Compte Épargne"),
    CHECKING("Compte Courant");

    private final String label;

    AccountType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
