package com.backend.ega.services;

import com.backend.ega.entities.Compte;
import com.backend.ega.repositories.ComptesRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComptesService {
    private final ComptesRepository comptesRepository;

    public ComptesService(ComptesRepository comptesRepository) {
        this.comptesRepository = comptesRepository;
    }

    public List<Compte> getAllComptes() {
        return comptesRepository.findAll();
    }

    public ResponseEntity<Compte> getCompteById(Long id) {
        return this.comptesRepository.findById(id)
                .map(compte -> new ResponseEntity<>(compte, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<Compte> createCompte(Compte compte) {
        Compte compteSauvegarde = this.comptesRepository.save(compte);
        return new ResponseEntity<>(compteSauvegarde, HttpStatus.CREATED);
    }

    public ResponseEntity<Compte> updateCompte(Long id, Compte compteDetails) {
        return this.comptesRepository.findById(id)
                .map(compte -> {
                    compte.setNumeroCompte(compteDetails.getNumeroCompte());
                    compte.setTypeCompte(compteDetails.getTypeCompte());
                    compte.setDateCreation(compteDetails.getDateCreation());
                    compte.setSolde(compteDetails.getSolde());
                    Compte compteMaj = this.comptesRepository.save(compte);
                    return new ResponseEntity<>(compteMaj, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<Void> deleteCompte(Long id) {
        if (this.comptesRepository.existsById(id)) {
            this.comptesRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public List<Compte> getComptesParClient(Long clientId) {
        return this.comptesRepository.findAll().stream()
                .filter(compte -> compte.getProprietaire().getId().equals(clientId))
                .collect(Collectors.toList());
    }
}
