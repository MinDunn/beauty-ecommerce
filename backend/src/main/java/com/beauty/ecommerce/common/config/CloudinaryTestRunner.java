package com.beauty.ecommerce.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CloudinaryTestRunner implements CommandLineRunner {

    @Value("${spring.cloudinary.cloud-name}")
    private String cloudName;

    @Value("${spring.cloudinary.api-key}")
    private String apiKey;

    @Value("${spring.cloudinary.api-secret}")
    private String apiSecret;

    @Override
    public void run(String... args) throws Exception {
        System.out.println(">>> TESTING CLOUDINARY CONFIG");
        System.out.println(">>> Cloud Name: " + cloudName);
        System.out.println(">>> API Key: " + (apiKey != null ? (apiKey.length() > 4 ? apiKey.substring(0, 4) + "..." : "SET") : "NOT SET"));
        
        if ("name".equals(cloudName) || "key".equals(apiKey) || "secret".equals(apiSecret)) {
            System.err.println(">>> WARNING: Cloudinary credentials appear to be using DEFAULT PLACEHOLDERS!");
            System.err.println(">>> Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET env vars.");
        } else {
            System.out.println(">>> Cloudinary credentials seem to be customized.");
        }
    }
}
