package com.backend.ega.services;

import com.backend.ega.entities.Client;
import com.backend.ega.repositories.ClientsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ClientsService {

    private final ClientsRepository clientsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public ClientsService(ClientsRepository clientsRepository) {
        this.clientsRepository = clientsRepository;
    }

    public List<Client> getAllClients() {
        return clientsRepository.findAll();
    }

    public ResponseEntity<Client> createClient(Client client) {
        Client savedClient = clientsRepository.save(client);
        return new ResponseEntity<>(savedClient, HttpStatus.CREATED);
    }

    /**
     * Crée un nouveau client avec mot de passe hashé
     * @param email l'email du client
     * @param password le mot de passe en clair
     * @param firstName le prénom
     * @param lastName le nom
     * @return le client créé
     */
    public Client createClient(String email, String password, String firstName, String lastName) {
        // Vérifier que l'email n'existe pas
        if (clientsRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("L'email " + email + " existe déjà");
        }

        // Créer le nouvel client avec mot de passe hashé
        Client client = new Client();
        client.setEmail(email);
        client.setPassword(passwordEncoder.encode(password)); // Hasher le mot de passe
        client.setFirstName(firstName);
        client.setLastName(lastName);
        client.setActive(true);
        // Les timestamps sont gérés automatiquement par @PrePersist

        return clientsRepository.save(client);
    }

    /**
     * Crée un nouveau client avec toutes les informations complètes
     */
    public Client createClient(String email, String password, String firstName, String lastName,
                                String phoneNumber, String address, String gender, LocalDate birthDate) {
        // Vérifier que l'email n'existe pas
        if (clientsRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("L'email " + email + " existe déjà");
        }

        // Créer le client complet
        Client client = new Client();
        client.setEmail(email);
        client.setPassword(passwordEncoder.encode(password));
        client.setFirstName(firstName);
        client.setLastName(lastName);
        client.setPhoneNumber(phoneNumber);
        client.setAddress(address);
        client.setGender(gender);
        client.setBirthDate(birthDate);
        client.setActive(true);
        // Les timestamps sont gérés automatiquement par @PrePersist

        return clientsRepository.save(client);
    }

    /**
     * Crée un nouveau client avec TOUS les champs incluant la nationalité
     */
    public Client createClient(String email, String password, String firstName, String lastName,
                                String phoneNumber, String address, String gender, LocalDate birthDate,
                                String nationality) {
        // Vérifier que l'email n'existe pas
        if (clientsRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("L'email " + email + " existe déjà");
        }

        // Créer le client complet avec tous les champs
        Client client = new Client();
        client.setEmail(email);
        client.setPassword(passwordEncoder.encode(password));
        client.setFirstName(firstName);
        client.setLastName(lastName);
        client.setPhoneNumber(phoneNumber);
        client.setAddress(address);
        client.setGender(gender);
        client.setBirthDate(birthDate);
        client.setNationality(nationality);
        client.setActive(true);
        // Les timestamps sont gérés automatiquement par @PrePersist

        return clientsRepository.save(client);
    }

    public Optional<Client> findByEmail(String email) {
        return clientsRepository.findByEmail(email);
    }

    public boolean emailExists(String email) {
        return clientsRepository.existsByEmail(email);
    }

    /**
     * Sauvegarde un client (mise à jour)
     */
    public Client saveClient(Client client) {
        // updatedAt est géré automatiquement par @PreUpdate
        return clientsRepository.save(client);
    }

    public ResponseEntity<Client> getClientById(Long id) {
        return clientsRepository.findById(id)
                .map(client -> new ResponseEntity<>(client, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<Client> updateClient(Long id, Client clientDetails) {
        return clientsRepository.findById(id)
                .map(client -> {
                    client.setLastName(clientDetails.getLastName());
                    client.setFirstName(clientDetails.getFirstName());
                    client.setEmail(clientDetails.getEmail());
                    client.setPhoneNumber(clientDetails.getPhoneNumber());
                    client.setBirthDate(clientDetails.getBirthDate());
                    client.setGender(clientDetails.getGender());
                    client.setAddress(clientDetails.getAddress());
                    client.setNationality(clientDetails.getNationality());

                    Client updatedClient = clientsRepository.save(client);
                    return new ResponseEntity<>(updatedClient, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<Void> deleteClient(Long id) {
        if (clientsRepository.existsById(id)) {
            clientsRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
