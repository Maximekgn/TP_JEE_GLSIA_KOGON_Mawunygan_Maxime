package com.backend.ega.filters;

import com.backend.ega.services.UserDetailsServiceImpl;
import com.backend.ega.utils.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtre JWT qui valide les tokens pour chaque requête HTTP
 * Extrait le token du header "Authorization: Bearer <token>"
 * et ajoute l'utilisateur authentifié au contexte de sécurité
 */
@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String AUTHORIZATION_HEADER = "Authorization";

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        try {
            // Récupérer le header Authorization
            final String authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);

            String email = null;
            String jwt = null;

            // Extraire le token JWT du header
            if (authorizationHeader != null && authorizationHeader.startsWith(BEARER_PREFIX)) {
                jwt = authorizationHeader.substring(BEARER_PREFIX.length());

                try {
                    // Extraire l'email du token
                    email = jwtUtil.extractEmail(jwt);
                } catch (ExpiredJwtException e) {
                    logger.warn("Token JWT expiré: {}", e.getMessage());
                } catch (JwtException e) {
                    logger.warn("Erreur lors de la validation du token JWT: {}", e.getMessage());
                }
            }

            // Ajouter l'utilisateur au contexte de sécurité si le token est valide
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);

                    if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        logger.debug("Authentification réussie pour l'utilisateur: {}", email);
                    }
                } catch (Exception e) {
                    logger.warn("Impossible de charger les détails de l'utilisateur pour l'email: {}", email, e);
                }
            }

        } catch (Exception e) {
            logger.error("Erreur dans le filtre JWT: {}", e.getMessage(), e);
        }

        // Continuer la chaîne de filtres
        chain.doFilter(request, response);
    }
}