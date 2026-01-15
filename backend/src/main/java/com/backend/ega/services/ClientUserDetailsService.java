package com.backend.ega.services;

import com.backend.ega.entities.Client;
import com.backend.ega.repositories.ClientsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

/**
 * Service pour charger les détails des clients pour Spring Security
 */
@Service("clientUserDetailsService")
public class ClientUserDetailsService implements UserDetailsService {

    @Autowired
    private ClientsRepository clientsRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Client client = clientsRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Client non trouvé avec l'email: " + email));

        return User.builder()
                .username(client.getEmail())
                .password(client.getPassword())
                .roles("CLIENT")
                .build();
    }
}
