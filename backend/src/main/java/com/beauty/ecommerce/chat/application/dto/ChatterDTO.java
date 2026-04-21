package com.beauty.ecommerce.chat.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatterDTO {
    private String userId;
    private String senderName;
    private String lastMessage;
    private Instant lastMessageTime;
    private long unreadCount;
}
