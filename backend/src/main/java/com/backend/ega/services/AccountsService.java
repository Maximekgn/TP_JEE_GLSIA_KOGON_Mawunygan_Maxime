package com.backend.ega.services;

import com.backend.ega.entities.Account;
import com.backend.ega.entities.Client;
import com.backend.ega.entities.enums.AccountType;
import com.backend.ega.repositories.AccountsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import org.iban4j.CountryCode;
import org.iban4j.Iban;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AccountsService {

    private final AccountsRepository accountsRepository;

    public AccountsService(AccountsRepository accountsRepository) {
        this.accountsRepository = accountsRepository;
    }

    public List<Account> getAllAccounts() {
        return accountsRepository.findAll();
    }

    public ResponseEntity<Account> getAccountById(Long id) {
        return accountsRepository.findById(id)
                .map(account -> new ResponseEntity<>(account, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<Account> createAccount(Account account) {
        // Forcer la balance à 0 pour tout nouveau compte
        account.setBalance(0.0);
        
        // Fixer la date de création à aujourd'hui si elle n'est pas déjà définie
        if (account.getCreationDate() == null) {
            account.setCreationDate(LocalDate.now());
        }

        // Si le numéro de compte n'est pas fourni, on en génère un au format IBAN
        if (account.getAccountNumber() == null || account.getAccountNumber().isBlank()) {
            account.setAccountNumber(generateAccountNumber());
        }
        
        Account savedAccount = accountsRepository.save(account);
        return new ResponseEntity<>(savedAccount, HttpStatus.CREATED);
    }

    public ResponseEntity<Account> updateAccount(Long id, Account accountDetails) {
        return accountsRepository.findById(id)
                .map(account -> {
                    // On peut aussi valider l'IBAN lors de la mise à jour
                    account.setAccountNumber(accountDetails.getAccountNumber());
                    account.setAccountType(accountDetails.getAccountType());
                    account.setCreationDate(accountDetails.getCreationDate());
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
        return accountsRepository.findAll().stream()
                .filter(account -> account.getOwner().getId().equals(clientId))
                .collect(Collectors.toList());
    }

    /**
     * Crée un compte pour un client avec un type spécifique
     * @param client le propriétaire du compte
     * @param accountType le type de compte (SAVINGS ou CHECKING)
     * @return le compte créé
     */
    public Account createAccountForClient(Client client, AccountType accountType) {
        // Générer un numéro de compte unique au format IBAN
        String accountNumber = generateAccountNumber();

        Account account = new Account();
        account.setAccountNumber(accountNumber);
        account.setAccountType(accountType);
        account.setOwner(client);
        account.setCreationDate(LocalDate.now());
        account.setBalance(0.0);

        return accountsRepository.save(account);
    }

    /**
     * Génère un numéro de compte unique au format IBAN
     * Utilise iban4j pour garantir la validité du format
     */
    private String generateAccountNumber() {
        // On utilise strictement le code pays Togo (TG) pour l'IBAN
        // car le projet est localisé dans la zone UEMOA
        return Iban.random(CountryCode.TG).toString();
    }
}
