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
        
        review = reviewRepository.save(review);

        String productName = productRepository.findById(productId)
                .map(p -> p.getName())
                .orElse("Sản phẩm không xác định");

        return mapToResponse(review, user.getFullName(), productName);
    }

    public List<ReviewResponse> getReviewsByProductId(Long productId) {
        log.info("Lấy danh sách đánh giá cho sản phẩm ID: {}", productId);
        // Kiểm tra sản phẩm có tồn tại không
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + productId);
        }

        List<ReviewJpaEntity> reviews = reviewRepository.findByProductId(productId);
        String productName = productRepository.findById(productId)
                .map(p -> p.getName())
                .orElse("Sản phẩm không xác định");

        return reviews.stream()
                .map(review -> {
                    String fullName = userRepository.findById(review.getUserId())
                            .map(UserJpaEntity::getFullName)
                            .orElse("Ẩn danh");
                    return mapToResponse(review, fullName, productName);
                })
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getAllReviews() {
        log.info("Admin đang lấy danh sách tất cả đánh giá");
        List<ReviewJpaEntity> reviews = reviewRepository.findAll();
        return reviews.stream()
                .map(review -> {
                    String fullName = userRepository.findById(review.getUserId())
                            .map(UserJpaEntity::getFullName)
                            .orElse("Ẩn danh");
                    String productName = productRepository.findById(review.getProductId())
                            .map(p -> p.getName())
                            .orElse("Sản phẩm không xác định");
                    return mapToResponse(review, fullName, productName);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse replyToReview(Long reviewId, String reply) {
        log.info("Admin phản hồi đánh giá ID: {}", reviewId);
        ReviewJpaEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá"));

        review.setAdminReply(reply);
        review.setRepliedAt(LocalDateTime.now());
        
        review = reviewRepository.save(review);
        
        String fullName = userRepository.findById(review.getUserId())
                .map(UserJpaEntity::getFullName)
                .orElse("Ẩn danh");
        String productName = productRepository.findById(review.getProductId())
                .map(p -> p.getName())
                .orElse("Sản phẩm không xác định");
                
        return mapToResponse(review, fullName, productName);
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, String userEmail, com.beauty.ecommerce.review.adapter.in.web.request.UpdateReviewRequest request) {
        log.info("User {} cập nhật đánh giá ID: {}", userEmail, reviewId);
        ReviewJpaEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá"));

        UserJpaEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (!review.getUserId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa đánh giá này");
        }

        review.setRatingStar(request.getRatingStar());
        review.setComment(request.getComment());
        // Khi user sửa đánh giá, có thể xóa phản hồi cũ của admin để admin phản hồi lại thông tin mới
        // Hoặc giữ nguyên tùy requirement. Ở đây tôi giữ nguyên.
        
        review = reviewRepository.save(review);
        
        String productName = productRepository.findById(review.getProductId())
                .map(p -> p.getName())
                .orElse("Sản phẩm không xác định");
                
        return mapToResponse(review, user.getFullName(), productName);
    }

    private ReviewResponse mapToResponse(ReviewJpaEntity review, String userFullName, String productName) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUserId())
                .userFullName(userFullName)
                .productId(review.getProductId())
                .productName(productName)
                .ratingStar(review.getRatingStar())
                .comment(review.getComment())
                .adminReply(review.getAdminReply())
                .repliedAt(review.getRepliedAt() != null ? review.getRepliedAt().toString() + "Z" : null)
                .createdAt(review.getCreatedAt().toString() + "Z")
                .build();
    }
}
