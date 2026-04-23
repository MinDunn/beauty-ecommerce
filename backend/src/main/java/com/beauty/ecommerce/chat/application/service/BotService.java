package com.beauty.ecommerce.chat.application.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class BotService {

    private final Map<String, String> responses = new HashMap<>();

    public BotService() {
        responses.put("🔍 Kiểm tra đơn hàng", 
            "Glowzy xin chào! Để kiểm tra đơn hàng, bạn vui lòng cung cấp **Mã đơn hàng** hoặc **Số điện thoại** đặt hàng để hệ thống tra cứu giúp bạn ngay nhé! 📦");
        
        responses.put("🌿 Tư vấn chọn sản phẩm", 
            "Chào bạn! Bạn đang quan tâm đến dòng sản phẩm nào (Làm sạch, Dưỡng ẩm, hay Đặc trị mụn...) và thuộc loại da gì để Glowzy tư vấn kỹ hơn cho bạn ạ? ✨");
        
        responses.put("🎁 Khuyến mãi hiện có", 
            "Hiện tại Glowzy đang có chương trình 'DEAL HÈ RỰC RỠ' giảm đến 30% cho các dòng Kem chống nắng và Voucher 20k cho đơn từ 299k. Bạn có muốn nhận link xem chi tiết không ạ? 🔥");
        
        responses.put("👩‍💼 Gặp tư vấn viên", 
            "Dạ vâng, yêu cầu của bạn đã được chuyển đến tư vấn viên. Vui lòng đợi trong giây lát, chúng tôi sẽ phản hồi bạn ngay ạ! 🎧");
    }

    public Optional<String> getResponse(String content) {
        if (content == null) return Optional.empty();
        
        // Match exact keyword
        if (responses.containsKey(content)) {
            return Optional.of(responses.get(content));
        }
        
        // Basic keyword matching for natural language
        String lowerContent = content.toLowerCase();
        if (lowerContent.contains("đơn hàng") || lowerContent.contains("tra cứu")) {
            return Optional.of(responses.get("🔍 Kiểm tra đơn hàng"));
        }
        if (lowerContent.contains("tư vấn") || lowerContent.contains("chọn sản phẩm") || lowerContent.contains("loại da")) {
            return Optional.of(responses.get("🌿 Tư vấn chọn sản phẩm"));
        }
        if (lowerContent.contains("khuyến mãi") || lowerContent.contains("giảm giá") || lowerContent.contains("voucher")) {
            return Optional.of(responses.get("🎁 Khuyến mãi hiện có"));
        }
        
        return Optional.empty();
    }
}
