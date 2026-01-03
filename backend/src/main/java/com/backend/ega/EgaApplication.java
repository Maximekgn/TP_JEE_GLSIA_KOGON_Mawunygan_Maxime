package com.backend.ega;

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
            if (!adminsService.emailExists("admin@ega.com")) {
                adminsService.createAdmin(
                        "admin",
                        "admin@ega.com",
                        "admin123",
                        "System",
                        "Administrator"
                );
                System.out.println("Default admin user created: admin@ega.com / admin123");
            }
        };
    }
}
