package com.backend.ega.controllers;

import com.backend.ega.entities.Client;
import com.backend.ega.services.ClientsService; // Vérifiez bien le 's' à ClientsService
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clients")
public class ClientsController {

    private final ClientsService clientsService;



    public ClientsController(ClientsService clientsService) {
        this.clientsService = clientsService;
    }

    @GetMapping
    public List<Client> getAllClients() {
        return clientsService.getAllClient();
    }
    
    @PostMapping
    public ResponseEntity<Client> createClient(@RequestBody Client client) {
        Client nouveauClient = this.clientsService.createClient(client).getBody();
        return new ResponseEntity<>(nouveauClient, HttpStatus.CREATED);
    }
}