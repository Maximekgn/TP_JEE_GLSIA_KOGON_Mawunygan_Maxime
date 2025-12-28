package com.backend.ega.services;

import com.backend.ega.entities.Transaction;
import com.backend.ega.entities.enums.TransactionType;
import com.backend.ega.repositories.TransactionsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
class DepositsService {

    private final TransactionsRepository transactionsRepository;

    public DepositsService(TransactionsRepository transactionsRepository) {
        this.transactionsRepository = transactionsRepository;
    }

    public ResponseEntity<Transaction> createDeposit(Transaction transaction) {


        if (transaction.getTransactionType() != TransactionType.DEPOSIT) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }


        if (transaction.getAmount() == null || transaction.getAmount() <= 0) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }


        Transaction savedTransaction = transactionsRepository.save(transaction);

        return new ResponseEntity<>(savedTransaction, HttpStatus.CREATED);
    }
}
