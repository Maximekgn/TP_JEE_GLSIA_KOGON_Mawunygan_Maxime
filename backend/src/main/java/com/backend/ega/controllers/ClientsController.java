package com.backend.ega.controllers;

import com.backend.ega.entities.Client;
import com.backend.ega.services.ClientsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour gérer les clients.
 * Endpoints disponibles :
 * - GET    /api/clients            -> lister tous les clients
 * - GET    /api/clients/{id}       -> récupérer un client par id
 * - GET    /api/clients/email/{email} -> récupérer un client par email
 * - POST   /api/clients            -> créer un client
 * - PUT    /api/clients/{id}       -> mettre à jour un client
 * - DELETE /api/clients/{id}       -> supprimer un client
 *
 * Les contrôles d'accès sont gérés par la configuration de sécurité globale.
 */
@RestController
@RequestMapping("/api/clients")
public class ClientsController {

    private final ClientsService clientsService;

    public ClientsController(ClientsService clientsService) {
        this.clientsService = clientsService;
    }

    @GetMapping
    public List<Client> getAllClients() {
        return clientsService.getAllClients();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        return clientsService.getClientById(id);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Client> getClientByEmail(@PathVariable String email) {
        return clientsService.findByEmail(email)
                .map(client -> ResponseEntity.ok(client))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Client> createClient(@Valid @RequestBody Client client) {
        return clientsService.createClient(client);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(
            @PathVariable Long id,
            @Valid @RequestBody Client clientDetails
    ) {
        return clientsService.updateClient(id, clientDetails);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        return clientsService.deleteClient(id);
    }
}
