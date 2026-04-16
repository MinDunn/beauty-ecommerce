package com.beauty.ecommerce;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EcommerceApplication {

    public static void main(String[] args) {
        // Load .env from current directory or root directory (one level up)
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();
        
        if (dotenv.get("DB_URL") == null) {
            dotenv = Dotenv.configure()
                    .directory("..")
                    .ignoreIfMissing()
                    .load();
        }
        
        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });

        // DEBUG: Verify connection URL
        String dbUrl = System.getProperty("DB_URL");
        System.out.println("\n>>> [DEBUG] DATABASE CONNECTION INFO");
        if (dbUrl != null) {
            String maskedUrl = dbUrl.contains("@") 
                ? dbUrl.substring(0, dbUrl.indexOf(":") + 3) + "..." + dbUrl.substring(dbUrl.indexOf("@"))
                : dbUrl;
            System.out.println(">>> Target DB: " + maskedUrl);
        } else {
            System.err.println(">>> WARNING: DB_URL NOT FOUND IN ENVIRONMENT OR .ENV FILE!");
        }
        System.out.println(">>> [DEBUG] END CONNECTION INFO\n");

        SpringApplication.run(EcommerceApplication.class, args);
    }

}
