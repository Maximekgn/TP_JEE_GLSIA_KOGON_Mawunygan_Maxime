package com.backend.ega.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "comptes")
public class Compte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String numeroCompte;

    private String typeCompte;

    private LocalDate dateCreation;

    private Double solde = 0.0;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client proprietaire;

    public Compte() {
    }

    public Compte(LocalDate dateCreation, Long id, String numeroCompte, Client proprietaire, String typeCompte) {
        this.dateCreation = dateCreation;
        this.id = id;
        this.numeroCompte = numeroCompte;
        this.proprietaire = proprietaire;

        this.typeCompte = typeCompte;
    }

    public LocalDate getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDate dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroCompte() {
        return numeroCompte;
    }

    public void setNumeroCompte(String numeroCompte) {
        this.numeroCompte = numeroCompte;
    }

    public Client getProprietaire() {
        return proprietaire;
    }

    public void setProprietaire(Client proprietaire) {
        this.proprietaire = proprietaire;
    }

    public Double getSolde() {
        return solde;
    }

    public void setSolde(Double solde) {
        this.solde = solde;
    }

    public String getTypeCompte() {
        return typeCompte;
    }

    public void setTypeCompte(String typeCompte) {
        this.typeCompte = typeCompte;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Compte compte = (Compte) o;
        return Objects.equals(id, compte.id) && Objects.equals(numeroCompte, compte.numeroCompte) && Objects.equals(typeCompte, compte.typeCompte) && Objects.equals(dateCreation, compte.dateCreation) && Objects.equals(solde, compte.solde) && Objects.equals(proprietaire, compte.proprietaire);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, numeroCompte, typeCompte, dateCreation, solde, proprietaire);
    }
}
