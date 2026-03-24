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

    private ContactResponse mapToResponse(ContactJpaEntity entity) {
        return ContactResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .message(entity.getMessage())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
