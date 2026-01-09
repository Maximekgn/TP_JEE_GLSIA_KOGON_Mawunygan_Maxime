package com.backend.ega.controllers;

import com.backend.ega.entities.Admin;
import com.backend.ega.services.AuthService;
import jakarta.validation.Valid;
import java.util.Map;

import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur d'authentification EXCLUSIVEMENT pour les administrateurs
 * Utilise JWT pour l'authentification
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Data
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(
            AuthController.class
    );

    @Autowired
    private AuthService authService;

    /**
     * EndpoLong de connexion - UNIQUEMENT pour les administrateurs
     * Vérifie les credentials dans la table 'admins'
     *
     * @param credentials Contient le username et password
     * @return Réponse avec access_token JWT
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody Map<String, String> credentials
    ) {
        try {
            Map<String, Object> response = authService.loginAdmin(
                    credentials.get("username"),
                    credentials.get("password")
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Échec d'authentification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            logger.error("Erreur lors du login: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur d'authentification");
        }
    }

    /**
     * EndpoLong pour créer un nouvel administrateur
     *
     * @param credentials Contient username et password
     * @return Réponse avec access_token
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody Map<String, String> credentials
    ) {
        try {
            Map<String, Object> response = authService.registerAdmin(
                    credentials.get("username"),
                    credentials.get("password")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Erreur de validation: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Erreur lors de la création: {}", e.getMessage(), e);
            throw new RuntimeException(
                    "Erreur lors de la création de l'administrateur"
            );
        }
    }

    /**
     * EndpoLong pour vérifier la validité d'un token
     *
     * @param authHeader Header Authorization
     * @return Informations sur l'authentification
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Map<String, Object> result = authService.validateAdmLongoken(
                    authHeader
            );
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new ErrorResponse("Authentification invalide", e.getMessage())
            );
        } catch (Exception e) {
            logger.error("Erreur de validation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorResponse("Erreur serveur", e.getMessage())
            );
        }
    }

    /**
     * EndpoLong pour obtenir les informations de l'admin connecté
     *
     * @param authHeader Header Authorization
     * @return Informations de l'admin
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentAdmin(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Map<String, Object> me = authService.getCurrentAdmin(authHeader);
            return ResponseEntity.ok(me);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new ErrorResponse("Non autorisé", e.getMessage())
            );
        } catch (Exception e) {
            logger.error("Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorResponse("Erreur serveur", e.getMessage())
            );
        }
    }

    /**
     * Classe pour les réponses d'erreur
     */
    public static class ErrorResponse {

        private String error;
        private String message;
        private Long timestamp;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }


    }
}