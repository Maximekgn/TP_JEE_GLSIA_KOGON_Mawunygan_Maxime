package com.backend.ega.repositories;

import com.backend.ega.entities.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminsRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByEmail(String email);

    Optional<Admin> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
