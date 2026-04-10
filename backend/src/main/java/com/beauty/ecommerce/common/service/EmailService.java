package com.beauty.ecommerce.common.service;

public interface EmailService {
    void sendSimpleMessage(String to, String subject, String text);
}
