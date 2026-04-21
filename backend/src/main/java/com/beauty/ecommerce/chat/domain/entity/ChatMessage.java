package com.beauty.ecommerce.chat.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String senderId;

    @Column(length = 100)
    private String senderName;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String recipientId = "ADMIN";

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String mediaUrl;

    @Column(length = 20)
    private String mediaType; // IMAGE, VIDEO

    @Column(nullable = false, length = 20)
    private String type; // USER, GUEST, ADMIN

    @Builder.Default
    @Column(nullable = false)
    private boolean isRead = false;

    @CreationTimestamp
    private Instant createdAt;
}
