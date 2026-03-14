package com.beauty.ecommerce.user.adapter.in.web.request;

import lombok.Data;

@Data
public class LoginUserRequest {
    private String email;
    private String password;
}
