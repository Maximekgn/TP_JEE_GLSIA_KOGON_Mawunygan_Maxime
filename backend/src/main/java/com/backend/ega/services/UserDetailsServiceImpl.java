package com.backend.ega.services;

import com.backend.ega.entities.Admin;
import com.backend.ega.entities.Client;
import com.backend.ega.entities.User;
import com.backend.ega.repositories.AdminsRepository;
import com.backend.ega.repositories.ClientsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private ClientsRepository clientsRepository;

    @Autowired
    private AdminsRepository adminsRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Try to find in Admins first
        Optional<Admin> admin = adminsRepository.findByEmail(email);
        if (admin.isPresent()) {
            return new User(admin.get());
        }

        // Then try in Clients
        return clientsRepository.findByEmail(email)
                .map(User::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
