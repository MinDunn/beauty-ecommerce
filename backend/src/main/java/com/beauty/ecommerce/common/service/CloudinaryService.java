package com.beauty.ecommerce.common.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {
        return uploadMedia(file, "image");
    }

    public String uploadMedia(MultipartFile file, String resourceType) {
        try {
            log.info("Đang tải {} lên Cloudinary: {}", resourceType, file.getOriginalFilename());
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(), 
                ObjectUtils.asMap("resource_type", resourceType));
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            log.error("CRITICAL ERROR: Cloudinary upload failed! Message: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi hệ thống Cloudinary: " + e.getMessage());
        }
    }
}
