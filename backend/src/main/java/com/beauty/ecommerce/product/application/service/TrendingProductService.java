package com.beauty.ecommerce.product.application.service;

import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import com.beauty.ecommerce.product.adapter.out.persistence.WishlistRepository;
import com.beauty.ecommerce.product.adapter.out.persistence.mapper.ProductMapper;
import com.beauty.ecommerce.review.adapter.out.persistence.ReviewRepository;
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
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public List<Product> getWeeklyTrendingProducts(int limit) {
        log.info("Lấy danh sách {} sản phẩm xu hướng trong tuần (Tim + 5 Sao)", limit);
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        
        // 1. Lấy dữ liệu Lượt Tim (Lấy rộng ra để đảm bảo không sót ứng viên)
        List<Object[]> topFavs = wishlistRepository.findTopFavoritedProducts(startDate, PageRequest.of(0, 500));
        
        // 2. Lấy dữ liệu Đánh giá 5 Sao
        List<Object[]> topRated = reviewRepository.findTopRatedProducts(startDate, PageRequest.of(0, 500));
        
        // 3. Hợp nhất điểm số (Score Map)
        java.util.Map<Long, Long> productScores = new java.util.HashMap<>();
        
        for (Object[] row : topFavs) {
            Long productId = (Long) row[0];
            Long count = (Long) row[1];
            productScores.put(productId, productScores.getOrDefault(productId, 0L) + count);
        }
        
        for (Object[] row : topRated) {
            Long productId = (Long) row[0];
            Long count = (Long) row[1];
            productScores.put(productId, productScores.getOrDefault(productId, 0L) + count);
        }

        // 4. Sắp xếp và lấy theo limit yêu cầu
        // Thêm tiêu chí phụ (id giảm dần) để đảm bảo thứ tự luôn cố định khi bằng điểm
        List<Long> rankedProductIds = productScores.entrySet().stream()
                .sorted((entry1, entry2) -> {
                    int compare = entry2.getValue().compareTo(entry1.getValue());
                    if (compare == 0) {
                        return entry2.getKey().compareTo(entry1.getKey()); // Nếu điểm bằng nhau, ưu tiên ID lớn hơn (mới hơn)
                    }
                    return compare;
                })
                .map(java.util.Map.Entry::getKey)
                .limit(limit)
                .collect(Collectors.toList());

        if (rankedProductIds.isEmpty()) {
            log.info("Không có dữ liệu Trending (Tim/5 Sao), chuyển sang lấy sản phẩm nhiều lượt xem nhất");
            return productRepository.findTop10ByStatusOrderByViewCountDesc("ACTIVE").stream()
                    .limit(limit)
                    .map(productMapper::mapToDomainEntity)
                    .collect(Collectors.toList());
        }

        // 5. Lấy thông tin chi tiết sản phẩm và giữ nguyên thứ tự xếp hạng
        List<ProductJpaEntity> entities = productRepository.findAllById(rankedProductIds);
        
        // Sắp xếp lại danh sách entities theo đúng thứ tự của rankedProductIds và CHỈ LẤY ACTIVE
        return rankedProductIds.stream()
                .map(id -> entities.stream()
                        .filter(e -> e.getId().equals(id) && "ACTIVE".equals(e.getStatus()))
                        .findFirst()
                        .orElse(null))
                .filter(java.util.Objects::nonNull)
                .map(productMapper::mapToDomainEntity)
                .collect(Collectors.toList());
    }
}
