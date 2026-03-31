package com.beauty.ecommerce.product.application.service;

import com.beauty.ecommerce.common.exception.ResourceNotFoundException;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import com.beauty.ecommerce.product.adapter.out.persistence.mapper.ProductMapper;
import com.beauty.ecommerce.product.application.port.in.GetProductUseCase;
import com.beauty.ecommerce.product.domain.entity.Product;
import com.beauty.ecommerce.review.adapter.out.persistence.ReviewRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Slf4j
public class ProductReaderService implements GetProductUseCase {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ReviewRepository reviewRepository;

    @Override
    public Page<Product> getAllProducts(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String keyword, String sortBy, Pageable pageable) {
        log.info("Đang lấy danh sách sản phẩm với bộ lọc và phân trang");
        
        Specification<ProductJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("categoryId"), categoryId));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("currentPrice"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("currentPrice"), maxPrice));
            }

            if (keyword != null && !keyword.isBlank()) {
                String lk = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), lk),
                        cb.like(cb.lower(root.get("description")), lk)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // Note: We use the sort from pageable if provided, otherwise default to createdAt DESC
        Page<ProductJpaEntity> entities = productRepository.findAll(spec, pageable);
        
        List<Product> domainProducts = entities.getContent().stream()
                .map(productMapper::mapToDomainEntity)
                .collect(Collectors.toList());
        
        return new PageImpl<>(domainProducts, pageable, entities.getTotalElements());
    }

    @Override
    public Product getProductById(Long id) {
        log.info("Đang lấy thông tin chi tiết sản phẩm ID: {}", id);
        ProductJpaEntity entity = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id));
        return productMapper.mapToDomainEntity(entity);
    }
}
