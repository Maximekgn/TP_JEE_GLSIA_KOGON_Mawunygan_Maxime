package com.backend.ega.repositories;

import com.backend.ega.entities.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComptesRepository extends JpaRepository<Account, Long> {
}
