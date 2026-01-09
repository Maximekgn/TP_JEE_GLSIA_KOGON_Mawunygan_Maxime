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
     * Récupère un admin par username
     */
    public Optional<Admin> findByUsername(String username) {
        return adminsRepository.findByUsername((username));
    }

    /**
     * Crée un nouvel admin avec mot de passe hashé
     */
    public Admin createAdmin(Admin admin) {

        if (adminsRepository.existsByUsername(admin.getUsername()))
        throw new IllegalArgumentException("Le username " + admin.getUsername() + " existe déjà");

        // Créer le nouvel admin avec mot de passe hashé
        Admin new_admin = new Admin();
        admin.setUsername(admin.getUsername());

        admin.setPassword(passwordEncoder.encode(admin.getPassword())); // Hasher le mot de passe

        // Les timestamps sont gérés automatiquement par @PrePersist

        return adminsRepository.save(admin);
    }


    /**
     * Vérifie si un username existe
     */
    public boolean usernameExists(String username) {
        return adminsRepository.existsByUsername((username));
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
