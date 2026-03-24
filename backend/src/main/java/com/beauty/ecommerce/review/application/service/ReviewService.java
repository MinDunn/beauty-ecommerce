package com.beauty.ecommerce.review.application.service;

import com.beauty.ecommerce.common.exception.BadRequestException;
import com.beauty.ecommerce.common.exception.ResourceNotFoundException;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import com.beauty.ecommerce.review.adapter.in.web.request.CreateReviewRequest;
import com.beauty.ecommerce.review.adapter.in.web.response.ReviewResponse;
import com.beauty.ecommerce.review.adapter.out.persistence.ReviewJpaEntity;
import com.beauty.ecommerce.review.adapter.out.persistence.ReviewRepository;
import com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public ReviewResponse createReview(Long productId, String userEmail, CreateReviewRequest request) {
        log.info("Khởi tạo đánh giá cho sản phẩm ID: {} bởi người dùng: {}", productId, userEmail);
        // Kiểm tra sản phẩm có tồn tại không
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + productId);
        }

        // Lấy thông tin user
        UserJpaEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        // Kiểm tra user đã đánh giá sản phẩm này chưa
        List<ReviewJpaEntity> existingReviews = reviewRepository.findByProductId(productId);
        boolean alreadyReviewed = existingReviews.stream()
                .anyMatch(r -> r.getUserId().equals(user.getId()));
        if (alreadyReviewed) {
            throw new BadRequestException("Bạn đã đánh giá sản phẩm này rồi");
        }

        // Tạo review
        ReviewJpaEntity review = ReviewJpaEntity.builder()
                .userId(user.getId())
                .productId(productId)
                .ratingStar(request.getRatingStar())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        reviewRepository.save(review);

        return mapToResponse(review, user.getFullName());
    }

    public List<ReviewResponse> getReviewsByProductId(Long productId) {
        log.info("Lấy danh sách đánh giá cho sản phẩm ID: {}", productId);
        // Kiểm tra sản phẩm có tồn tại không
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + productId);
        }

        List<ReviewJpaEntity> reviews = reviewRepository.findByProductId(productId);
        return reviews.stream()
                .map(review -> {
                    String fullName = userRepository.findById(review.getUserId())
                            .map(UserJpaEntity::getFullName)
                            .orElse("Ẩn danh");
                    return mapToResponse(review, fullName);
                })
                .collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(ReviewJpaEntity review, String userFullName) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUserId())
                .userFullName(userFullName)
                .productId(review.getProductId())
                .ratingStar(review.getRatingStar())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
