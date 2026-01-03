package com.backend.ega.entities;

import jakarta.persistence.*;
import java.util.Objects;

/**
 * Entité Admin qui hérite de BaseUser
 * Représente un administrateur de la plateforme
 * Table: admins
 */
@Entity
@Table(name = "admins")
public class Admin extends BaseUser {

    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "role", nullable = false)
    private String role = "ADMIN";

    // --- Constructors ---
    public Admin() {
        super();
    }

    public Admin(String username, String email, String password, String firstName, String lastName) {
        super(email, password, firstName, lastName);
        this.username = username;
        this.role = "ADMIN";
    }

    // --- Getters & Setters (spécifiques à Admin) ---

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public String toString() {
        return "Admin{" +
                "id=" + getId() +
                ", username='" + username + '\'' +
                ", email='" + getEmail() + '\'' +
                ", firstName='" + getFirstName() + '\'' +
                ", lastName='" + getLastName() + '\'' +
                ", role='" + role + '\'' +
                ", isActive=" + isActive() +
                ", createdAt=" + getCreatedAt() +
                '}';
    }
}
