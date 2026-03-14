package com.beauty.ecommerce.user.adapter.in.web.request;

import lombok.Data;

@Data
public class RegisterUserRequest {
    private String email;
    private String password;
    private String fullName;
}
