package com.beauty.ecommerce.review.adapter.in.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ReviewController {

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<String> getProductReviews(@PathVariable Long productId) {
        // TODO: Call GetProductReviewsUseCase
        return ResponseEntity.ok("Reviews for product " + productId);
    }

    @PostMapping("/reviews")
    public ResponseEntity<String> createReview() {
        // TODO: Call AddReviewUseCase
        return ResponseEntity.ok("Review added successfully");
    }
}
