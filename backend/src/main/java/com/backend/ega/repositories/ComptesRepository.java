package com.backend.ega.repositories;

import com.backend.ega.entities.Compte;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComptesRepository extends JpaRepository<Compte, Long> {
}
