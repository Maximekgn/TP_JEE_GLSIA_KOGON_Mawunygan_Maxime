package com.backend.ega.services;

import com.backend.ega.entities.Client;
import com.backend.ega.repositories.ClientsRepository;
import com.backend.ega.utils.JwtUtil;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service d'authentification pour les clients
 */
@Service
public class ClientAuthService {

    private static final String BEARER_PREFIX = "Bearer ";

    @Autowired
    private ClientsRepository clientsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${jwt.expiration:3600000}")
    private Long accessTokenExpiration;

    /**
     * Authentifie un client avec son email et mot de passe
     */
    public Map<String, Object> loginClient(String email, String password) {
        if (email == null || password == null) {
            throw new IllegalArgumentException("Email et mot de passe requis");
        }

        String trimmedEmail = safeTrim(email);

        if (trimmedEmail == null || trimmedEmail.isBlank() || password.isBlank()) {
            throw new IllegalArgumentException("Email et mot de passe requis");
        }

        Client client = clientsRepository
            .findByEmail(trimmedEmail)
            .orElseThrow(() ->
                new IllegalArgumentException("Email ou mot de passe incorrect")
            );

        if (client.getPassword() == null) {
            throw new IllegalArgumentException(
                "Ce client n'a pas de mot de passe configuré"
            );
        }

        if (!passwordEncoder.matches(password, client.getPassword())) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect");
        }

        String accessToken = jwtUtil.generateTokenForClient(client);

        Map<String, Object> response = new HashMap<>();
        response.put("access_token", accessToken);
        response.put("token_type", "Bearer");
        response.put("expires_in", accessTokenExpiration / 1000);
        response.put("user_id", client.getId());
        response.put("email", client.getEmail());
        response.put("first_name", client.getFirst_name());
        response.put("last_name", client.getLast_name());
        response.put("message", "Connexion réussie");

        return response;
    }

    /**
     * Récupère les informations du client connecté à partir du token
     */
    public Map<String, Object> getCurrentClient(String authHeader) {
        String token = extractBearerToken(authHeader);

        String email;
        try {
            email = jwtUtil.extractEmail(token);
        } catch (Exception e) {
            throw new IllegalArgumentException("Token invalide");
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Token invalide");
        }

        Client client = clientsRepository
            .findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Client non trouvé"));

        Map<String, Object> result = new HashMap<>();
        result.put("id", client.getId());
        result.put("email", client.getEmail());
        result.put("first_name", client.getFirst_name());
        result.put("last_name", client.getLast_name());
        result.put("phone_number", client.getPhoneNumber());
        result.put("address", client.getAddress());
        result.put("birth_date", client.getBirthDate());
        result.put("gender", client.getGender());
        result.put("nationality", client.getNationality());

        return result;
    }

    /**
     * Extrait le client ID du token JWT
     */
    public Long extractClientIdFromToken(String authHeader) {
        String token = extractBearerToken(authHeader);

        try {
            return jwtUtil.extractUserId(token);
        } catch (Exception e) {
            throw new IllegalArgumentException("Token invalide");
        }
    }

    /**
     * Valide le token et vérifie qu'il appartient à un client
     */
    public boolean validateClientToken(String authHeader) {
        try {
            String token = extractBearerToken(authHeader);
            String userType = jwtUtil.extractUserType(token);
            return "CLIENT".equals(userType);
        } catch (Exception e) {
            return false;
        }
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
