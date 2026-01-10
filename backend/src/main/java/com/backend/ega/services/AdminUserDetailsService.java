package com.backend.ega.services;

import com.backend.ega.entities.Admin;
import com.backend.ega.repositories.AdminsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Service chargé de fournir les détails d'un admin pour Spring Security.
 * Implémente UserDetailsService pour que AuthenticationManager puisse authentifier l'admin.
 */
@Service
public class AdminUserDetailsService implements UserDetailsService {

    @Autowired
    private AdminsRepository adminsRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // Cherche l'admin dans la base
        Admin admin = adminsRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin non trouvé"));

        // Retourne un UserDetails Spring Security prêt à l'authentification
        return User.builder()
                .username(admin.getUsername())
                .password(admin.getPassword()) // mot de passe encodé avec BCrypt
                .roles("ADMIN")               // rôle ADMIN
                .build();
    }
}
