package com.backend.ega.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double montant;

    private LocalDateTime dateTransaction;

    private String typeTransaction; // Ex: "VERSEMENT", "RETRAIT", "VIREMENT"

    @ManyToOne
    @JoinColumn(name = "compte_source_id", nullable = false)
    private Compte compteSource;

    @ManyToOne
    @JoinColumn(name = "compte_destination_id")
    private Compte compteDestination; // Utilisé uniquement pour les virements

    private String description;

    // --- Constructeurs ---

    public Transaction() {
        this.dateTransaction = LocalDateTime.now();
    }

    public Transaction(Double montant, String typeTransaction, Compte compteSource) {
        this.montant = montant;
        this.typeTransaction = typeTransaction;
        this.compteSource = compteSource;
        this.dateTransaction = LocalDateTime.now();
    }

    public Compte getCompteDestination() {
        return compteDestination;
    }

    public void setCompteDestination(Compte compteDestination) {
        this.compteDestination = compteDestination;
    }

    public Compte getCompteSource() {
        return compteSource;
    }

    public void setCompteSource(Compte compteSource) {
        this.compteSource = compteSource;
    }

    public LocalDateTime getDateTransaction() {
        return dateTransaction;
    }

    public void setDateTransaction(LocalDateTime dateTransaction) {
        this.dateTransaction = dateTransaction;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getMontant() {
        return montant;
    }

    public void setMontant(Double montant) {
        this.montant = montant;
    }

    public String getTypeTransaction() {
        return typeTransaction;
    }

    public void setTypeTransaction(String typeTransaction) {
        this.typeTransaction = typeTransaction;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Transaction that = (Transaction) o;
        return Objects.equals(id, that.id) && Objects.equals(montant, that.montant) && Objects.equals(dateTransaction, that.dateTransaction) && Objects.equals(typeTransaction, that.typeTransaction) && Objects.equals(compteSource, that.compteSource) && Objects.equals(compteDestination, that.compteDestination) && Objects.equals(description, that.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, montant, dateTransaction, typeTransaction, compteSource, compteDestination, description);
    }
}