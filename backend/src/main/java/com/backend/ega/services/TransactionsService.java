package com.backend.ega.services;

import com.backend.ega.entities.Transaction;
import com.backend.ega.repositories.TransactionsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionsService {

    private final TransactionsRepository transactionsRepository;



    public TransactionsService(TransactionsRepository transactionsRepository) {
        this.transactionsRepository = transactionsRepository;
    }

    public List<Transaction> getAllTransactions() {
        return transactionsRepository.findAll();
    }

    public ResponseEntity<Transaction> getTransactionById(Long id) {
        return transactionsRepository.findById(id)
                .map(transaction -> new ResponseEntity<>(transaction, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<Transaction> createTransaction(Transaction transaction) {
        Transaction savedTransaction = transactionsRepository.save(transaction);
        return new ResponseEntity<>(savedTransaction, HttpStatus.CREATED);
    }

    public ResponseEntity<Void> deleteTransaction(Long id) {
        if (transactionsRepository.existsById(id)) {
            transactionsRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public List<Transaction> getTransactionsByAccount(Long accountId) {
        return transactionsRepository.findAll().stream()
                .filter(transaction ->
                        transaction.getSourceAccount().getId().equals(accountId) ||
                                (transaction.getDestinationAccount() != null &&
                                        transaction.getDestinationAccount().getId().equals(accountId))
                )
                .collect(Collectors.toList());
    }
}
