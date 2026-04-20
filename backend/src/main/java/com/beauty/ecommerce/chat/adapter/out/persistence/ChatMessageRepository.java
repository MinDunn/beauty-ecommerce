package com.beauty.ecommerce.chat.adapter.out.persistence;

import com.beauty.ecommerce.chat.application.dto.ChatterDTO;
import com.beauty.ecommerce.chat.domain.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.senderId = :id1 AND m.recipientId = :id2) OR " +
           "(m.senderId = :id2 AND m.recipientId = :id1) " +
           "ORDER BY m.createdAt ASC")
    List<ChatMessage> findChatHistory(@Param("id1") String id1, @Param("id2") String id2);

    @Query("SELECT new com.beauty.ecommerce.chat.application.dto.ChatterDTO(" +
           "m.senderId, MAX(m.senderName), '', MAX(m.createdAt), " +
           "SUM(CASE WHEN m.isRead = false AND m.recipientId = 'ADMIN' THEN 1L ELSE 0L END)) " +
           "FROM ChatMessage m " +
           "WHERE (m.recipientId = 'ADMIN' AND m.senderId != 'ADMIN') " +
           "GROUP BY m.senderId " +
           "ORDER BY MAX(m.createdAt) DESC")
    List<ChatterDTO> findChatterSummaries();

    long countByRecipientIdAndIsReadFalse(String recipientId);
    
    List<ChatMessage> findByRecipientIdAndSenderIdAndIsReadFalse(String recipientId, String senderId);
}
