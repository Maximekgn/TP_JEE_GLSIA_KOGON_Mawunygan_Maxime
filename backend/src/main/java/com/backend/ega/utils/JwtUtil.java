package com.backend.ega.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Utilitaire pour générer, valider et extraire les informations des tokens JWT
 * Gère l'authentification des Clients et des Admins
 */
@Component
public class JwtUtil {

    // Charger la clé secrète depuis application.properties
    @Value("${jwt.secret}")
    private String secretKeyString;

    // Durée de vie du token d'accès (24 heures par défaut)
    @Value("${jwt.expiration}")
    private long accessTokenExpiration;

    // Durée de vie du refresh token (7 jours par défaut)
    @Value("${jwt.refresh-expiration}")
    private long refreshTokenExpiration;

    /**
     * Obtient la clé secrète pour signer les tokens
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKeyString.getBytes());
    }

    /**
     * Génère un token JWT pour un utilisateur (Client ou Admin)
     * @param email l'email de l'utilisateur
     * @param userType type d'utilisateur ("CLIENT" ou "ADMIN")
     * @param userId ID de l'utilisateur
     * @return le token JWT
     */
    public String generateToken(String email, String userType, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userType", userType);
        claims.put("userId", userId);
        return createToken(claims, email, accessTokenExpiration);
    }

    /**
     * Génère un refresh token pour renouveler l'accès
     */
    public String generateRefreshToken(String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("tokenType", "REFRESH");
        return createToken(claims, email, refreshTokenExpiration);
    }

    /**
     * Crée un token JWT avec les claims et la durée de vie spécifiées
     */
    private String createToken(Map<String, Object> claims, String subject, long expirationTime) {
        Date now = new Date(System.currentTimeMillis());
        Date expirationDate = new Date(System.currentTimeMillis() + expirationTime);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extrait l'email du token JWT
     */
    public String extractEmail(String token) throws JwtException {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrait la date d'expiration du token
     */
    public Date extractExpiration(String token) throws JwtException {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extrait un claim spécifique du token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) throws JwtException {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extrait le type d'utilisateur du token (CLIENT ou ADMIN)
     */
    public String extractUserType(String token) throws JwtException {
        return extractClaim(token, claims -> claims.get("userType", String.class));
    }

    /**
     * Extrait l'ID de l'utilisateur du token
     */
    public Long extractUserId(String token) throws JwtException {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    /**
     * Extrait tous les claims du token
     * @throws JwtException si le token est invalide
     * @throws ExpiredJwtException si le token est expiré
     */
    private Claims extractAllClaims(String token) throws JwtException {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            throw new ExpiredJwtException(e.getHeader(), e.getClaims(), "Le token a expiré", e);
        } catch (JwtException e) {
            throw new JwtException("Token JWT invalide: " + e.getMessage(), e);
        }
    }

    /**
     * Vérifie si le token est expiré
     */
    private boolean isTokenExpired(String token) throws JwtException {
        try {
            Date expiration = extractExpiration(token);
            return expiration.before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    /**
     * Valide un token JWT
     * @param token le token à valider
     * @param email l'email attendu
     * @return true si le token est valide, false sinon
     */
    public boolean validateToken(String token, String email) {
        try {
            final String extractedEmail = extractEmail(token);
            return extractedEmail.equals(email) && !isTokenExpired(token);
        } catch (JwtException e) {
            return false;
        }
    }

    /**
     * Valide un token JWT avec exception si invalide
     * @throws JwtException si le token est invalide
     */
    public void validateTokenStrict(String token) throws JwtException {
        extractAllClaims(token);
    }
}