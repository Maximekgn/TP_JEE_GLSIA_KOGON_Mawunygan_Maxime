package com.backend.ega.repositories;

import com.backend.ega.entities.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionsRepository extends JpaRepository<Transaction, Long> {
    
    @Modifying
    @Query("DELETE FROM Transaction t WHERE t.sourceAccount.id = :accountId OR t.destinationAccount.id = :accountId")
    void deleteByAccountId(@Param("accountId") Long accountId);
    
    @Modifying
    @Query("DELETE FROM Transaction t WHERE t.sourceAccount.owner.id = :clientId OR t.destinationAccount.owner.id = :clientId")
    void deleteByClientId(@Param("clientId") Long clientId);
}
