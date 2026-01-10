package com.backend.ega;

import com.backend.ega.entities.Admin;
import com.backend.ega.services.AdminsService;
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
                    admin.setPassword("admin123");  // Le service va l'encoder

                    adminsService.createAdmin(admin);
                    System.out.println("✅ Admin créé avec succès : admin / admin123");
                } else {
                    System.out.println("ℹ️  Admin existe déjà");
                }
            } catch (Exception e) {
                System.err.println("❌ Erreur lors de la création de l'admin : " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}