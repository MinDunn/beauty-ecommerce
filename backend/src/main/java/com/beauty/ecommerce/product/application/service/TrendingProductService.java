package com.beauty.ecommerce.product.application.service;

import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import com.beauty.ecommerce.product.adapter.out.persistence.WishlistRepository;
import com.beauty.ecommerce.product.adapter.out.persistence.mapper.ProductMapper;
import com.beauty.ecommerce.product.domain.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrendingProductService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public List<Product> getWeeklyTrendingProducts(int limit) {
        log.info("Lấy danh sách {} sản phẩm xu hướng trong tuần", limit);
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        
        List<Object[]> topProductIds = wishlistRepository.findTopFavoritedProducts(startDate, PageRequest.of(0, limit));
        
        List<Long> productIds = topProductIds.stream()
                .map(obj -> (Long) obj[0])
                .collect(Collectors.toList());

        if (productIds.isEmpty()) {
            // Nếu không có sản phẩm xu hướng tuần này, lấy sản phẩm mới nhất làm mặc định
            return productRepository.findAll(PageRequest.of(0, limit)).stream()
                    .map(productMapper::mapToDomainEntity)
                    .collect(Collectors.toList());
        }

        return productRepository.findAllById(productIds).stream()
                .map(productMapper::mapToDomainEntity)
                .collect(Collectors.toList());
    }
}
