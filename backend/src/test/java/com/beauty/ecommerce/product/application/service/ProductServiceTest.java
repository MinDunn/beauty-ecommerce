package com.beauty.ecommerce.product.application.service;

import com.beauty.ecommerce.common.exception.ResourceNotFoundException;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import com.beauty.ecommerce.product.adapter.out.persistence.mapper.ProductMapper;
import com.beauty.ecommerce.product.domain.entity.Product;
import com.beauty.ecommerce.review.adapter.out.persistence.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductReaderService productService;

    private ProductJpaEntity productEntity;

    @BeforeEach
    void setUp() {
        productEntity = ProductJpaEntity.builder()
                .id(1L)
                .name("Son môi")
                .description("Son môi đỏ quyến rũ")
                .originalPrice(new BigDecimal("200000"))
                .currentPrice(new BigDecimal("150000"))
                .stockQuantity(10)
                .imageUrl("son.jpg")
                .categoryId(1L)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @SuppressWarnings("unchecked")
    void getAllProducts_ShouldReturnPage() {
        Product domainProduct = Product.builder().id(1L).name("Son môi").build();
        Page<ProductJpaEntity> productPage = new PageImpl<>(Arrays.asList(productEntity));
        
        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(productPage);
        when(productMapper.mapToDomainEntity(any(ProductJpaEntity.class)))
                .thenReturn(domainProduct);

        Page<Product> result = productService.getAllProducts(1L, null, null, "son", "latest", null, null, false, Pageable.unpaged());

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Son môi", result.getContent().get(0).getName());
    }

    @Test
    void getProductById_WhenExists_ShouldReturnResponse() {
        Product domainProduct = Product.builder().id(1L).name("Son môi").build();
        when(productRepository.findById(1L)).thenReturn(Optional.of(productEntity));
        when(productMapper.mapToDomainEntity(any(ProductJpaEntity.class)))
                .thenReturn(domainProduct);

        Product result = productService.getProductById(1L);

        assertNotNull(result);
        assertEquals("Son môi", result.getName());
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    void getProductById_WhenNotExists_ShouldThrowException() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(1L));
    }
}
