package com.beauty.ecommerce.order.domain.entity;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    SHIPPING,
    DELIVERED,
    CANCELLATION_REQUESTED,
    CANCELLED
}
