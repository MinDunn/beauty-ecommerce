package com.beauty.ecommerce.contact.application.service;

import com.beauty.ecommerce.contact.adapter.in.web.request.CreateContactRequest;
import com.beauty.ecommerce.contact.adapter.in.web.response.ContactResponse;
import com.beauty.ecommerce.contact.adapter.out.persistence.ContactJpaEntity;
import com.beauty.ecommerce.contact.adapter.out.persistence.ContactRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactService {

    private final ContactRepository contactRepository;

    public ContactResponse createContact(CreateContactRequest request) {
        log.info("Nhận phản hồi mới từ: {}", request.getEmail());
        ContactJpaEntity contact = ContactJpaEntity.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .message(request.getMessage())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        contactRepository.save(contact);

        return mapToResponse(contact);
    }

    public List<ContactResponse> getAllContacts() {
        return contactRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteContact(Long id) {
        log.info("Admin đang xóa phản hồi id: {}", id);
        contactRepository.deleteById(id);
    }

    public void markAsRead(Long id) {
        log.info("Admin đánh dấu đã đọc phản hồi id: {}", id);
        ContactJpaEntity contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phản hồi"));
        contact.setIsRead(true);
        contactRepository.save(contact);
    }

    private ContactResponse mapToResponse(ContactJpaEntity entity) {
        return ContactResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .message(entity.getMessage())
                .isRead(entity.getIsRead() != null ? entity.getIsRead() : false)
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() + "Z" : "")
                .build();
    }
}
