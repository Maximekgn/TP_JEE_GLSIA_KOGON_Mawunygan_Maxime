package com.backend.ega;

import com.backend.ega.entities.Account;
import com.backend.ega.entities.Admin;
import com.backend.ega.entities.Client;
import com.backend.ega.entities.Transaction;
import com.backend.ega.entities.enums.AccountType;
import com.backend.ega.entities.enums.TransactionType;
import com.backend.ega.services.AccountsService;
import com.backend.ega.services.AdminsService;
import com.backend.ega.services.ClientsService;
import com.backend.ega.services.TransactionsService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class EgaApplication {

    public static void main(String[] args) {
        SpringApplication.run(EgaApplication.class, args);
    }

    @Bean
    public CommandLineRunner initAdmin(AdminsService adminsService) {
        return args -> {
            try {
                // Vérifier si l'admin existe
                if (!adminsService.usernameExists("admin")) {
                    Admin admin = new Admin();
                    admin.setUsername("admin");
                    admin.setPassword("admin123"); // Le service va l'encoder

                    adminsService.createAdmin(admin);
                    System.out.println(
                        "✅ Admin créé avec succès : admin / admin123"
                    );
                } else {
                    System.out.println("ℹ️  Admin existe déjà");
                }
            } catch (Exception e) {
                System.err.println(
                    "❌ Erreur lors de la création de l'admin : " +
                        e.getMessage()
                );
                e.printStackTrace();
            }
        };
    }

    @Bean
    public CommandLineRunner initMockData(
        ClientsService clientsService,
        AccountsService accountsService,
        TransactionsService transactionsService
    ) {
        return args -> {
            try {
                // --- Client Alice ---
                if (!clientsService.existsByEmail("alice@example.com")) {
                    Client alice = new Client();
                    alice.setFirst_name("Alice");
                    alice.setLast_name("Dupont");
                    alice.setEmail("alice@example.com");
                    alice.setBirthDate(LocalDate.of(1990, 1, 1));
                    alice.setGender("F");
                    alice.setAddress("1 Rue Principale");
                    alice.setPhoneNumber("123456789");
                    alice.setNationality("TG");
                    alice.setCreatedAt(LocalDateTime.now());
                    alice.setUpdatedAt(LocalDateTime.now());

                    Client savedAlice = clientsService
                        .createClient(alice)
                        .getBody();
                    System.out.println(
                        "✅ Client créé : " +
                            (savedAlice != null
                                ? savedAlice.getEmail()
                                : "null")
                    );

                    if (savedAlice != null) {
                        Account acc1 = new Account();
                        acc1.setAccountNumber(
                            "TG" + (System.currentTimeMillis() % 1000000)
                        );
                        acc1.setAccountType(AccountType.COURANT);
                        acc1.setBalance(1000.0);
                        acc1.setOwner(savedAlice);
                        acc1.setCreatedAt(LocalDateTime.now());
                        acc1.setUpdatedAt(LocalDateTime.now());

                        Account createdAcc1 = accountsService
                            .createAccount(acc1)
                            .getBody();
                        System.out.println(
                            "   ➜ Compte créé pour Alice: " +
                                (createdAcc1 != null
                                    ? createdAcc1.getAccountNumber()
                                    : "null")
                        );

                        if (createdAcc1 != null) {
                            Transaction deposit = new Transaction();
                            deposit.setAmount(500.0);
                            deposit.setTransactionDate(LocalDateTime.now());
                            deposit.setTransactionType(TransactionType.DEPOSIT);
                            deposit.setSourceAccount(createdAcc1);
                            deposit.setDescription("Dépôt initial");
                            deposit.setCreatedAt(LocalDateTime.now());
                            deposit.setUpdatedAt(LocalDateTime.now());
                            transactionsService.createTransaction(deposit);
                            System.out.println(
                                "   ➜ Dépôt initial enregistré pour Alice"
                            );
                        }
                    }
                } else {
                    System.out.println("ℹ️  Client Alice existe déjà");
                }

                // --- Client Bob ---
                if (!clientsService.existsByEmail("bob@example.com")) {
                    Client bob = new Client();
                    bob.setFirst_name("Bob");
                    bob.setLast_name("Martin");
                    bob.setEmail("bob@example.com");
                    bob.setBirthDate(LocalDate.of(1985, 5, 20));
                    bob.setGender("M");
                    bob.setAddress("2 Avenue Secondaire");
                    bob.setPhoneNumber("987654321");
                    bob.setNationality("TG");
                    bob.setCreatedAt(LocalDateTime.now());
                    bob.setUpdatedAt(LocalDateTime.now());

                    Client savedBob = clientsService
                        .createClient(bob)
                        .getBody();
                    System.out.println(
                        "✅ Client créé : " +
                            (savedBob != null ? savedBob.getEmail() : "null")
                    );

                    if (savedBob != null) {
                        Account acc2 = new Account();
                        acc2.setAccountNumber(
                            "TG" + ((System.currentTimeMillis() + 1) % 1000000)
                        );
                        acc2.setAccountType(AccountType.EPARGNE);
                        acc2.setBalance(500.0);
                        acc2.setOwner(savedBob);
                        acc2.setCreatedAt(LocalDateTime.now());
                        acc2.setUpdatedAt(LocalDateTime.now());

                        Account createdAcc2 = accountsService
                            .createAccount(acc2)
                            .getBody();
                        System.out.println(
                            "   ➜ Compte créé pour Bob: " +
                                (createdAcc2 != null
                                    ? createdAcc2.getAccountNumber()
                                    : "null")
                        );
                    }
                } else {
                    System.out.println("ℹ️  Client Bob existe déjà");
                }

                // --- Seed a transfer between two existing accounts if possible ---
                List<Account> accounts = accountsService.getAllAccounts();
                if (accounts.size() >= 2) {
                    Account source = accounts.get(0);
                    Account dest = accounts.get(1);

                    Transaction transfer = new Transaction();
                    transfer.setAmount(100.0);
                    transfer.setTransactionDate(LocalDateTime.now());
                    transfer.setTransactionType(TransactionType.TRANSFER);
                    transfer.setSourceAccount(source);
                    transfer.setDestinationAccount(dest);
                    transfer.setDescription("Virement seed");
                    transfer.setCreatedAt(LocalDateTime.now());
                    transfer.setUpdatedAt(LocalDateTime.now());

                    transactionsService.createTransaction(transfer);
                    System.out.println(
                        "✅ Virement seed créé entre comptes: " +
                            source.getAccountNumber() +
                            " -> " +
                            dest.getAccountNumber()
                    );
                } else {
                    System.out.println(
                        "ℹ️  Pas assez de comptes pour créer un virement seed"
                    );
                }
            } catch (Exception e) {
                System.err.println(
                    "❌ Erreur lors de l'initialisation des données de mock : " +
                        e.getMessage()
                );
                e.printStackTrace();
            }
        };
    }
}
