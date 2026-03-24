package com.beauty.ecommerce.user.adapter.in.web.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TokenRefreshRequest {
    @NotBlank(message = "Refresh token không được để trống")
    private String refreshToken;
}
