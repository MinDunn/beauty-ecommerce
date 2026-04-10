package com.beauty.ecommerce.product.adapter.out.storage;

import com.beauty.ecommerce.product.application.port.out.UploadImagePort;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component
public class LocalImageUploadAdapter implements UploadImagePort {

    private final Path rootLocation;

    public LocalImageUploadAdapter(@Value("${upload.path:uploads}") String uploadPath) {
        this.rootLocation = Paths.get(uploadPath);
    }

    @Override
    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = UUID.randomUUID().toString() + extension;
            Path destinationFile = rootLocation.resolve(Paths.get(filename)).normalize().toAbsolutePath();

            if (!destinationFile.getParent().equals(rootLocation.toAbsolutePath())) {
                throw new RuntimeException("Cannot store file outside current directory.");
            }

            file.transferTo(destinationFile);
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }
}
