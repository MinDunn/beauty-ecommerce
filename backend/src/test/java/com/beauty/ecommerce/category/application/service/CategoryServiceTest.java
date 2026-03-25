package com.beauty.ecommerce.category.application.service;

import com.beauty.ecommerce.category.adapter.in.web.request.CategoryRequest;
import com.beauty.ecommerce.category.adapter.in.web.response.CategoryResponse;
import com.beauty.ecommerce.category.adapter.out.persistence.CategoryJpaEntity;
import com.beauty.ecommerce.category.adapter.out.persistence.CategoryRepository;
import com.beauty.ecommerce.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private CategoryJpaEntity categoryEntity;
    private CategoryRequest categoryRequest;

    @BeforeEach
    void setUp() {
        categoryEntity = CategoryJpaEntity.builder()
                .id(1L)
                .name("Trang điểm")
                .description("Sản phẩm trang điểm")
                .build();

        categoryRequest = CategoryRequest.builder()
                .name("Trang điểm")
                .description("Sản phẩm trang điểm")
                .build();
    }

    @Test
    void getAllCategories_ShouldReturnList() {
        when(categoryRepository.findAll()).thenReturn(Arrays.asList(categoryEntity));

        List<CategoryResponse> result = categoryService.getAllCategories();

        assertEquals(1, result.size());
        assertEquals("Trang điểm", result.get(0).getName());
        verify(categoryRepository, times(1)).findAll();
    }

    @Test
    void createCategory_ShouldReturnResponse() {
        when(categoryRepository.save(any(CategoryJpaEntity.class))).thenReturn(categoryEntity);

        CategoryResponse result = categoryService.createCategory(categoryRequest);

        assertNotNull(result);
        assertEquals("Trang điểm", result.getName());
        verify(categoryRepository, times(1)).save(any(CategoryJpaEntity.class));
    }

    @Test
    void updateCategory_WhenIdExists_ShouldReturnUpdatedResponse() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(categoryEntity));
        when(categoryRepository.save(any(CategoryJpaEntity.class))).thenReturn(categoryEntity);

        CategoryResponse result = categoryService.updateCategory(1L, categoryRequest);

        assertNotNull(result);
        assertEquals("Trang điểm", result.getName());
        verify(categoryRepository, times(1)).findById(1L);
        verify(categoryRepository, times(1)).save(any(CategoryJpaEntity.class));
    }

    @Test
    void updateCategory_WhenIdNotExists_ShouldThrowException() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> 
            categoryService.updateCategory(1L, categoryRequest)
        );
    }

    @Test
    void deleteCategory_WhenIdExists_ShouldCallDelete() {
        when(categoryRepository.existsById(1L)).thenReturn(true);

        categoryService.deleteCategory(1L);

        verify(categoryRepository, times(1)).existsById(1L);
        verify(categoryRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteCategory_WhenIdNotExists_ShouldThrowException() {
        when(categoryRepository.existsById(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> 
            categoryService.deleteCategory(1L)
        );
    }
}
