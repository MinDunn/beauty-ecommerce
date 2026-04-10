package com.beauty.ecommerce.product.application.port.out;

import org.springframework.web.multipart.MultipartFile;

public interface UploadImagePort {
    String uploadFile(MultipartFile file);
}
