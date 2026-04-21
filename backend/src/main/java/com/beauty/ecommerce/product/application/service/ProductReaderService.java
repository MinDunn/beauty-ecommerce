package com.beauty.ecommerce.product.application.service;

import com.beauty.ecommerce.category.adapter.out.persistence.CategoryJpaEntity;
import com.beauty.ecommerce.category.adapter.out.persistence.CategoryRepository;
import com.beauty.ecommerce.common.exception.ResourceNotFoundException;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import com.beauty.ecommerce.product.adapter.out.persistence.mapper.ProductMapper;
import com.beauty.ecommerce.product.application.port.in.GetProductUseCase;
import com.beauty.ecommerce.product.domain.entity.Product;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final CategoryRepository categoryRepository;
    private final TrendingProductService trendingProductService;

    @Override
    public Page<Product> getAllProducts(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String keyword, String sortBy, Boolean onSale, String skinType, Boolean includeHidden, Pageable pageable) {
        log.info("Đang lấy danh sách sản phẩm với bộ lọc: categoryId={}, minPrice={}, maxPrice={}, keyword={}, sortBy={}, onSale={}, skinType={}, includeHidden={}", 
                categoryId, minPrice, maxPrice, keyword, sortBy, onSale, skinType, includeHidden);
        
        Specification<ProductJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Mặc định chỉ lấy sản phẩm ACTIVE nếu không yêu cầu xem hàng ẩn
            if (includeHidden == null || !includeHidden) {
                predicates.add(cb.equal(root.get("status"), "ACTIVE"));
            }

            if (categoryId != null) {
                List<Long> allCategoryIds = getAllChildCategoryIds(categoryId);
                predicates.add(root.get("categoryId").in(allCategoryIds));
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

            if (onSale != null && onSale) {
                predicates.add(cb.lessThan(root.get("currentPrice"), root.get("originalPrice")));
            }

            if (skinType != null && !skinType.isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("skinType")), skinType.toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // TRƯỜNG HỢP ĐẶC BIỆT: Sắp xếp theo Trending (Lượt Tim + 5 Sao)
        if ("trending".equals(sortBy)) {
            log.info("Sử dụng thuật toán Trending (Tim + 5 Sao) cho danh sách sản phẩm");
            List<Product> trendingList = trendingProductService.getWeeklyTrendingProducts(100); 
            
            // Xử lý phân trang thủ công cho danh sách Trending
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), trendingList.size());
            
            List<Product> pagedList = new ArrayList<>();
            if (start < trendingList.size()) {
                pagedList = trendingList.subList(start, end);
            }
            
            return new PageImpl<>(pagedList, pageable, trendingList.size());
        }

        // Các trường hợp sắp xếp thông thường
        log.info("Thực hiện truy vấn với Sort: {}", pageable.getSort());
        
        // Luôn luôn ưu tiên hàng còn hàng lên đầu tiên (availabilityPriority DESC)
        Sort customSort = Sort.by(Sort.Order.desc("availabilityPriority"));
        if (pageable.getSort().isSorted()) {
            customSort = customSort.and(pageable.getSort());
        }
        
        org.springframework.data.domain.PageRequest customPageable = org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                customSort
        );

        Page<ProductJpaEntity> entities = productRepository.findAll(spec, customPageable);
        
        List<Product> domainProducts = entities.getContent().stream()
                .map(productMapper::mapToDomainEntity)
                .collect(Collectors.toList());
        
        return new PageImpl<>(domainProducts, pageable, entities.getTotalElements());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public Product getProductById(Long id) {
        log.info("Đang lấy thông tin chi tiết và tăng lượt xem sản phẩm ID: {}", id);
        ProductJpaEntity entity = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id));
        
        return productMapper.mapToDomainEntity(entity);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void incrementViewCount(Long id) {
        log.info("Đang tăng lượt xem thủ công cho sản phẩm ID: {}", id);
        ProductJpaEntity entity = productRepository.findById(id)
                .orElse(null);
        if (entity != null) {
            entity.setViewCount(entity.getViewCount() != null ? entity.getViewCount() + 1 : 1L);
            productRepository.save(entity);
        }
    }

    @Override
    public List<Product> getTrendingProducts(int limit) {
        return trendingProductService.getWeeklyTrendingProducts(limit);
    }

    private List<Long> getAllChildCategoryIds(Long parentId) {
        List<Long> ids = new ArrayList<>();
        ids.add(parentId);
        
        List<CategoryJpaEntity> children = categoryRepository.findByParentId(parentId);
        if (children != null && !children.isEmpty()) {
            for (CategoryJpaEntity child : children) {
                ids.addAll(getAllChildCategoryIds(child.getId()));
            }
        }
        return ids;
    }
}
