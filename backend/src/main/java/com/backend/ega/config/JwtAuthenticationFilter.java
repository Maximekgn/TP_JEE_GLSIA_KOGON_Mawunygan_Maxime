package com.backend.ega.config;

import org.springframework.security.core.userdetails.UserDetailsService;
import com.backend.ega.utils.JwtUtil;
import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Filtre qui extrait le token JWT du header Authorization,
 * le valide et renseigne le SecurityContext pour Spring Security.
 *
 * Ce filtre doit être enregistré dans la configuration de sécurité :
 * ajouter l'injection et l'appel suivant dans SecurityConfig :
 *
 *     @Autowired
 *     private JwtAuthenticationFilter jwtAuthenticationFilter;
 *
 *     http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
 *
 * Le filtre ne renvoie pas de réponse spécifique si le token est invalide
 * : il laisse Spring Security gérer l'accès (401/403) en l'absence d'authentification.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    @Qualifier("adminUserDetailsService")
    private UserDetailsService adminUserDetailsService;

    @Autowired
    @Qualifier("clientUserDetailsService")
    private UserDetailsService clientUserDetailsService;

    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            final String token = authHeader.substring(BEARER_PREFIX.length()).trim();
            try {
                String username = jwtUtil.extractEmail(token);
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    String userType = jwtUtil.extractUserType(token);
                    UserDetails userDetails = null;

                    if ("ADMIN".equals(userType)) {
                        userDetails = adminUserDetailsService.loadUserByUsername(username);
                    } else if ("CLIENT".equals(userType)) {
                        userDetails = clientUserDetailsService.loadUserByUsername(username);
                    }

                    if (userDetails != null && jwtUtil.validateToken(token, userDetails.getUsername())) {
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities()
                        );
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logger.debug("Authenticated user '{}' (Type: {}) via JWT", username, userType);
                    } else {
                        logger.debug("JWT validation failed or user not found for '{}'", username);
                    }
                }
            } catch (JwtException | IllegalArgumentException ex) {
                // Token invalide ou expiré : ne pas interrompre la chaîne de filtres.
                logger.debug("JWT invalide ou non traité: {}", ex.getMessage());
            } catch (Exception ex) {
                // Catch-all pour éviter de casser la chaîne de filtres en cas d'erreur inattendue
                logger.error("Erreur lors du traitement du JWT: {}", ex.getMessage(), ex);
            }
        }

        filterChain.doFilter(request, response);
    }
}
