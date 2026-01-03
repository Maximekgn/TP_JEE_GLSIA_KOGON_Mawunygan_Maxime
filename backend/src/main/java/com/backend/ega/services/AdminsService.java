package com.backend.ega.services;

import com.backend.ega.entities.Admin;
import com.backend.ega.repositories.AdminsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AdminsService {

    @Autowired
    private AdminsRepository adminsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Récupère un admin par email
     */
    public Optional<Admin> findByEmail(String email) {
        return adminsRepository.findByEmail(email);
    }

    /**
     * Récupère un admin par username
     */
    public Optional<Admin> findByUsername(String username) {
        return adminsRepository.findByUsername(username);
    }

    /**
     * Crée un nouvel admin avec mot de passe hashé
     */
    public Admin createAdmin(String username, String email, String password, String firstName, String lastName) {
        // Vérifier que l'email/username n'existe pas
        if (adminsRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("L'email " + email + " existe déjà");
        }
        if (adminsRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Le username " + username + " existe déjà");
        }

        // Créer le nouvel admin avec mot de passe hashé
        Admin admin = new Admin();
        admin.setUsername(username);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password)); // Hasher le mot de passe
        admin.setFirstName(firstName);
        admin.setLastName(lastName);
        admin.setRole("ADMIN");
        admin.setActive(true);
        // Les timestamps sont gérés automatiquement par @PrePersist

        return adminsRepository.save(admin);
    }

    /**
     * Vérifie si un email existe
     */
    public boolean emailExists(String email) {
        return adminsRepository.existsByEmail(email);
    }

    /**
     * Vérifie si un username existe
     */
    public boolean usernameExists(String username) {
        return adminsRepository.existsByUsername(username);
    }

    /**
     * Récupère un admin par ID
     */
    public Optional<Admin> findById(Long id) {
        return adminsRepository.findById(id);
    }

    /**
     * Sauvegarde un admin
     */
    public Admin saveAdmin(Admin admin) {
        // updatedAt est géré automatiquement par @PreUpdate
        return adminsRepository.save(admin);
    }

    /**
     * Supprime un admin
     */
    public void deleteAdmin(Long id) {
        adminsRepository.deleteById(id);
    }
}
