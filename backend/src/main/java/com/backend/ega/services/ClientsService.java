package com.backend.ega.services;

import com.backend.ega.entities.Client;
import com.backend.ega.repositories.ClientsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientsService {

    private final ClientsRepository clientsRepository;

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
