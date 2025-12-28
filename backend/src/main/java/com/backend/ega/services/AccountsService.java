package com.backend.ega.services;

import com.backend.ega.entities.Account;
import com.backend.ega.repositories.AccountsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
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
        Account savedAccount = accountsRepository.save(account);
        return new ResponseEntity<>(savedAccount, HttpStatus.CREATED);
    }

    public ResponseEntity<Account> updateAccount(Long id, Account accountDetails) {
        return accountsRepository.findById(id)
                .map(account -> {
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
}
