package com.backend.ega.services;

import com.backend.ega.entities.Client;
import com.backend.ega.repositories.ClientsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Service
public class ClientsService {
    private final ClientsRepository clientsRepository;


    public ClientsService(ClientsRepository clientsRepository) {
        this.clientsRepository = clientsRepository;
    }

    public List<Client> getAllClient(){
        return clientsRepository.findAll();
    }

    public ResponseEntity<Client> createClient(Client client) {
        Client clientSauvegarde = this.clientsRepository.save(client);
       return  new ResponseEntity<>(clientSauvegarde, HttpStatus.CREATED);
    }
}
