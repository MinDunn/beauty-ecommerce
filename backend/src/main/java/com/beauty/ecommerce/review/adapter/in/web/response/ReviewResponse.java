package com.beauty.ecommerce.review.adapter.in.web.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long productId;
    private String productName;
    private Integer ratingStar;
    private String comment;
    private String createdAt;
}
