package com.backend.ega.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La date de naissance est obligatoire")
    @Column(name = "birth_date")
    private LocalDate birthDate;

    @NotNull(message = "Le genre est obligatoire: M ou F")
    @Column(name = "gender")
    private String gender;

    @NotNull(message = "L'adresse est obligatoire")
    @Column(name = "address")
    private String address;

    @NotNull(message = "Le numéro de telephone est obligatoire")
    @Column(name = "phone_number")
    private String phoneNumber;

    @NotNull(message = "La nationalité est obligatoire")
    @Column(name = "nationality")
    private String nationality;

    @NotNull(message = "L'email' est obligatoire")
    @Column(name = "email")
    private String email;

    @NotNull(message = "Le first name est obligatoire")
    @Column(name = "first_name")
    private String first_name;

    @NotNull(message = "Le last name est obligatoire")
    @Column(name = "last_name")
    private String last_name;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @JsonIgnore
    @JsonIgnoreProperties({ "owner" })
    @OneToMany(
        mappedBy = "owner",
        cascade = CascadeType.ALL,
        fetch = FetchType.LAZY
    )
    private List<Account> accounts = new ArrayList<>();
}
