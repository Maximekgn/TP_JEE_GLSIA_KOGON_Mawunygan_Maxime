package com.backend.ega.services;

import com.backend.ega.entities.Client;
import com.backend.ega.repositories.ClientsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service pour gérer les opérations CRUD sur les clients.
 */
@Service
public class ClientsService {

    private final ClientsRepository clientsRepository;

    @Autowired
    public ClientsService(ClientsRepository clientsRepository) {
        this.clientsRepository = clientsRepository;
    }

    /**
     * Récupère tous les clients.
     *
     * @return liste des clients
     */
    public List<Client> getAllClients() {
        return clientsRepository.findAll();
    }

    /**
     * Récupère un client par son identifiant.
     *
     * @param id identifiant du client
     * @return ResponseEntity contenant le client ou NOT_FOUND
     */
    public ResponseEntity<Client> getClientById(Long id) {
        Optional<Client> opt = clientsRepository.findById(id);
        return opt.map(client -> new ResponseEntity<>(client, HttpStatus.OK))
                  .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Crée un nouveau client.
     * Vérifie l'unicité de l'email.
     *
     * @param client données du client à créer
     * @return ResponseEntity avec le client créé ou CONFLICT si email déjà utilisé
     */
    public ResponseEntity<Client> createClient(Client client) {
        if (client == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        if (client.getEmail() != null && clientsRepository.existsByEmail(client.getEmail())) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }

        // initialisation des timestamps si nécessaire
        client.setCreatedAt(LocalDateTime.now());
        client.setUpdatedAt(LocalDateTime.now());

        Client saved = clientsRepository.save(client);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /**
     * Met à jour un client existant.
     *
     * @param id             identifiant du client à mettre à jour
     * @param clientDetails  nouvelles données du client
     * @return ResponseEntity avec le client mis à jour ou NOT_FOUND
     */
    public ResponseEntity<Client> updateClient(Long id, Client clientDetails) {
        Optional<Client> opt = clientsRepository.findById(id);
        if (opt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Client client = opt.get();

        // Si on met à jour l'email, vérifier l'unicité
        String newEmail = clientDetails.getEmail();
        if (newEmail != null && !newEmail.equals(client.getEmail())) {
            if (clientsRepository.existsByEmail(newEmail)) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
            client.setEmail(newEmail);
        }

        // Mettre à jour les autres champs s'ils sont fournis
        if (clientDetails.getFirst_name() != null) client.setFirst_name(clientDetails.getFirst_name());
        if (clientDetails.getLast_name() != null) client.setLast_name(clientDetails.getLast_name());
        if (clientDetails.getBirthDate() != null) client.setBirthDate(clientDetails.getBirthDate());
        if (clientDetails.getGender() != null) client.setGender(clientDetails.getGender());
        if (clientDetails.getAddress() != null) client.setAddress(clientDetails.getAddress());
        if (clientDetails.getPhoneNumber() != null) client.setPhoneNumber(clientDetails.getPhoneNumber());
        if (clientDetails.getNationality() != null) client.setNationality(clientDetails.getNationality());

        client.setUpdatedAt(LocalDateTime.now());

        Client updated = clientsRepository.save(client);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    /**
     * Supprime un client par son identifiant.
     *
     * @param id identifiant du client à supprimer
     * @return ResponseEntity NO_CONTENT si supprimé, NOT_FOUND sinon
     */
    public ResponseEntity<Void> deleteClient(Long id) {
        if (!clientsRepository.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        clientsRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /**
     * Recherche un client par email.
     *
     * @param email email du client
     * @return Optional contenant le client si trouvé
     */
    public Optional<Client> findByEmail(String email) {
        return clientsRepository.findByEmail(email);
    }

    /**
     * Vérifie si un email est déjà enregistré.
     *
     * @param email email à vérifier
     * @return true si existe, false sinon
     */
    public boolean existsByEmail(String email) {
        return clientsRepository.existsByEmail(email);
    }
}
