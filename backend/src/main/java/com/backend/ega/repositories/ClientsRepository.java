package com.backend.ega.repositories;

import com.backend.ega.entities.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientsRepository extends JpaRepository<Client, Long> {
}
