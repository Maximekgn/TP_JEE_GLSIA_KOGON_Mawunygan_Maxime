package com.backend.ega.controllers;

import com.backend.ega.dto.AuthRequest;
import com.backend.ega.dto.AuthResponse;
import com.backend.ega.dto.RegisterRequest;
import com.backend.ega.entities.Admin;
import com.backend.ega.entities.Client;
import com.backend.ega.entities.enums.AccountType;
import com.backend.ega.services.AccountsService;
import com.backend.ega.services.AdminsService;
import com.backend.ega.services.ClientsService;
import com.backend.ega.services.UserDetailsServiceImpl;
import com.backend.ega.utils.JwtUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Contrôleur pour la gestion de l'authentification et de l'enregistrement
 * Gère les clients et les administrateurs avec JWT
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AdminsService adminsService;

    @Autowired
    private ClientsService clientsService;

    @Autowired
    private AccountsService accountsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${jwt.expiration}")
    private long accessTokenExpiration;

    /**
     * Login pour clients et administrateurs
     * Accepte email/mot de passe et retourne un token JWT
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) {
        try {
            // Essayer d'authentifier l'utilisateur
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );

            // Récupérer les détails de l'utilisateur
            final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmail());

            // Déterminer si c'est un Admin ou un Client
            String userType = "CLIENT";
            Long userId = null;

            // Chercher dans Admin en premier
            Optional<Admin> adminOpt = adminsService.findByEmail(authRequest.getEmail());
            if (adminOpt.isPresent()) {
                userType = "ADMIN";
                userId = adminOpt.get().getId();
                logger.info("Admin trouvé pour l'email: {}", authRequest.getEmail());
            } else {
                // Chercher dans Client
                Optional<Client> clientOpt = clientsService.findByEmail(authRequest.getEmail());
                if (clientOpt.isPresent()) {
                    userType = "CLIENT";
                    userId = clientOpt.get().getId();
                    logger.info("Client trouvé pour l'email: {}", authRequest.getEmail());
                } else {
                    logger.warn("Aucun utilisateur (Admin ou Client) trouvé pour l'email dans la base de données: {}", authRequest.getEmail());
                }
            }

            // Générer le token JWT
            final String token = jwtUtil.generateToken(
                    userDetails.getUsername(),
                    userType,
                    userId
            );

            logger.info("Génération du token réussie pour: {} avec type: {}", authRequest.getEmail(), userType);

            // Retourner la réponse avec les informations du token
            AuthResponse response = new AuthResponse(
                    token,
                    accessTokenExpiration / 1000,
                    userType,
                    userId,
                    authRequest.getEmail()
            );

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            logger.warn("Tentative de login échouée pour: {}", authRequest.getEmail());
            throw new BadCredentialsException("Email ou mot de passe incorrect");
        } catch (Exception e) {
            logger.error("Erreur lors du login: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Enregistrement d'un nouvel utilisateur (Client ou Admin)
     * Pour CLIENT: tous les champs sont obligatoires (téléphone, adresse, genre, date de naissance)
     * Pour ADMIN: seuls email, password, firstName, lastName sont requis
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            // Valider le type d'utilisateur
            if (!registerRequest.getUserType().equals("CLIENT") && !registerRequest.getUserType().equals("ADMIN")) {
                throw new IllegalArgumentException("Le type d'utilisateur doit être CLIENT ou ADMIN");
            }

            String email = registerRequest.getEmail();
            String userType = registerRequest.getUserType();

            // Vérifier que l'email n'existe pas déjà
            Optional<Admin> adminExists = adminsService.findByEmail(email);
            Optional<Client> clientExists = clientsService.findByEmail(email);

            if (adminExists.isPresent() || clientExists.isPresent()) {
                throw new IllegalArgumentException("L'email " + email + " est déjà utilisé");
            }

            Long userId = null;
            String password = registerRequest.getPassword();

            // Créer l'utilisateur selon le type
            if ("ADMIN".equals(userType)) {
                // Pour ADMIN: utiliser l'email comme username
                Admin admin = adminsService.createAdmin(
                        email, // username = email
                        email,
                        password,
                        registerRequest.getFirstName(),
                        registerRequest.getLastName()
                );
                userId = admin.getId();
                logger.info("Nouvel admin créé: {} ({})", email, admin.getId());
                
            } else {
                // Pour CLIENT: valider que tous les champs requis sont présents
                StringBuilder missingFields = new StringBuilder();
                
                if (registerRequest.getPhoneNumber() == null || registerRequest.getPhoneNumber().isBlank()) {
                    missingFields.append("phoneNumber, ");
                }
                if (registerRequest.getAddress() == null || registerRequest.getAddress().isBlank()) {
                    missingFields.append("address, ");
                }
                if (registerRequest.getGender() == null || registerRequest.getGender().isBlank()) {
                    missingFields.append("gender, ");
                }
                if (registerRequest.getBirthDate() == null) {
                    missingFields.append("birthDate, ");
                }
                if (registerRequest.getNationality() == null || registerRequest.getNationality().isBlank()) {
                    missingFields.append("nationality, ");
                }
                if (missingFields.length() > 0) {
                    // Supprimer la dernière virgule et espace
                    String fields = missingFields.toString().replaceAll(", $", "");
                    throw new IllegalArgumentException("Champs obligatoires manquants pour un client: " + fields);
                }

                // Créer le client avec toutes les informations incluant la nationalité
                Client client = clientsService.createClient(
                        email,
                        password,
                        registerRequest.getFirstName(),
                        registerRequest.getLastName(),
                        registerRequest.getPhoneNumber(),
                        registerRequest.getAddress(),
                        registerRequest.getGender(),
                        registerRequest.getBirthDate(),
                        registerRequest.getNationality()
                );
                
                userId = client.getId();
                logger.info("Nouveau client créé: {} ({})", email, client.getId());
            }

            // Générer le token JWT
            String token = jwtUtil.generateToken(email, userType, userId);

            AuthResponse response = new AuthResponse(
                    token,
                    accessTokenExpiration / 1000,
                    userType,
                    userId,
                    email
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Erreur lors de l'enregistrement: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Erreur lors de l'enregistrement: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Renouvelle un token JWT expiré
     * Utilise l'email de l'utilisateur authentifié actuellement
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Header Authorization invalide");
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            String userType = jwtUtil.extractUserType(token);
            Long userId = jwtUtil.extractUserId(token);

            // Générer un nouveau token
            String newToken = jwtUtil.generateToken(email, userType, userId);

            AuthResponse response = new AuthResponse(
                    newToken,
                    accessTokenExpiration / 1000,
                    userType,
                    userId,
                    email
            );

            logger.info("Token rafraîchi pour: {}", email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Erreur lors du rafraîchissement du token: {}", e.getMessage());
            throw new BadCredentialsException("Token invalide ou expiré");
        }
    }
}