package com.backend.ega.controllers;

import com.backend.ega.entities.Compte;
import com.backend.ega.services.ComptesService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comptes")
public class ComptesController {

    private final ComptesService comptesService;

    public ComptesController(ComptesService comptesService) {
        this.comptesService = comptesService;
    }

    @GetMapping
    public List<Compte> getAllComptes() {
        return comptesService.getAllComptes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Compte> getCompteById(@PathVariable Long id) {
        return comptesService.getCompteById(id);
    }

    @PostMapping
    public ResponseEntity<Compte> createCompte(@RequestBody Compte compte) {
        return comptesService.createCompte(compte);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Compte> updateCompte(@PathVariable Long id, @RequestBody Compte compte) {
        return comptesService.updateCompte(id, compte);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompte(@PathVariable Long id) {
        return comptesService.deleteCompte(id);
    }

    @GetMapping("/client/{clientId}")
    public List<Compte> getComptesParClient(@PathVariable Long clientId) {
        return comptesService.getComptesParClient(clientId);
    }
}
