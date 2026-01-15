package com.backend.ega.controllers;

import com.backend.ega.services.ClientAuthService;
import jakarta.validation.Valid;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur d'authentification pour les clients
 */
@RestController
@RequestMapping("/api/client/auth")
@CrossOrigin(origins = "*")
public class ClientAuthController {

    private static final Logger logger = LoggerFactory.getLogger(
        ClientAuthController.class
    );

    @Autowired
    private ClientAuthService clientAuthService;

    /**
     * Endpoint de connexion pour les clients
     * @param credentials Contient l'email et le password
     * @return Réponse avec access_token JWT
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
        @Valid @RequestBody Map<String, String> credentials
    ) {
        try {
            Map<String, Object> response = clientAuthService.loginClient(
                credentials.get("email"),
                credentials.get("password")
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Échec d'authentification client: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of(
                    "error", "Authentification échouée",
                    "message", e.getMessage()
                )
            );
        } catch (Exception e) {
            logger.error("Erreur lors du login client: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of(
                    "error", "Erreur serveur",
                    "message", "Une erreur est survenue"
                )
            );
        }
    }

    /**
     * Endpoint pour obtenir les informations du client connecté
     * @param authHeader Header Authorization
     * @return Informations du client
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentClient(
        @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Map<String, Object> clientInfo = clientAuthService.getCurrentClient(
                authHeader
            );
            return ResponseEntity.ok(clientInfo);
        } catch (IllegalArgumentException e) {
            logger.warn("Erreur d'autorisation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of(
                    "error", "Non autorisé",
                    "message", e.getMessage()
                )
            );
        } catch (Exception e) {
            logger.error("Erreur: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of(
                    "error", "Erreur serveur",
                    "message", "Une erreur est survenue"
                )
            );
        }
    }

    /**
     * Endpoint pour mettre à jour le profil du client connecté
     * @param authHeader Header Authorization
     * @param clientDetails Nouvelles informations
     * @return Informations mises à jour
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody Map<String, Object> clientDetails
    ) {
        try {
            Map<String, Object> updatedClient = clientAuthService.updateCurrentClient(
                authHeader,
                clientDetails
            );
            return ResponseEntity.ok(updatedClient);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of("error", "Requête invalide", "message", e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Erreur serveur", "message", "Une erreur est survenue")
            );
        }
    }
}

