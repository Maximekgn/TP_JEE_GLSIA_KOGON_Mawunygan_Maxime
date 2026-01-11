package com.backend.ega.services;

import com.backend.ega.entities.Account;
import com.backend.ega.entities.Client;
import com.backend.ega.entities.enums.AccountType;
import com.backend.ega.repositories.AccountsRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.iban4j.CountryCode;
import org.iban4j.Iban;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class AccountsService {

    private final AccountsRepository accountsRepository;
    private final com.backend.ega.repositories.ClientsRepository clientsRepository;

    public AccountsService(
        AccountsRepository accountsRepository,
        com.backend.ega.repositories.ClientsRepository clientsRepository
    ) {
        this.accountsRepository = accountsRepository;
        this.clientsRepository = clientsRepository;
    }

    public List<Account> getAllAccounts() {
        return accountsRepository.findAll();
    }

    public ResponseEntity<Account> getAccountById(Long id) {
        return accountsRepository
            .findById(id)
            .map(account -> new ResponseEntity<>(account, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<Account> createAccount(Account input) {
        if (input.getOwner() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        // Fetch Managed Client
        Optional<Client> clientOpt = clientsRepository.findById(
            input.getOwner().getId()
        );
        if (clientOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Client owner = clientOpt.get();

        // Create Fresh Account Entity
        Account account = new Account();
        account.setOwner(owner);
        account.setAccountType(input.getAccountType());
        account.setBalance(0.0);

        // Ensure timestamps required by validation constraints
        account.setCreatedAt(LocalDateTime.now());
        account.setUpdatedAt(LocalDateTime.now());

        // Generate IBAN if missing
        if (
            input.getAccountNumber() == null ||
            input.getAccountNumber().isBlank()
        ) {
            account.setAccountNumber(generateAccountNumber());
        } else {
            account.setAccountNumber(input.getAccountNumber());
        }

        Account savedAccount = accountsRepository.save(account);
        return new ResponseEntity<>(savedAccount, HttpStatus.CREATED);
    }

    public ResponseEntity<Account> updateAccount(
        Long id,
        Account accountDetails
    ) {
        return accountsRepository
            .findById(id)
            .map(account -> {
                // On peut aussi valider l'IBAN lors de la mise à jour
                account.setAccountNumber(accountDetails.getAccountNumber());
                account.setAccountType(accountDetails.getAccountType());
                account.setBalance(accountDetails.getBalance());

                Account updatedAccount = accountsRepository.save(account);
                return new ResponseEntity<>(updatedAccount, HttpStatus.OK);
            })
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<Void> deleteAccount(Long id) {
        if (accountsRepository.existsById(id)) {
            accountsRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public List<Account> getAccountsByClient(Long clientId) {
        return accountsRepository
            .findAll()
            .stream()
            .filter(account -> account.getOwner().getId() == clientId)
            .collect(Collectors.toList());
    }

    /**
     * Crée un compte pour un client avec un type spécifique
     * @param client le propriétaire du compte
     * @param accountType le type de compte (SAVINGS ou CHECKING)
     * @return le compte créé
     */
    public Account createAccountForClient(
        Client client,
        AccountType accountType
    ) {
        // Générer un numéro de compte unique au format IBAN
        String accountNumber = generateAccountNumber();

        Account account = new Account();
        account.setAccountNumber(accountNumber);
        account.setAccountType(accountType);
        account.setOwner(client);

        account.setBalance(0.0);

        return accountsRepository.save(account);
    }

    /**
     * Génère un numéro de compte unique au format IBAN
     * Utilise iban4j pour garantir la validité du format
     */
    private String generateAccountNumber() {
        // Le code pays Togo (TG) n'est pas supporté par la bibliothèque iban4j.
        // On génère donc un numéro de compte aléatoire respectant le format local.
        StringBuilder sb = new StringBuilder("TG");
        String chars = "0123456789";
        java.util.Random rnd = new java.util.Random();
        for (int i = 0; i < 26; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
