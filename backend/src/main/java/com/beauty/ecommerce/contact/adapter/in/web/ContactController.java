package com.beauty.ecommerce.contact.adapter.in.web;

import com.beauty.ecommerce.common.dto.ApiResponse;
import com.beauty.ecommerce.contact.adapter.in.web.request.CreateContactRequest;
import com.beauty.ecommerce.contact.adapter.in.web.response.ContactResponse;
import com.beauty.ecommerce.contact.application.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ContactController {

    private final ContactService contactService;

    // Public - Khách hàng gửi feedback
    @PostMapping("/api/contacts")
    public ResponseEntity<ApiResponse<ContactResponse>> createContact(
            @Valid @RequestBody CreateContactRequest request) {
        log.info("Nhận yêu cầu gửi feedback từ: {}", request.getEmail());
        ContactResponse response = contactService.createContact(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Gửi phản hồi thành công", response));
    }

    // Admin only - Xem danh sách feedback
    @GetMapping("/api/admin/contacts")
    public ResponseEntity<ApiResponse<List<ContactResponse>>> getAllContacts() {
        log.info("Admin đang truy cập danh sách feedback");
        List<ContactResponse> contacts = contactService.getAllContacts();
        return ResponseEntity.ok(ApiResponse.success(contacts));
    }

    @DeleteMapping("/api/admin/contacts/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContact(@PathVariable Long id) {
        log.info("Admin yêu cầu xóa phản hồi id: {}", id);
        contactService.deleteContact(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phản hồi thành công", null));
    }

    @PatchMapping("/api/admin/contacts/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        log.info("Admin yêu cầu đánh dấu đã đọc phản hồi id: {}", id);
        contactService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu là đã đọc", null));
    }
}
