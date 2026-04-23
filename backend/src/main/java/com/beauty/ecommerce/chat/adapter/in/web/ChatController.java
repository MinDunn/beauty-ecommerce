package com.beauty.ecommerce.chat.adapter.in.web;

import com.beauty.ecommerce.chat.application.dto.ChatterDTO;
import com.beauty.ecommerce.chat.application.service.BotService;
import com.beauty.ecommerce.chat.application.service.ChatService;
import com.beauty.ecommerce.chat.domain.entity.ChatMessage;
import com.beauty.ecommerce.common.dto.ApiResponse;
import com.beauty.ecommerce.common.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final CloudinaryService cloudinaryService;
    private final BotService botService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        log.info("[CHAT] Tin nhắn từ: {} -> {}: {}", 
            chatMessage.getSenderId(), chatMessage.getRecipientId(), chatMessage.getContent());
        ChatMessage savedMessage = chatService.saveMessage(chatMessage);
        
        // Gửi tới hòm thư người nhận
        String recipientDest = "/topic/chat.messages." + savedMessage.getRecipientId();
        messagingTemplate.convertAndSend(recipientDest, savedMessage);
        
        // Gửi tới hòm thư người gửi (xác nhận)
        String senderDest = "/topic/chat.messages." + savedMessage.getSenderId();
        if (!senderDest.equals(recipientDest)) {
            messagingTemplate.convertAndSend(senderDest, savedMessage);
        }
        
        // Thông báo cho admin
        if ("ADMIN".equals(savedMessage.getRecipientId())) {
            messagingTemplate.convertAndSend("/topic/admin.messages", savedMessage);
            
            // Xử lý BOT phản hồi tự động
            botService.getResponse(savedMessage.getContent()).ifPresent(botResponse -> {
                new Thread(() -> {
                    try {
                        Thread.sleep(1500); // Giả lập đang soạn tin
                        ChatMessage botMessage = ChatMessage.builder()
                                .senderId("ADMIN")
                                .senderName("Hệ thống Glowzy")
                                .recipientId(savedMessage.getSenderId())
                                .content(botResponse)
                                .type("ADMIN")
                                .build();
                        
                        ChatMessage savedBotMessage = chatService.saveMessage(botMessage);
                        messagingTemplate.convertAndSend("/topic/chat.messages." + savedMessage.getSenderId(), savedBotMessage);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }).start();
            });
        }
    }

    @PostMapping("/api/chat/upload")
    public ResponseEntity<ApiResponse<String>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {
        String url = cloudinaryService.uploadMedia(file, type);
        return ResponseEntity.ok(ApiResponse.success(url));
    }

    @GetMapping("/api/chat/history/{userId}")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getChatHistory(@PathVariable String userId) {
        List<ChatMessage> history = chatService.getHistory(userId, "ADMIN");
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/api/admin/chat/users")
    public ResponseEntity<ApiResponse<List<ChatterDTO>>> getChatUsers() {
        List<ChatterDTO> users = chatService.getUniqueChatters();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/api/chat/read/{senderId}")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String senderId, @RequestParam String recipientId) {
        chatService.markAsRead(senderId, recipientId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
