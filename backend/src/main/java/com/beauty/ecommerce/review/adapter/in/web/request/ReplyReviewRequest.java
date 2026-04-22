package com.beauty.ecommerce.review.adapter.in.web.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReplyReviewRequest {
    @NotBlank(message = "Nội dung phản hồi không được để trống")
    private String reply;
}
