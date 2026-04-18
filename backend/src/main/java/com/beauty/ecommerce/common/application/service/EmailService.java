package com.beauty.ecommerce.common.application.service;

import com.beauty.ecommerce.order.domain.entity.Order;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOrderConfirmationEmail(Order order, String customerEmail) {
        try {
            log.info("Preparing to send order confirmation email for order #{}", order.getId());
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            Context context = new Context();
            Map<String, Object> variables = new HashMap<>();
            variables.put("order", order);
            context.setVariables(variables);

            String html = templateEngine.process("order-confirmation", context);

            helper.setFrom(fromEmail);
            helper.setTo(customerEmail);
            helper.setSubject("Xác nhận đơn hàng #" + order.getId() + " - Beauty E-commerce");
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Order confirmation email sent successfully to {}", customerEmail);
        } catch (MessagingException e) {
            log.error("Failed to send order confirmation email for order #{}", order.getId(), e);
        } catch (Exception e) {
            log.error("Unexpected error while sending email", e);
        }
    }

    public void sendForgotPasswordEmail(String email, String fullName, String resetLink) {
        try {
            log.info("Preparing to send forgot password email for: {}", email);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("resetLink", resetLink);

            String html = templateEngine.process("forgot-password", context);

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Đặt lại mật khẩu - Glowzy Beauty");
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Forgot password email sent successfully to {}", email);
        } catch (Exception e) {
            log.error("Failed to send forgot password email for: {}", email, e);
        }
    }

    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text);

            mailSender.send(message);
            log.info("Simple email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send simple email to: {}", to, e);
        }
    }
}
