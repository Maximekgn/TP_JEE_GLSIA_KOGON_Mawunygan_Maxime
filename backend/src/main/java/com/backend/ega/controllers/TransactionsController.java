package com.backend.ega.controllers;

import com.backend.ega.entities.Transaction;
import com.backend.ega.entities.enums.TransactionType;
import com.backend.ega.services.TransactionsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionsController {

    private final TransactionsService transactionsService;

    public TransactionsController(TransactionsService transactionsService) {
        this.transactionsService = transactionsService;
    }

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionsService.getAllTransactions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        return transactionsService.getTransactionById(id);
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@Valid @RequestBody Transaction transaction) {
        return transactionsService.createTransaction(transaction);
    }

    @PostMapping("/deposit")
    public ResponseEntity<Transaction> deposit(@Valid @RequestBody Transaction transaction) {
        transaction.setTransactionType(TransactionType.DEPOSIT);
        return transactionsService.createTransaction(transaction);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Transaction> withdraw(@Valid @RequestBody Transaction transaction) {
        transaction.setTransactionType(TransactionType.WITHDRAWAL);
        return transactionsService.createTransaction(transaction);
    }

    @PostMapping("/transfer")
    public ResponseEntity<Transaction> transfer(@Valid @RequestBody Transaction transaction) {
        transaction.setTransactionType(TransactionType.TRANSFER);
        return transactionsService.createTransaction(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        return transactionsService.deleteTransaction(id);
    }

    @GetMapping("/account/{accountId}")
    public List<Transaction> getTransactionsByAccount(@PathVariable Long accountId) {
        return transactionsService.getTransactionsByAccount(accountId);
    }

    @GetMapping("/account/{accountId}/date-range")
    public List<Transaction> getTransactionsByAccountAndDate(
            @PathVariable Long accountId,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate) {
        return transactionsService.getTransactionsByAccountAndDate(
                accountId,
                java.time.LocalDateTime.parse(startDate),
                java.time.LocalDateTime.parse(endDate)
        );
    }

    @GetMapping("/account/{accountId}/statement")
    public ResponseEntity<String> getAccountStatement(
            @PathVariable Long accountId,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate) {
        String statement = transactionsService.generateStatement(
                accountId,
                java.time.LocalDateTime.parse(startDate),
                java.time.LocalDateTime.parse(endDate)
        );
        return ResponseEntity.ok(statement);
    }
}
