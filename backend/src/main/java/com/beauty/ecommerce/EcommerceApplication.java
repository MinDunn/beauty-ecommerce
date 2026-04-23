package com.beauty.ecommerce;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class EcommerceApplication {

    @PostConstruct
    public void init() {
        // Thiết lập múi giờ Việt Nam
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        System.out.println(">>> [CONFIG] Ứng dụng đã được thiết lập múi giờ: " + TimeZone.getDefault().getID());
    }

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
        
        // REPAIR FLYWAY: Remove failed V40 if exists
        try (java.sql.Connection conn = java.sql.DriverManager.getConnection(
                System.getProperty("DB_URL"),
                System.getProperty("DB_USERNAME"),
                System.getProperty("DB_PASSWORD"))) {
            try (java.sql.Statement stmt = conn.createStatement()) {
                stmt.execute("DELETE FROM flyway_schema_history WHERE version = '40' AND success = 0");
                System.out.println(">>> [FLYWAY REPAIR] Cleaned up failed migration V40 if any existed.");
            }
        } catch (Exception e) {
            System.err.println(">>> [FLYWAY REPAIR] Note: Skipping auto-repair (DB may be unreachable yet or table missing): " + e.getMessage());
        }

        SpringApplication.run(EcommerceApplication.class, args);
    }

}
