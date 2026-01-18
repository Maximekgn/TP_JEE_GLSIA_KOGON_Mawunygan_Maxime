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

    @Query("SELECT t FROM Transaction t LEFT JOIN t.sourceAccount s LEFT JOIN t.destinationAccount d WHERE s.owner.id = :clientId OR d.owner.id = :clientId ORDER BY t.transactionDate DESC")
    java.util.List<Transaction> findByClientId(@Param("clientId") Long clientId);

    @Query("SELECT t FROM Transaction t WHERE (t.sourceAccount.id = :accountId OR t.destinationAccount.id = :accountId) AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    java.util.List<Transaction> findByAccountAndDateBetween(@Param("accountId") Long accountId, @Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);

    @Query("SELECT t FROM Transaction t WHERE t.sourceAccount.id = :accountId OR t.destinationAccount.id = :accountId ORDER BY t.transactionDate DESC")
    java.util.List<Transaction> findByAccount(@Param("accountId") Long accountId);
}
