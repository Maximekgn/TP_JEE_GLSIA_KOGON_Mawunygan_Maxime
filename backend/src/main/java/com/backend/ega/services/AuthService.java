package com.backend.ega.services;

import com.backend.ega.entities.Admin;
import com.backend.ega.repositories.AdminsRepository;
import com.backend.ega.utils.JwtUtil;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final String BEARER_PREFIX = "Bearer ";

    @Autowired
    private AdminsRepository adminsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${jwt.expiration:3600000}") // 1 heure par défaut
    private Long accessTokenExpiration;

    /**
     * Login ADMIN: authentifie en vérifiant le mot de passe puis génère un JWT.
     */
    public Map<String, Object> loginAdmin(String username, String password) {
        if (username == null || password == null) {
            throw new IllegalArgumentException("Requête invalide");
        }

        String trimmedUsername = safeTrim(username);

        if (
            trimmedUsername == null ||
            trimmedUsername.isBlank() ||
            password.isBlank()
        ) {
            throw new IllegalArgumentException(
                "Username et mot de passe requis"
            );
        }

        Admin admin = adminsRepository
            .findByUsername(trimmedUsername)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "Username ou mot de passe incorrect"
                )
            );

        // Vérifier le mot de passe avec BCrypt
        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new IllegalArgumentException(
                "Username ou mot de passe incorrect"
            );
        }

        String accessToken = jwtUtil.generateToken(admin);

        Map<String, Object> response = new HashMap<>();
        response.put("access_token", accessToken);
        response.put("token_type", "Bearer");
        response.put("expires_in", accessTokenExpiration / 1000);
        response.put("user_id", admin.getId());
        response.put("username", admin.getUsername());
        response.put("message", "Connexion réussie");

        return response;
    }

    /**
     * Register ADMIN: crée un admin (mot de passe encodé) puis génère un JWT.
     */
    public Map<String, Object> registerAdmin(String username, String password) {
        if (username == null || password == null) {
            throw new IllegalArgumentException("Requête invalide");
        }

        String trimmedUsername = safeTrim(username);

        if (
            trimmedUsername == null ||
            trimmedUsername.isBlank() ||
            password.isBlank()
        ) {
            throw new IllegalArgumentException(
                "Username et mot de passe requis"
            );
        }

        if (adminsRepository.existsByUsername(trimmedUsername)) {
            throw new IllegalArgumentException("Ce username est déjà utilisé");
        }

        Admin admin = new Admin();
        admin.setUsername(trimmedUsername);
        admin.setPassword(passwordEncoder.encode(password));

        Admin saved = adminsRepository.save(admin);

        String accessToken = jwtUtil.generateToken(saved);

        Map<String, Object> response = new HashMap<>();
        response.put("access_token", accessToken);
        response.put("token_type", "Bearer");
        response.put("expires_in", accessTokenExpiration / 1000);
        response.put("user_id", saved.getId());
        response.put("username", saved.getUsername());
        response.put("message", "Administrateur créé avec succès");

        return response;
    }

    /**
     * Validation d'un token ADMIN (header Authorization: Bearer <token>).
     * Retourne une map compatible avec la réponse actuelle du contrôleur.
     */
    public Map<String, Object> validateAdmLongoken(String authHeader) {
        String token = extractBearerToken(authHeader);

        String username;
        try {
            // Dans JwtUtil, le "subject" est le username (generateToken(Admin) utilise setSubject(admin.getUsername()))
            username = jwtUtil.extractEmail(token);
        } catch (Exception e) {
            throw new IllegalArgumentException("Token invalide");
        }

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Token invalide");
        }

        Admin admin = adminsRepository
            .findByUsername(username)
            .orElseThrow(() ->
                new IllegalArgumentException("Administrateur non trouvé")
            );

        boolean valid = jwtUtil.validateToken(token, admin.getUsername());
        if (!valid) {
            throw new IllegalArgumentException("Token expiré ou invalide");
        }

        Date expiration = jwtUtil.extractExpiration(token);
        Long expiresInSeconds = Math.max(
            0,
            (expiration.getTime() - System.currentTimeMillis()) / 1000
        );

        Map<String, Object> result = new HashMap<>();
        result.put("valid", true);
        result.put("username", admin.getUsername());
        result.put("user_id", admin.getId());
        result.put("expires_in", expiresInSeconds);

        return result;
    }

    /**
     * Infos du admin courant (header Authorization: Bearer <token>).
     */
    public Map<String, Object> getCurrentAdmin(String authHeader) {
        String token = extractBearerToken(authHeader);

        String username;
        try {
            username = jwtUtil.extractEmail(token);
        } catch (Exception e) {
            throw new IllegalArgumentException("Token invalide");
        }

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Token invalide");
        }

        Admin admin = adminsRepository
            .findByUsername(username)
            .orElseThrow(() ->
                new IllegalArgumentException("Administrateur non trouvé")
            );

        Map<String, Object> result = new HashMap<>();
        result.put("id", admin.getId());
        result.put("username", admin.getUsername());

        return result;
    }

    private String extractBearerToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            throw new IllegalArgumentException("Token manquant");
        }
        String token = authHeader.substring(BEARER_PREFIX.length());
        if (token.isBlank()) {
            throw new IllegalArgumentException("Token manquant");
        }
        return token;
    }

    private String safeTrim(String s) {
        return s == null ? null : s.trim();
    }
}
