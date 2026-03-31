package com.beauty.ecommerce.order.adapter.out.persistence.mapper;

import com.beauty.ecommerce.order.adapter.out.persistence.OrderJpaEntity;
import com.beauty.ecommerce.order.adapter.out.persistence.OrderItemJpaEntity;
import com.beauty.ecommerce.order.domain.entity.Order;
import com.beauty.ecommerce.order.domain.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public Order mapToDomainEntity(OrderJpaEntity jpaEntity) {
        return Order.builder()
                .id(jpaEntity.getId())
                .userId(jpaEntity.getUser().getId())
                .orderDate(jpaEntity.getOrderDate())
                .totalPrice(jpaEntity.getTotalPrice())
                .status(jpaEntity.getStatus())
                .receiverName(jpaEntity.getReceiverName())
                .receiverPhone(jpaEntity.getReceiverPhone())
                .shippingAddress(jpaEntity.getShippingAddress())
                .items(jpaEntity.getItems().stream()
                        .map(this::mapToOrderItemDomainEntity)
                        .collect(Collectors.toList()))
                .build();
    }

    private OrderItem mapToOrderItemDomainEntity(OrderItemJpaEntity jpaEntity) {
        return OrderItem.builder()
                .id(jpaEntity.getId())
                .productId(jpaEntity.getProduct().getId())
                .productName(jpaEntity.getProduct().getName())
                .productImageUrl(jpaEntity.getProduct().getImageUrl())
                .quantity(jpaEntity.getQuantity())
                .price(jpaEntity.getPrice())
                .build();
    }
}
