package com.backend.ega.utils;

import com.backend.ega.entities.Admin;
import com.backend.ega.entities.Client;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

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

    public String generateToken(Admin admin) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", admin.getId());
        claims.put("userType", "ADMIN");

        return Jwts.builder()
            .setClaims(claims)
            .setSubject(admin.getUsername())
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(
                new Date(System.currentTimeMillis() + accessTokenExpiration)
            )
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * Génère un token JWT pour un client
     */
    public String generateTokenForClient(Client client) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", client.getId());
        claims.put("userType", "CLIENT");
        claims.put("userId", client.getId());

        return Jwts.builder()
            .setClaims(claims)
            .setSubject(client.getEmail())
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(
                new Date(System.currentTimeMillis() + accessTokenExpiration)
            )
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
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver)
        throws JwtException {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extrait le type d'utilisateur du token (CLIENT ou ADMIN)
     */
    public String extractUserType(String token) throws JwtException {
        return extractClaim(token, claims ->
            claims.get("userType", String.class)
        );
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
            throw new ExpiredJwtException(
                e.getHeader(),
                e.getClaims(),
                "Le token a expiré",
                e
            );
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
