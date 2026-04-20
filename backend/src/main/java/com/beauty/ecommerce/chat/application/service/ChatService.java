package com.beauty.ecommerce.chat.application.service;

import com.beauty.ecommerce.chat.adapter.out.persistence.ChatMessageRepository;
import com.beauty.ecommerce.chat.application.dto.ChatterDTO;
import com.beauty.ecommerce.chat.domain.entity.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;

    @Transactional
    public ChatMessage saveMessage(ChatMessage message) {
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getHistory(String userId, String adminId) {
        return chatMessageRepository.findChatHistory(userId, adminId);
    }

    public List<ChatterDTO> getUniqueChatters() {
        return chatMessageRepository.findChatterSummaries();
    }

    @Transactional
    public void markAsRead(String senderId, String recipientId) {
        List<ChatMessage> messages = chatMessageRepository.findByRecipientIdAndSenderIdAndIsReadFalse(recipientId, senderId);
        messages.forEach(m -> m.setRead(true));
        chatMessageRepository.saveAll(messages);
    }
}
