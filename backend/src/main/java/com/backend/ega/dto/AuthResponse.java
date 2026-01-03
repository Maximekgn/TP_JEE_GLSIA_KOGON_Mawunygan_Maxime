package com.backend.ega.dto;

/**
 * DTO pour les réponses d'authentification
 * Contient le token JWT et les infos de l'utilisateur
 */
public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private long expiresIn;
    private String userType; // "CLIENT" ou "ADMIN"
    private Long userId;
    private String email;

    // --- Constructors ---
    public AuthResponse() {}

    public AuthResponse(String token, long expiresIn, String userType, Long userId, String email) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.userType = userType;
        this.userId = userId;
        this.email = email;
        this.tokenType = "Bearer";
    }

    // --- Getters & Setters ---
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}