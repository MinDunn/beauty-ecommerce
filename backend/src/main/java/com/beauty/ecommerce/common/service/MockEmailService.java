package com.beauty.ecommerce.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MockEmailService implements EmailService {

    @Override
    public void sendSimpleMessage(String to, String subject, String text) {
        log.info("📧 MOCK EMAIL SENT to: {}", to);
        log.info("Subject: {}", subject);
        log.info("Content: {}", text);
        log.info("--------------------------------------------------");
    }
}
