package com.beauty.ecommerce.category.application.service;

import com.beauty.ecommerce.category.adapter.in.web.request.CategoryRequest;
import com.beauty.ecommerce.category.adapter.in.web.response.CategoryResponse;
import com.beauty.ecommerce.category.adapter.out.persistence.CategoryJpaEntity;
import com.beauty.ecommerce.category.adapter.out.persistence.CategoryRepository;
import com.beauty.ecommerce.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        log.info("Lấy tất cả danh mục");
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        log.info("Tạo danh mục mới: {}", request.getName());
        CategoryJpaEntity category = CategoryJpaEntity.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        log.info("Cập nhật danh mục ID {}: {}", id, request.getName());
        CategoryJpaEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với id: " + id));
        
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        
        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        log.info("Xóa danh mục ID {}", id);
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy danh mục với id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryResponse mapToResponse(CategoryJpaEntity entity) {
        return CategoryResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .build();
    }
}
