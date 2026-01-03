package com.backend.ega.services;

import com.backend.ega.entities.Account;
import com.backend.ega.entities.Transaction;
import com.backend.ega.entities.enums.TransactionType;
import com.backend.ega.repositories.AccountsRepository;
import com.backend.ega.repositories.TransactionsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransactionsService {

    private final TransactionsRepository transactionsRepository;
    private final AccountsRepository accountsRepository;

    public TransactionsService(TransactionsRepository transactionsRepository, AccountsRepository accountsRepository) {
        this.transactionsRepository = transactionsRepository;
        this.accountsRepository = accountsRepository;
    }

    public List<Transaction> getAllTransactions() {
        return transactionsRepository.findAll();
    }

    public ResponseEntity<Transaction> getTransactionById(Long id) {
        return transactionsRepository.findById(id)
                .map(transaction -> new ResponseEntity<>(transaction, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public ResponseEntity<Transaction> createTransaction(Transaction input) {
        if (input.getSourceAccount() == null || input.getSourceAccount().getId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        // 1. Fetch Managed Source Account
        Optional<Account> sourceAccOpt = accountsRepository.findById(input.getSourceAccount().getId());
        if (sourceAccOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Account sourceAccount = sourceAccOpt.get();

        // 2. Validate Balance
        double amount = input.getAmount();
        if (input.getTransactionType() == TransactionType.WITHDRAWAL || input.getTransactionType() == TransactionType.TRANSFER) {
            if (sourceAccount.getBalance() < amount) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }

        // 3. Create Fresh Transaction Entity
        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setTransactionType(input.getTransactionType());
        transaction.setDescription(input.getDescription());
        transaction.setTransactionDate(input.getTransactionDate() != null ? input.getTransactionDate() : LocalDateTime.now());
        transaction.setSourceAccount(sourceAccount);

        // 4. Handle Account Balances & Destination
        if (transaction.getTransactionType() == TransactionType.WITHDRAWAL || transaction.getTransactionType() == TransactionType.TRANSFER) {
            sourceAccount.setBalance(sourceAccount.getBalance() - amount);
        } else if (transaction.getTransactionType() == TransactionType.DEPOSIT) {
            sourceAccount.setBalance(sourceAccount.getBalance() + amount);
        }

        if (transaction.getTransactionType() == TransactionType.TRANSFER) {
            if (input.getDestinationAccount() == null || (input.getDestinationAccount().getId() == null && input.getDestinationAccount().getAccountNumber() == null)) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            Account destinationAccount;
            if (input.getDestinationAccount().getId() != null) {
                destinationAccount = accountsRepository.findById(input.getDestinationAccount().getId()).orElse(null);
            } else {
                destinationAccount = accountsRepository.findByAccountNumber(input.getDestinationAccount().getAccountNumber()).orElse(null);
            }

            if (destinationAccount == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            destinationAccount.setBalance(destinationAccount.getBalance() + amount);
            // Save destination account first to ensure it's managed
            destinationAccount = accountsRepository.save(destinationAccount);
            transaction.setDestinationAccount(destinationAccount);
        }

        // 5. Finalize
        // Save source account to ensure balance update is persisted
        sourceAccount = accountsRepository.save(sourceAccount);
        transaction.setSourceAccount(sourceAccount);
        
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
