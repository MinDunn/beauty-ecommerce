package com.beauty.ecommerce.product.adapter.in.web;

import com.beauty.ecommerce.common.dto.ApiResponse;
import com.beauty.ecommerce.product.application.service.WishlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Slf4j
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Long>>> getWishlist(Authentication authentication) {
        log.info("Lấy danh sách ID sản phẩm trong wishlist của {}", authentication.getName());
        List<Long> productIds = wishlistService.getWishlistProductIds(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(productIds));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(@PathVariable Long productId, Authentication authentication) {
        log.info("Thêm vào wishlist: productId={}, email={}", productId, authentication.getName());
        wishlistService.addToWishlist(productId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Đã thêm vào danh sách yêu thích", null));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(@PathVariable Long productId, Authentication authentication) {
        log.info("Xóa khỏi wishlist: productId={}, email={}", productId, authentication.getName());
        wishlistService.removeFromWishlist(productId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Đã xóa khỏi danh sách yêu thích", null));
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<Boolean>> checkWishlist(@PathVariable Long productId, Authentication authentication) {
        boolean isInWishlist = wishlistService.isInWishlist(productId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(isInWishlist));
    }
}
