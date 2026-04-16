package com.beauty.ecommerce.product.application.service;

import com.beauty.ecommerce.common.exception.BadRequestException;
import com.beauty.ecommerce.common.exception.ResourceNotFoundException;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import com.beauty.ecommerce.product.adapter.out.persistence.WishlistJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.WishlistRepository;
import com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.beauty.ecommerce.product.adapter.out.persistence.mapper.ProductMapper;
import com.beauty.ecommerce.product.domain.entity.Product;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    private static final int WISHLIST_LIMIT = 100;

    @Transactional
    public void addToWishlist(Long productId, String userEmail) {
        log.info("Thêm sản phẩm {} vào wishlist của {}", productId, userEmail);
        UserJpaEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Sản phẩm không tồn tại");
        }

        if (wishlistRepository.findByUserIdAndProductId(user.getId(), productId).isPresent()) {
            return; // Đã có trong wishlist
        }

        long currentCount = wishlistRepository.countByUserId(user.getId());
        if (currentCount >= WISHLIST_LIMIT) {
            throw new BadRequestException("Danh sách yêu thích đã đầy (tối đa " + WISHLIST_LIMIT + " sản phẩm)");
        }

        WishlistJpaEntity wishlist = WishlistJpaEntity.builder()
                .userId(user.getId())
                .productId(productId)
                .createdAt(LocalDateTime.now())
                .build();

        wishlistRepository.save(wishlist);
    }

    @Transactional
    public void removeFromWishlist(Long productId, String userEmail) {
        log.info("Xóa sản phẩm {} khỏi wishlist của {}", productId, userEmail);
        UserJpaEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    public List<Product> getWishlistProducts(String userEmail) {
        UserJpaEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        List<Long> productIds = wishlistRepository.findByUserId(user.getId()).stream()
                .map(WishlistJpaEntity::getProductId)
                .toList();

        return productRepository.findAllById(productIds).stream()
                .map(productMapper::mapToDomainEntity)
                .toList();
    }
    
    public boolean isInWishlist(Long productId, String userEmail) {
        UserJpaEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        return wishlistRepository.findByUserIdAndProductId(user.getId(), productId).isPresent();
    }
}
