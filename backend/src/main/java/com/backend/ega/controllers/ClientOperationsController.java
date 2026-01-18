package com.backend.ega.controllers;

import com.backend.ega.entities.Account;
import com.backend.ega.entities.Transaction;
import com.backend.ega.entities.enums.TransactionType;
import com.backend.ega.repositories.AccountsRepository;
import com.backend.ega.repositories.ClientsRepository;
import com.backend.ega.repositories.TransactionsRepository;
import com.backend.ega.services.ClientAuthService;
import com.backend.ega.services.TransactionsService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur pour les opérations des clients connectés
 * Toutes les routes requièrent une authentification JWT
 */
@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "*")
public class ClientOperationsController {

    private static final Logger logger = LoggerFactory.getLogger(
        ClientOperationsController.class
    );

    @Autowired
    private ClientAuthService clientAuthService;

    @Autowired
    private AccountsRepository accountsRepository;

    @Autowired
    private TransactionsRepository transactionsRepository;

    @Autowired
    private TransactionsService transactionsService;

    @Autowired
    private ClientsRepository clientsRepository;

    /**
     * Récupère tous les comptes du client connecté
     */
    @GetMapping("/accounts")
    public ResponseEntity<?> getMyAccounts(
        @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Long clientId = clientAuthService.extractClientIdFromToken(authHeader);

            List<Account> accounts = accountsRepository
                .findAll()
                .stream()
                .filter(account ->
                    account.getOwner().getId().equals(clientId)
                )
                .collect(Collectors.toList());

            return ResponseEntity.ok(accounts);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Non autorisé", "message", e.getMessage())
            );
        } catch (Exception e) {
            logger.error("Erreur: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Erreur serveur", "message", e.getMessage())
            );
        }
    }

    /**
     * Récupère un compte spécifique du client
     */
    @GetMapping("/accounts/{accountId}")
    public ResponseEntity<?> getMyAccount(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long accountId
    ) {
        try {
            Long clientId = clientAuthService.extractClientIdFromToken(authHeader);

            Account account = accountsRepository
                .findById(accountId)
                .orElseThrow(() ->
                    new IllegalArgumentException("Compte non trouvé")
                );

            // Vérifier que le compte appartient au client
            if (!account.getOwner().getId().equals(clientId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of(
                        "error", "Accès refusé",
                        "message", "Ce compte ne vous appartient pas"
                    )
                );
            }

            return ResponseEntity.ok(account);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Non autorisé", "message", e.getMessage())
            );
        } catch (Exception e) {
            logger.error("Erreur: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Erreur serveur", "message", e.getMessage())
            );
        }
    }

    /**
     * Effectue un dépôt sur un compte du client
     */
    @PostMapping("/accounts/{accountId}/deposit")
    public ResponseEntity<?> deposit(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long accountId,
        @Valid @RequestBody Map<String, Object> request
    ) {
        try {
            Long clientId = clientAuthService.extractClientIdFromToken(authHeader);

            Account account = accountsRepository
                .findById(accountId)
                .orElseThrow(() ->
                    new IllegalArgumentException("Compte non trouvé")
                );

            if (!account.getOwner().getId().equals(clientId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of(
                        "error", "Accès refusé",
                        "message", "Ce compte ne vous appartient pas"
                    )
                );
            }

            Double amount = ((Number) request.get("amount")).doubleValue();
            if (amount == null || amount <= 0) {
                return ResponseEntity.badRequest().body(
                    Map.of(
                        "error", "Montant invalide",
                        "message", "Le montant doit être positif"
                    )
                );
            }

            Transaction transaction = new Transaction();
            transaction.setAmount(amount);
            transaction.setTransactionType(TransactionType.DEPOSIT);
            transaction.setSourceAccount(account);
            transaction.setDescription(
                request.containsKey("description")
                    ? (String) request.get("description")
                    : "Dépôt"
            );

            ResponseEntity<Transaction> result = transactionsService.createTransaction(
                transaction
            );

            if (result.getStatusCode() == HttpStatus.CREATED) {
                return ResponseEntity.ok(
                    Map.of(
                        "message", "Dépôt effectué avec succès",
                        "transaction", result.getBody()
                    )
                );
            } else {
                return ResponseEntity.status(result.getStatusCode()).body(
                    Map.of(
                        "error", "Échec du dépôt",
                        "message", "Impossible d'effectuer le dépôt"
                    )
                );
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Non autorisé", "message", e.getMessage())
            );
        } catch (Exception e) {
            logger.error("Erreur: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Erreur serveur", "message", e.getMessage())
            );
        }
    }

    /**
     * Effectue un retrait sur un compte du client
     */
    @PostMapping("/accounts/{accountId}/withdraw")
    public ResponseEntity<?> withdraw(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long accountId,
        @Valid @RequestBody Map<String, Object> request
    ) {
        try {
            Long clientId = clientAuthService.extractClientIdFromToken(authHeader);

            Account account = accountsRepository
                .findById(accountId)
                .orElseThrow(() ->
                    new IllegalArgumentException("Compte non trouvé")
                );

            if (!account.getOwner().getId().equals(clientId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of(
                        "error", "Accès refusé",
                        "message", "Ce compte ne vous appartient pas"
                    )
                );
            }

            Double amount = ((Number) request.get("amount")).doubleValue();
            if (amount == null || amount <= 0) {
                return ResponseEntity.badRequest().body(
                    Map.of(
                        "error", "Montant invalide",
                        "message", "Le montant doit être positif"
                    )
                );
            }

            if (account.getBalance() < amount) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of(
                        "error", "Solde insuffisant",
                        "message", "Le solde de votre compte est insuffisant"
                    )
                );
            }

            Transaction transaction = new Transaction();
            transaction.setAmount(amount);
            transaction.setTransactionType(TransactionType.WITHDRAWAL);
            transaction.setSourceAccount(account);
            transaction.setDescription(
                request.containsKey("description")
                    ? (String) request.get("description")
                    : "Retrait"
            );

            ResponseEntity<Transaction> result = transactionsService.createTransaction(
                transaction
            );

            if (result.getStatusCode() == HttpStatus.CREATED) {
                return ResponseEntity.ok(
                    Map.of(
                        "message", "Retrait effectué avec succès",
                        "transaction", result.getBody()
                    )
                );
            } else {
                return ResponseEntity.status(result.getStatusCode()).body(
                    Map.of(
                        "error", "Échec du retrait",
                        "message", "Impossible d'effectuer le retrait"
                    )
                );
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Non autorisé", "message", e.getMessage())
            );
        } catch (Exception e) {
            logger.error("Erreur: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Erreur serveur", "message", e.getMessage())
            );
        }
    }

    /**
     * Effectue un virement depuis un compte du client vers un autre compte
     */
    @PostMapping("/accounts/{accountId}/transfer")
    public ResponseEntity<?> transfer(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long accountId,
        @Valid @RequestBody Map<String, Object> request
    ) {
        try {
            Long clientId = clientAuthService.extractClientIdFromToken(authHeader);

            Account sourceAccount = accountsRepository
                .findById(accountId)
                .orElseThrow(() ->
                    new IllegalArgumentException("Compte source non trouvé")
                );

            if (!sourceAccount.getOwner().getId().equals(clientId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of(
                        "error", "Accès refusé",
                        "message", "Ce compte ne vous appartient pas"
                    )
                );
            }

            Double amount = ((Number) request.get("amount")).doubleValue();
            String destinationAccountNumber = (String) request.get(
                "destination_account_number"
            );
            Number destinationAccountId = (Number) request.get(
                "destination_account_id"
            );

            if (amount == null || amount <= 0) {
                return ResponseEntity.badRequest().body(
                    Map.of(
                        "error", "Montant invalide",
                        "message", "Le montant doit être positif"
                    )
                );
            }

            if (
                (destinationAccountNumber == null ||
                destinationAccountNumber.isBlank()) && 
                destinationAccountId == null
            ) {
                return ResponseEntity.badRequest().body(
                    Map.of(
                        "error", "Compte destination manquant",
                        "message", "Le numéro de compte ou l'ID du compte destination est requis"
                    )
                );
            }

            if (sourceAccount.getBalance() < amount) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of(
                        "error", "Solde insuffisant",
                        "message", "Le solde de votre compte est insuffisant"
                    )
                );
            }

            Account destinationAccount = null;
            if (destinationAccountId != null) {
                destinationAccount = accountsRepository
                    .findById(destinationAccountId.longValue())
                    .orElseThrow(() ->
                        new IllegalArgumentException("Compte destination non trouvé")
                    );
            } else {
                destinationAccount = accountsRepository
                    .findByAccountNumber(destinationAccountNumber)
                    .orElseThrow(() ->
                        new IllegalArgumentException("Compte destination non trouvé")
                    );
            }

            Transaction transaction = new Transaction();
            transaction.setAmount(amount);
            transaction.setTransactionType(TransactionType.TRANSFER);
            transaction.setSourceAccount(sourceAccount);
            transaction.setDestinationAccount(destinationAccount);
            transaction.setDescription(
                request.containsKey("description")
                    ? (String) request.get("description")
                    : "Virement"
            );

            ResponseEntity<Transaction> result = transactionsService.createTransaction(
                transaction
            );

            if (result.getStatusCode() == HttpStatus.CREATED) {
                return ResponseEntity.ok(
                    Map.of(
                        "message", "Virement effectué avec succès",
                        "transaction", result.getBody()
                    )
                );
            } else {
                return ResponseEntity.status(result.getStatusCode()).body(
                    Map.of(
                        "error", "Échec du virement",
                        "message", "Impossible d'effectuer le virement"
                    )
                );
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Non autorisé", "message", e.getMessage())
            );
        } catch (Exception e) {
            logger.error("Erreur: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Erreur serveur", "message", e.getMessage())
            );
        }
    }

    /**
     * Récupère l'historique des transactions d'un compte
     */
    @GetMapping("/accounts/{accountId}/transactions")
    public ResponseEntity<?> getAccountTransactions(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long accountId
    ) {
        try {
            Long clientId = clientAuthService.extractClientIdFromToken(authHeader);

            Account account = accountsRepository
                .findById(accountId)
                .orElseThrow(() ->
                    new IllegalArgumentException("Compte non trouvé")
                );

            if (!account.getOwner().getId().equals(clientId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of(
                        "error", "Accès refusé",
                        "message", "Ce compte ne vous appartient pas"
                    )
                );
            }

            List<Transaction> transactions = transactionsService.getTransactionsByAccount(
                accountId
            );

            return ResponseEntity.ok(transactions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Non autorisé", "message", e.getMessage())
            );
        } catch (Exception e) {
            logger.error("Erreur: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Erreur serveur", "message", e.getMessage())
            );
        }
    }

    /**
     * Génère un relevé bancaire pour un compte entre deux dates
     */
    @GetMapping("/accounts/{accountId}/statement")
    public ResponseEntity<?> getAccountStatement(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long accountId,
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate
    ) {
        try {
            Long clientId = clientAuthService.extractClientIdFromToken(authHeader);

            Account account = accountsRepository
                .findById(accountId)
                .orElseThrow(() ->
                    new IllegalArgumentException("Compte non trouvé")
                );

            if (!account.getOwner().getId().equals(clientId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of(
                        "error", "Accès refusé",
                        "message", "Ce compte ne vous appartient pas"
                    )
                );
            }

            LocalDateTime start = startDate != null
                ? LocalDate.parse(startDate).atStartOfDay()
                : LocalDateTime.now().minusMonths(1);

            LocalDateTime end = endDate != null
                ? LocalDate.parse(endDate).atTime(23, 59, 59)
                : LocalDateTime.now();

            List<Transaction> transactions = transactionsService
                .getTransactionsByAccount(accountId)
                .stream()
                .filter(t ->
                    t.getTransactionDate().isAfter(start) &&
                    t.getTransactionDate().isBefore(end)
                )
                .collect(Collectors.toList());

            Map<String, Object> statement = new HashMap<>();
            statement.put("account", account);
            statement.put("start_date", start);
            statement.put("end_date", end);
            statement.put("transactions", transactions);
            statement.put("current_balance", account.getBalance());

            return ResponseEntity.ok(statement);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Non autorisé", "message", e.getMessage())
            );
        } catch (Exception e) {
            logger.error("Erreur: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Erreur serveur", "message", e.getMessage())
            );
        }
    }

    /**
     * Récupère toutes les transactions de tous les comptes du client connecté
     */
    @GetMapping("/transactions")
    public ResponseEntity<?> getMyAllTransactions(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate
    ) {
        try {
            Long clientId = clientAuthService.extractClientIdFromToken(authHeader);
            List<Transaction> transactions = transactionsRepository.findByClientId(clientId);

            if (startDate != null || endDate != null) {
                LocalDateTime start = startDate != null
                    ? LocalDate.parse(startDate).atStartOfDay()
                    : LocalDateTime.now().minusYears(10);
                LocalDateTime end = endDate != null
                    ? LocalDate.parse(endDate).atTime(23, 59, 59)
                    : LocalDateTime.now();

                transactions = transactions.stream()
                    .filter(t -> t.getTransactionDate().isAfter(start) && t.getTransactionDate().isBefore(end))
                    .collect(Collectors.toList());
            }

            return ResponseEntity.ok(transactions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Non autorisé", "message", e.getMessage())
            );
        } catch (Exception e) {
            logger.error("Erreur: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Erreur serveur", "message", e.getMessage())
            );
        }
    }

    /**
     * Récupère les détails d'une transaction spécifique
     */
    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<?> getTransactionDetails(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long transactionId
    ) {
        try {
            Long clientId = clientAuthService.extractClientIdFromToken(authHeader);

            Transaction transaction = transactionsRepository
                .findById(transactionId)
                .orElseThrow(() ->
                    new IllegalArgumentException("Transaction non trouvée")
                );

            // Vérifier que la transaction appartient à l'un des comptes du client
            boolean isOwner = (transaction.getSourceAccount() != null && transaction.getSourceAccount().getOwner().getId().equals(clientId)) ||
                              (transaction.getDestinationAccount() != null && transaction.getDestinationAccount().getOwner().getId().equals(clientId));

            if (!isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of(
                        "error", "Accès refusé",
                        "message", "Vous n'avez pas accès à cette transaction"
                    )
                );
            }

            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Non autorisé", "message", e.getMessage())
            );
        } catch (Exception e) {
            logger.error("Erreur: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Erreur serveur", "message", e.getMessage())
            );
        }
    }
}
